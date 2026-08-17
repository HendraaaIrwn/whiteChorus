import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    outfit: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    dailyWinner: {
      findMany: vi.fn(),
    },
    rating: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/database/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import { trendingScore } from "@/features/hall-of-fame/trending-score";
import {
  HALL_PAGE_SIZE,
  getHallOfFamePage,
  getRelatedOutfits,
} from "@/features/hall-of-fame/hall-of-fame";

const cardRecord = {
  id: "outfit-1",
  shortCode: "WC-0001",
  thumbnailPath: null,
  ratingAverage: { toString: () => "4.5" },
  ratingCount: 8,
  publishedAt: new Date("2026-08-01T00:00:00Z"),
  expiresAt: new Date("2026-08-08T00:00:00Z"),
  guestId: "owner-1",
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.dailyWinner.findMany.mockResolvedValue([]);
  prismaMock.rating.findMany.mockResolvedValue([]);
});

describe("trendingScore", () => {
  it("uses ratings, shares, weighted score, and age decay", () => {
    const now = new Date("2026-08-02T00:00:00Z");
    expect(
      trendingScore({
        recentRatings: 2,
        recentShares: 3,
        weightedScore: 4,
        publishedAt: new Date("2026-08-01T00:00:00Z"),
        now,
      }),
    ).toBe(28);
  });
});

