import "server-only";

import { getServerEnv } from "@/config/env";
import { publicConfig } from "@/config/public-config";
import {
  getCompletedDayPeriod,
  getDayPeriod,
} from "@/features/daily-winners/day-period";
import { rankDailyCandidates } from "@/features/daily-winners/daily-ranking";
import { recalculateActiveWeightedScores } from "@/features/ratings/recalculate-weighted-scores";
import { getPrisma } from "@/server/database/prisma";
import {
  getGeneratedAssetStorage,
  type GeneratedAssetStorage,
} from "@/server/storage/generated-asset-storage";

export type DailyRankingItem = {
  id: string;
  rank: number;
  shortCode: string;
  thumbnailUrl: string;
  ratingAverage: number;
  ratingCount: number;
  weightedScore: number;
  eligible: boolean;
  ratingsNeeded: number;
  publishedAt: string;
};

export type LiveDailyRanking = {
  dayKey: string;
  dayStart: string;
  dayEnd: string;
  generatedAt: string;
  timeZone: string;
  minimumRatings: number;
  items: DailyRankingItem[];
};

export type DailyWinnerSnapshot = {
  id: string;
  dayKey: string;
  shortCode: string;
  imageUrl: string;
  finalAverage: number;
  finalRatingCount: number;
  finalWeightedScore: number;
  dayStart: string;
  dayEnd: string;
};

export async function selectDailyWinner(
  now = new Date(),
  storage: GeneratedAssetStorage = getGeneratedAssetStorage(),
) {
  const env = getServerEnv();
  if (env.DAILY_WINNER_ENABLED !== "true")
    return { status: "disabled" as const };

  const period = getCompletedDayPeriod(now, env.DAILY_TIMEZONE);
  const existing = await getPrisma().dailyWinner.findUnique({
    where: { dayKey: period.key },
  });
  if (existing)
    return {
      status: "already-selected" as const,
      winnerId: existing.id,
      dayKey: period.key,
    };

  await recalculateActiveWeightedScores();
  const candidate = await getPrisma().outfit.findFirst({
    where: {
      status: "PUBLISHED",
      expiresAt: { gt: now },
      isCompetitionEligible: true,
      publishedAt: { gte: period.start, lt: period.end },
      ratingCount: { gte: env.DAILY_MIN_RATINGS },
      finalImagePath: { not: null },
      dailyWinner: { is: null },
    },
    orderBy: [
      { weightedScore: "desc" },
      { ratingCount: "desc" },
      { ratingAverage: "desc" },
      { publishedAt: "asc" },
      { id: "asc" },
    ],
  });
  if (!candidate?.finalImagePath)
    return { status: "no-eligible-winner" as const, dayKey: period.key };

  const winnerImagePath = `daily-winners/${period.key}/winner.webp`;
  const socialImagePath = candidate.socialImagePath
    ? `daily-winners/${period.key}/social.jpg`
    : null;
  const copied: string[] = [];
  try {
    await storage.copy(candidate.finalImagePath, winnerImagePath);
    copied.push(winnerImagePath);
    if (candidate.socialImagePath && socialImagePath) {
      await storage.copy(candidate.socialImagePath, socialImagePath);
      copied.push(socialImagePath);
    }
    const winner = await getPrisma().dailyWinner.create({
      data: {
        sourceOutfitId: candidate.id,
        dayKey: period.key,
        dayStart: period.start,
        dayEnd: period.end,
        shortCode: candidate.shortCode,
        winnerImagePath,
        socialImagePath,
        finalAverage: candidate.ratingAverage,
        finalRatingCount: candidate.ratingCount,
        finalWeightedScore: candidate.weightedScore,
      },
    });
    return {
      status: "selected" as const,
      winnerId: winner.id,
      dayKey: period.key,
    };
  } catch (error) {
    await storage.delete(copied).catch(() => undefined);
    const raced = await getPrisma().dailyWinner.findUnique({
      where: { dayKey: period.key },
    });
    if (raced)
      return {
        status: "already-selected" as const,
        winnerId: raced.id,
        dayKey: period.key,
      };
    throw error;
  }
}

export async function listDailyWinners(
  take?: number,
): Promise<DailyWinnerSnapshot[]> {
  const storage = getGeneratedAssetStorage();
  const records = await getPrisma().dailyWinner.findMany({
    orderBy: { dayStart: "desc" },
    ...(take ? { take } : {}),
  });
  return records.map((winner) => ({
    id: winner.id,
    dayKey: winner.dayKey.trim(),
    shortCode: winner.shortCode,
    imageUrl:
      publicConfig.assetMode === "production"
        ? storage.publicUrl(winner.winnerImagePath)
        : "",
    finalAverage: Number(winner.finalAverage),
    finalRatingCount: winner.finalRatingCount,
    finalWeightedScore: Number(winner.finalWeightedScore),
    dayStart: winner.dayStart.toISOString(),
    dayEnd: winner.dayEnd.toISOString(),
  }));
}

export async function getDailyWinner(dayKey: string) {
  const storage = getGeneratedAssetStorage();
  const winner = await getPrisma().dailyWinner.findUnique({
    where: { dayKey },
  });
  if (!winner) return null;
  return {
    id: winner.id,
    dayKey: winner.dayKey.trim(),
    shortCode: winner.shortCode,
    imageUrl:
      publicConfig.assetMode === "production"
        ? storage.publicUrl(winner.winnerImagePath)
        : "",
    finalAverage: Number(winner.finalAverage),
    finalRatingCount: winner.finalRatingCount,
    finalWeightedScore: Number(winner.finalWeightedScore),
    dayStart: winner.dayStart.toISOString(),
    dayEnd: winner.dayEnd.toISOString(),
  };
}

export async function getLatestDailyWinner() {
  return (await listDailyWinners(1))[0] ?? null;
}

export async function getLiveDailyRanking(
  now = new Date(),
  take = 10,
): Promise<LiveDailyRanking> {
  const env = getServerEnv();
  const period = getDayPeriod(now, env.DAILY_TIMEZONE);
  const storage = getGeneratedAssetStorage();
  const records = await getPrisma().outfit.findMany({
    where: {
      status: "PUBLISHED",
      expiresAt: { gt: now },
      isCompetitionEligible: true,
      publishedAt: { gte: period.start, lt: period.end },
      finalImagePath: { not: null },
    },
    select: {
      id: true,
      shortCode: true,
      thumbnailPath: true,
      ratingAverage: true,
      ratingCount: true,
      weightedScore: true,
      publishedAt: true,
    },
  });
  const minimumRatings = env.DAILY_MIN_RATINGS;
  const ranked = rankDailyCandidates(
    records.map((record) => ({
      ...record,
      ratingAverage: Number(record.ratingAverage),
      weightedScore: Number(record.weightedScore),
    })),
    minimumRatings,
    take,
  );

  return {
    dayKey: period.key,
    dayStart: period.start.toISOString(),
    dayEnd: period.end.toISOString(),
    generatedAt: now.toISOString(),
    timeZone: env.DAILY_TIMEZONE,
    minimumRatings,
    items: ranked.map((record) => ({
      id: record.id,
      rank: record.rank,
      shortCode: record.shortCode,
      thumbnailUrl:
        publicConfig.assetMode === "production" && record.thumbnailPath
          ? storage.publicUrl(record.thumbnailPath)
          : "",
      ratingAverage: record.ratingAverage,
      ratingCount: record.ratingCount,
      weightedScore: record.weightedScore,
      eligible: record.eligible,
      ratingsNeeded: record.ratingsNeeded,
      publishedAt: record.publishedAt?.toISOString() ?? "",
    })),
  };
}
