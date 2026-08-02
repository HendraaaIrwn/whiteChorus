import "server-only";

import { z } from "zod";

import { publicConfig } from "@/config/public-config";
import { getPrisma } from "@/server/database/prisma";
import { getGeneratedAssetStorage } from "@/server/storage/generated-asset-storage";
import type { OutfitCardDTO } from "@/features/outfits/outfit.types";
import { trendingScore } from "@/features/hall-of-fame/trending-score";

export const hallQuerySchema = z.object({
  sort: z.enum(["newest", "top-rated", "trending"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
});
export type HallQuery = z.infer<typeof hallQuerySchema>;

type CardRecord = {
  id: string;
  shortCode: string;
  thumbnailPath: string | null;
  ratingAverage: { toString(): string };
  ratingCount: number;
  publishedAt: Date | null;
  expiresAt: Date | null;
};

function toCard(record: CardRecord, now: Date): OutfitCardDTO {
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
  };
}

export async function getHallOfFamePage(query: HallQuery) {
  const now = new Date();
  const pageSize = 9;
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
    const items = records
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
      .slice(start, start + pageSize)
      .map((record) => toCard(record, now));
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
    items: records.map((record) => toCard(record, now)),
    pagination: {
      page: query.page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
}

export async function getFeaturedOutfits(): Promise<OutfitCardDTO[]> {
  const now = new Date();
  const records = await getPrisma().outfit.findMany({
    where: { status: "PUBLISHED", expiresAt: { gt: now } },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: 3,
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
  return records.map((record) => toCard(record, now));
}