describe("Hall of Fame presentation", () => {
  it("keeps the public gallery at twelve cards per page", () => {
    expect(HALL_PAGE_SIZE).toBe(12);
  });

  it("applies the twelve-card pagination invariant to database reads", async () => {
    prismaMock.outfit.count.mockResolvedValue(25);
    prismaMock.outfit.findMany.mockResolvedValue([]);

    const result = await getHallOfFamePage({ sort: "newest", page: 2 });

    expect(prismaMock.outfit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        skip: 12,
        take: 12,
      }),
    );
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 12,
      totalItems: 25,
      totalPages: 3,
    });
  });

  it("preserves top-rated filtering, tie-breakers, and pagination", async () => {
    prismaMock.outfit.count.mockResolvedValue(10);
    prismaMock.outfit.findMany.mockResolvedValue([]);

    await getHallOfFamePage({ sort: "top-rated", page: 2 });

    expect(prismaMock.outfit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ratingCount: { gt: 0 } }),
        orderBy: [
          { weightedScore: "desc" },
          { ratingCount: "desc" },
          { publishedAt: "asc" },
          { id: "asc" },
        ],
        skip: 12,
        take: 12,
      }),
    );
  });

  it("preserves trending ranking before applying the twelve-card page slice", async () => {
    const trendingRecords = Array.from({ length: 13 }, (_, index) => ({
      ...cardRecord,
      id: `outfit-${String(index + 1).padStart(2, "0")}`,
      shortCode: `WC-${String(index + 1).padStart(4, "0")}`,
      weightedScore: { toString: () => String(10 - index) },
      ratings: [],
      interactions: [],
    }));
    prismaMock.outfit.count.mockResolvedValue(13);
    prismaMock.outfit.findMany.mockResolvedValue(trendingRecords);

    const result = await getHallOfFamePage({ sort: "trending", page: 2 });
    const trendingQuery = prismaMock.outfit.findMany.mock.calls[0]?.[0];

    expect(trendingQuery).toEqual(
      expect.objectContaining({
        select: expect.objectContaining({
          ratings: expect.any(Object),
          interactions: expect.any(Object),
          weightedScore: true,
        }),
      }),
    );
    expect(trendingQuery).not.toHaveProperty("skip");
    expect(trendingQuery).not.toHaveProperty("take");
    expect(result.items).toHaveLength(1);
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 12,
      totalItems: 13,
      totalPages: 2,
    });
  });

  it("returns every trending look exactly once across three stable pages", async () => {
    const trendingRecords = Array.from({ length: 25 }, (_, index) => ({
      ...cardRecord,
      id: `outfit-${String(index + 1).padStart(2, "0")}`,
      shortCode: `WC-${String(index + 1).padStart(4, "0")}`,
      weightedScore: { toString: () => String(25 - index) },
      ratings: [],
      interactions: [],
    }));
    prismaMock.outfit.count.mockResolvedValue(25);
    prismaMock.outfit.findMany.mockResolvedValue(trendingRecords);

    const pages = await Promise.all(
      [1, 2, 3].map((page) => getHallOfFamePage({ sort: "trending", page })),
    );
    const pageIds = pages.map(({ items }) => items.map(({ id }) => id));
    const allIds = pageIds.flat();

    expect(pageIds.map((ids) => ids.length)).toEqual([12, 12, 1]);
    expect(allIds).toEqual(trendingRecords.map(({ id }) => id));
    expect(new Set(allIds).size).toBe(25);
    expect(pages.map(({ pagination }) => pagination.totalPages)).toEqual([
      3, 3, 3,
    ]);
  });

  it("batch-loads viewer ratings and disables self-rating", async () => {
    const secondCard = {
      ...cardRecord,
      id: "outfit-2",
      shortCode: "WC-0002",
      guestId: "viewer-1",
    };
    prismaMock.outfit.count.mockResolvedValue(2);
    prismaMock.outfit.findMany.mockResolvedValue([cardRecord, secondCard]);
    prismaMock.rating.findMany.mockResolvedValue([
      { outfitId: "outfit-2", value: 4 },
    ]);

    const result = await getHallOfFamePage(
      { sort: "newest", page: 1 },
      "viewer-1",
    );

    expect(prismaMock.rating.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.rating.findMany).toHaveBeenCalledWith({
      where: {
        guestId: "viewer-1",
        outfitId: { in: ["outfit-1", "outfit-2"] },
      },
      select: { outfitId: true, value: true },
    });
    expect(result.items).toEqual([
      expect.objectContaining({
        id: "outfit-1",
        canRate: true,
        viewerRating: null,
      }),
      expect.objectContaining({
        id: "outfit-2",
        canRate: false,
        viewerRating: 4,
      }),
    ]);
  });

  it("keeps published outfits visible before the daily winner migration", async () => {
    prismaMock.outfit.count.mockResolvedValue(1);
    prismaMock.dailyWinner.findMany.mockRejectedValue({
      code: "P2021",
      meta: { modelName: "DailyWinner" },
    });
    prismaMock.outfit.findMany.mockImplementation(
      (query: { select?: Record<string, unknown> }) => {
        if (query.select?.dailyWinner) {
          return Promise.reject({
            code: "P2021",
            meta: { modelName: "DailyWinner" },
          });
        }
        return Promise.resolve([cardRecord]);
      },
    );

    const result = await getHallOfFamePage({ sort: "newest", page: 1 });

    expect(result.items).toEqual([
      expect.objectContaining({
        id: "outfit-1",
        canRate: true,
        isDailyWinner: false,
        viewerRating: null,
      }),
    ]);
  });

  it("excludes the current look and requests four active looks in score order", async () => {
    prismaMock.outfit.findMany.mockResolvedValue([cardRecord]);
    prismaMock.dailyWinner.findMany.mockResolvedValue([
      { sourceOutfitId: "outfit-1" },
    ]);

    const related = await getRelatedOutfits("excluded-outfit");

    expect(prismaMock.outfit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { not: "excluded-outfit" },
          status: "PUBLISHED",
          expiresAt: { gt: expect.any(Date) },
        }),
        orderBy: [{ weightedScore: "desc" }, { publishedAt: "desc" }],
        take: 4,
      }),
    );
    expect(related).toEqual([
      expect.objectContaining({
        id: "outfit-1",
        shortCode: "WC-0001",
        isDailyWinner: true,
      }),
    ]);
  });
});
