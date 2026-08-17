import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, storageMock } = vi.hoisted(() => ({
  prismaMock: {
    $executeRawUnsafe: vi.fn(),
    outfit: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    dailyWinner: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
  storageMock: {
    copy: vi.fn(),
    delete: vi.fn(),
    listOutfitIds: vi.fn(),
    publicUrl: vi.fn((path: string) => `https://assets.test/${path}`),
    read: vi.fn(),
    upsert: vi.fn(),
    uploadOutfit: vi.fn(),
  },
}));

vi.mock("@/config/env", () => ({
  getServerEnv: () => ({
    DAILY_MIN_RATINGS: 5,
    DAILY_TIMEZONE: "Asia/Jakarta",
    DAILY_WINNER_ENABLED: "true",
  }),
}));

vi.mock("@/server/database/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/server/storage/generated-asset-storage", () => ({
  getGeneratedAssetStorage: () => storageMock,
}));

import {
  DAILY_RANKING_PAGE_SIZE,
  getDailyWinnersOverview,
  getLiveDailyRanking,
  selectDailyWinner,
} from "@/features/daily-winners/daily-winners";

function rankingRecord(id: string, ratingCount: number, weightedScore: number) {
  return {
    id,
    shortCode: id.toUpperCase(),
    thumbnailPath: null,
    ratingAverage: 4.5,
    ratingCount,
    weightedScore,
    publishedAt: new Date("2026-08-10T08:00:00.000Z"),
  };
}

function winnerRecord(index: number) {
  const day = String(16 - index).padStart(2, "0");
  return {
    id: `winner-${index}`,
    dayKey: `2026-08-${day}`,
    shortCode: `WIN${index}`,
    winnerImagePath: `daily-winners/2026-08-${day}/winner.webp`,
    finalAverage: 4.6,
    finalRatingCount: 12,
    finalWeightedScore: 4.42,
    dayStart: new Date(`2026-08-${day}T00:00:00.000Z`),
    dayEnd: new Date(`2026-08-${day}T23:59:59.000Z`),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$executeRawUnsafe.mockResolvedValue(0);
  prismaMock.dailyWinner.findUnique.mockResolvedValue(null);
  prismaMock.outfit.findFirst.mockResolvedValue(null);
  storageMock.copy.mockResolvedValue(undefined);
  storageMock.delete.mockResolvedValue(undefined);
});

describe("live Daily Winner ranking", () => {
  it("paginates every active look and keeps global ranks across eligibility groups", async () => {
    const now = new Date("2026-08-17T08:00:00.000Z");
    const eligible = [
      rankingRecord("eligible-11", 7, 4.4),
      rankingRecord("eligible-12", 6, 4.3),
    ];
    const ineligible = Array.from({ length: 6 }, (_, index) =>
      rankingRecord(`ineligible-${index + 1}`, 4, 4.2 - index / 100),
    );
    prismaMock.outfit.count.mockImplementation(
      (query: { where?: { ratingCount?: unknown } }) =>
        Promise.resolve(query.where?.ratingCount ? 12 : 18),
    );
    prismaMock.outfit.findMany.mockImplementation(
      (query: { where?: { ratingCount?: { gte?: number; lt?: number } } }) =>
        Promise.resolve(query.where?.ratingCount?.gte ? eligible : ineligible),
    );

    const ranking = await getLiveDailyRanking({ now, page: 2 });

    expect(ranking).toMatchObject({
      page: 2,
      pageSize: 10,
      totalItems: 18,
      totalPages: 2,
    });
    expect(ranking.items).toHaveLength(8);
    expect(ranking.items.map(({ rank }) => rank)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18,
    ]);
    expect(ranking.items.slice(0, 2).every((item) => item.eligible)).toBe(true);
    expect(ranking.items.slice(2).every((item) => !item.eligible)).toBe(true);

    const activeQuery = prismaMock.outfit.count.mock.calls[0]?.[0];
    expect(activeQuery?.where).toEqual({
      status: "PUBLISHED",
      expiresAt: { gt: now },
      isCompetitionEligible: true,
      finalImagePath: { not: null },
    });
    expect(activeQuery?.where).not.toHaveProperty("publishedAt");
    expect(DAILY_RANKING_PAGE_SIZE).toBe(10);
  });

  it("clamps a stale page and represents an empty pool without a fake page", async () => {
    prismaMock.outfit.count.mockImplementation(
      (query: { where?: { ratingCount?: unknown } }) =>
        Promise.resolve(query.where?.ratingCount ? 12 : 12),
    );
    prismaMock.outfit.findMany.mockImplementation(
      (query: { where?: { ratingCount?: { gte?: number; lt?: number } } }) =>
        Promise.resolve(
          query.where?.ratingCount?.gte
            ? [
                rankingRecord("last-11", 8, 4.4),
                rankingRecord("last-12", 7, 4.3),
              ]
            : [],
        ),
    );

    await expect(getLiveDailyRanking({ page: 99 })).resolves.toMatchObject({
      page: 2,
      totalItems: 12,
      totalPages: 2,
      items: [{ rank: 11 }, { rank: 12 }],
    });

    prismaMock.outfit.count.mockResolvedValue(0);
    prismaMock.outfit.findMany.mockResolvedValue([]);

    await expect(getLiveDailyRanking({ page: 4 })).resolves.toMatchObject({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      items: [],
    });
  });
});

