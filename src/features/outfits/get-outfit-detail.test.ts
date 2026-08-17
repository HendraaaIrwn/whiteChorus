import { beforeEach, describe, expect, it, vi } from "vitest";

const { dailyWinnerIds, prismaMock, storageMock } = vi.hoisted(() => ({
  dailyWinnerIds: new Set<string>(),
  prismaMock: {
    outfit: { findUnique: vi.fn() },
    rating: { findUnique: vi.fn() },
  },
  storageMock: {
    publicUrl: vi.fn((path: string) => `https://storage.test/${path}`),
  },
}));

vi.mock("@/server/database/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/server/storage/generated-asset-storage", () => ({
  getGeneratedAssetStorage: () => storageMock,
}));

vi.mock("@/features/daily-winners/daily-winner-lookup", () => ({
  getDailyWinnerSourceIds: () => Promise.resolve(dailyWinnerIds),
}));

vi.mock("@/config/public-config", () => ({
  publicConfig: { assetMode: "production" },
}));

import { getOutfitDetail } from "@/features/outfits/get-outfit-detail";

const publishedOutfit = {
  id: "outfit-1",
  guestId: "owner-1",
  shortCode: "WC-0042",
  status: "PUBLISHED",
  thumbnailPath: "outfits/outfit-1/thumb.webp",
  finalImagePath: "outfits/outfit-1/final.webp",
  downloadImagePath: "outfits/outfit-1/download.png",
  socialImagePath: "outfits/outfit-1/social.jpg",
  ratingAverage: { toString: () => "4.25" },
  ratingCount: 12,
  publishedAt: new Date("2026-08-08T08:00:00.000Z"),
  expiresAt: new Date("2099-08-15T08:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  dailyWinnerIds.clear();
  prismaMock.outfit.findUnique.mockResolvedValue(publishedOutfit);
  prismaMock.rating.findUnique.mockResolvedValue(null);
});

describe("getOutfitDetail viewer state", () => {
  it("marks the publishing guest as owner and prevents self-rating", async () => {
    dailyWinnerIds.add("outfit-1");

    const detail = await getOutfitDetail("outfit-1", "owner-1");

    expect(detail).toEqual(
      expect.objectContaining({
        id: "outfit-1",
        isOwner: true,
        canRate: false,
        isDailyWinner: true,
        viewerRating: null,
        finalImageUrl: "https://storage.test/outfits/outfit-1/final.webp",
        shareImageUrl: "/api/outfits/outfit-1/share-image",
      }),
    );
  });

  it("keeps another guest's existing rating editable", async () => {
    prismaMock.rating.findUnique.mockResolvedValue({ value: 4 });

    const detail = await getOutfitDetail("outfit-1", "viewer-2");

    expect(detail).toEqual(
      expect.objectContaining({
        isOwner: false,
        canRate: true,
        viewerRating: 4,
      }),
    );
    expect(prismaMock.rating.findUnique).toHaveBeenCalledWith({
      where: {
        outfitId_guestId: { outfitId: "outfit-1", guestId: "viewer-2" },
      },
      select: { value: true },
    });
  });

  it("allows an anonymous visitor to begin rating", async () => {
    const detail = await getOutfitDetail("outfit-1");

    expect(detail).toEqual(
      expect.objectContaining({
        isOwner: false,
        canRate: true,
        viewerRating: null,
      }),
    );
    expect(prismaMock.rating.findUnique).not.toHaveBeenCalled();
  });
});
