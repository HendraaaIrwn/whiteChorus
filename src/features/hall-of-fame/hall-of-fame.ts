import "server-only";

import { z } from "zod";

import { publicConfig } from "@/config/public-config";
import { getDailyWinnerSourceIds } from "@/features/daily-winners/daily-winner-lookup";
import { getPrisma } from "@/server/database/prisma";
import { getGeneratedAssetStorage } from "@/server/storage/generated-asset-storage";
import type {
  HallOutfitCardDTO,
  OutfitCardDTO,
} from "@/features/outfits/outfit.types";
import { trendingScore } from "@/features/hall-of-fame/trending-score";

export const hallQuerySchema = z.object({
  sort: z.enum(["newest", "top-rated", "trending"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
});
export type HallQuery = z.infer<typeof hallQuerySchema>;
export const HALL_PAGE_SIZE = 9;

type CardRecord = {
  id: string;
  shortCode: string;
  thumbnailPath: string | null;
  ratingAverage: { toString(): string };
  ratingCount: number;
  publishedAt: Date | null;
  expiresAt: Date | null;
};

type HallCardRecord = CardRecord & {
  guestId: string;
};

function toCard(
  record: CardRecord,
  now: Date,
  dailyWinnerIds: Set<string>,
): OutfitCardDTO {
  return {
    id: record.id,
    shortCode: record.shortCode,
    thumbnailUrl:
      publicConfig.assetMode === "production" && record.thumbnailPath
        ? getGeneratedAssetStorage().publicUrl(record.thumbnailPath)
        : "",
    ratingAverage: Number(record.ratingAverage),
    ratingCount: record.ratingCount,
    publishedAt: record.publishedAt?.toISOString() ?? "",
    expiresAt: record.expiresAt?.toISOString() ?? "",
    remainingDays: record.expiresAt
      ? Math.max(
          0,
          Math.ceil((record.expiresAt.getTime() - now.getTime()) / 86_400_000),
        )
      : 0,
    isDailyWinner: dailyWinnerIds.has(record.id),
  };
}

async function toCards(records: CardRecord[], now: Date) {
  const dailyWinnerIds = await getDailyWinnerSourceIds(
    records.map((record) => record.id),
  );
  return records.map((record) => toCard(record, now, dailyWinnerIds));
}

async function toHallCards(
  records: HallCardRecord[],
  now: Date,
  viewerGuestId?: string,
): Promise<HallOutfitCardDTO[]> {
  const outfitIds = records.map((record) => record.id);
  const [dailyWinnerIds, viewerRatings] = await Promise.all([
    getDailyWinnerSourceIds(outfitIds),
    viewerGuestId
      ? getPrisma().rating.findMany({
          where: { guestId: viewerGuestId, outfitId: { in: outfitIds } },
          select: { outfitId: true, value: true },
        })
      : Promise.resolve([]),
  ]);
  const viewerRatingByOutfit = new Map(
    viewerRatings.map((rating) => [rating.outfitId, rating.value]),
  );

  return records.map((record) => ({
    ...toCard(record, now, dailyWinnerIds),
    canRate: !viewerGuestId || record.guestId !== viewerGuestId,
    viewerRating: viewerRatingByOutfit.get(record.id) ?? null,
  }));
}

export async function getHallOfFamePage(
  query: HallQuery,
  viewerGuestId?: string,
) {
  const now = new Date();
  const pageSize = HALL_PAGE_SIZE;
  const where = {
    status: "PUBLISHED" as const,
    expiresAt: { gt: now },
    ...(query.sort === "top-rated" ? { ratingCount: { gt: 0 } } : {}),
  };
  const select = {
    id: true,
    shortCode: true,
    thumbnailPath: true,
    ratingAverage: true,
    ratingCount: true,
    publishedAt: true,
    expiresAt: true,
    guestId: true,
  };
  const totalItems = await getPrisma().outfit.count({ where });

  if (query.sort === "trending") {
    const since = new Date(now.getTime() - 86_400_000);
    const records = await getPrisma().outfit.findMany({
      where,
      select: {
        ...select,
        weightedScore: true,
        ratings: { where: { updatedAt: { gte: since } }, select: { id: true } },
        interactions: {
          where: { createdAt: { gte: since }, type: { not: "DOWNLOAD" } },
          select: { id: true },
        },
      },
    });
    const start = (query.page - 1) * pageSize;
    const rankedRecords = records
      .sort((a, b) => {
        const scoreDifference =
          trendingScore({
            recentRatings: b.ratings.length,
            recentShares: b.interactions.length,
            weightedScore: Number(b.weightedScore),
            publishedAt: b.publishedAt!,
            now,
          }) -
          trendingScore({
            recentRatings: a.ratings.length,
            recentShares: a.interactions.length,
            weightedScore: Number(a.weightedScore),
            publishedAt: a.publishedAt!,
            now,
          });
        return scoreDifference || a.id.localeCompare(b.id);
      })
      .slice(start, start + pageSize);
    const items = await toHallCards(rankedRecords, now, viewerGuestId);
    return {
      items,
      pagination: {
        page: query.page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  const records = await getPrisma().outfit.findMany({
    where,
    orderBy:
      query.sort === "newest"
        ? [{ publishedAt: "desc" }, { id: "desc" }]
        : [
            { weightedScore: "desc" },
            { ratingCount: "desc" },
            { publishedAt: "asc" },
            { id: "asc" },
          ],
    skip: (query.page - 1) * pageSize,
    take: pageSize,
    select,
  });
  return {
    items: await toHallCards(records, now, viewerGuestId),
    pagination: {
      page: query.page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
}

export async function getHomepageOutfits(take = 7): Promise<OutfitCardDTO[]> {
  const now = new Date();
  const records = await getPrisma().outfit.findMany({
    where: { status: "PUBLISHED", expiresAt: { gt: now } },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take,
    select: {
      id: true,
      shortCode: true,
      thumbnailPath: true,
      ratingAverage: true,
      ratingCount: true,
      publishedAt: true,
      expiresAt: true,
    },
  });
  return toCards(records, now);
}

export async function getRelatedOutfits(
  excludedId: string,
  take = 3,
): Promise<OutfitCardDTO[]> {
  const now = new Date();
  const records = await getPrisma().outfit.findMany({
    where: {
      id: { not: excludedId },
      status: "PUBLISHED",
      expiresAt: { gt: now },
    },
    orderBy: [{ weightedScore: "desc" }, { publishedAt: "desc" }],
    take,
    select: {
      id: true,
      shortCode: true,
      thumbnailPath: true,
      ratingAverage: true,
      ratingCount: true,
      publishedAt: true,
      expiresAt: true,
    },
  });
  return toCards(records, now);
}