describe("Daily Winner snapshots", () => {
  it("returns one latest winner and at most seven distinct completed days", async () => {
    prismaMock.dailyWinner.findMany.mockResolvedValue(
      Array.from({ length: 9 }, (_, index) => winnerRecord(index)),
    );

    const overview = await getDailyWinnersOverview(
      new Date("2026-08-17T08:00:00.000Z"),
    );

    expect(overview.latestWinner?.id).toBe("winner-0");
    expect(overview.completedDays).toHaveLength(7);
    expect(overview.completedDays.map(({ id }) => id)).toEqual([
      "winner-1",
      "winner-2",
      "winner-3",
      "winner-4",
      "winner-5",
      "winner-6",
      "winner-7",
    ]);
    expect(overview.completedDays).not.toContainEqual(
      expect.objectContaining({ id: "winner-0" }),
    );
  });
});

describe("Daily Winner finalization", () => {
  it("can select an older outfit that was active at the finalized day end", async () => {
    const now = new Date("2026-08-17T17:05:00.000Z");
    const candidate = {
      id: "older-active-look",
      shortCode: "OLDER01",
      finalImagePath: "outfits/older/final.webp",
      socialImagePath: null,
      ratingAverage: 4.8,
      ratingCount: 17,
      weightedScore: 4.612,
      publishedAt: new Date("2026-08-10T08:00:00.000Z"),
    };
    prismaMock.outfit.findFirst.mockResolvedValue(candidate);
    prismaMock.dailyWinner.create.mockImplementation(
      (query: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: "daily-winner-1", ...query.data }),
    );

    await expect(selectDailyWinner(now, storageMock)).resolves.toEqual({
      status: "selected",
      winnerId: "daily-winner-1",
      dayKey: "2026-08-17",
    });

    const candidateQuery = prismaMock.outfit.findFirst.mock.calls[0]?.[0];
    const finalizedBoundary = new Date("2026-08-17T17:00:00.000Z");
    expect(candidateQuery?.where).toEqual({
      status: "PUBLISHED",
      expiresAt: { gt: finalizedBoundary },
      isCompetitionEligible: true,
      publishedAt: { lt: finalizedBoundary },
      ratingCount: { gte: 5 },
      finalImagePath: { not: null },
      dailyWinner: { is: null },
    });
    expect(candidateQuery?.where.publishedAt).not.toHaveProperty("gte");
    expect(prismaMock.dailyWinner.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sourceOutfitId: candidate.id,
        dayKey: "2026-08-17",
        finalAverage: 4.8,
        finalRatingCount: 17,
        finalWeightedScore: 4.612,
      }),
    });
  });

  it("returns no-eligible-winner when the historical candidate query is empty", async () => {
    await expect(
      selectDailyWinner(new Date("2026-08-17T17:05:00.000Z"), storageMock),
    ).resolves.toEqual({
      status: "no-eligible-winner",
      dayKey: "2026-08-17",
    });
    expect(storageMock.copy).not.toHaveBeenCalled();
    expect(prismaMock.dailyWinner.create).not.toHaveBeenCalled();
  });
});
