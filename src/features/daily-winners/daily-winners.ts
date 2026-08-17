import "server-only";

import { getServerEnv } from "@/config/env";
import { publicConfig } from "@/config/public-config";
import {
  getCompletedDayPeriod,
  getDayPeriod,
} from "@/features/daily-winners/day-period";
import {
  DAILY_SCORE_ORDER_BY,
  rankDailyCandidates,
} from "@/features/daily-winners/daily-ranking";
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
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: DailyRankingItem[];
};

export const DAILY_RANKING_PAGE_SIZE = 10;

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

export type DailyWinnersOverview = {
  latestWinner: DailyWinnerSnapshot | null;
  completedDays: DailyWinnerSnapshot[];
};

type DailyWinnerRecord = {
  id: string;
  dayKey: string;
  shortCode: string;
  winnerImagePath: string;
  finalAverage: unknown;
  finalRatingCount: number;
  finalWeightedScore: unknown;
  dayStart: Date;
  dayEnd: Date;
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
      expiresAt: { gt: period.end },
      isCompetitionEligible: true,
      publishedAt: { lt: period.end },
      ratingCount: { gte: env.DAILY_MIN_RATINGS },
      finalImagePath: { not: null },
      dailyWinner: { is: null },
    },
    orderBy: [...DAILY_SCORE_ORDER_BY],
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

function toDailyWinnerSnapshot(winner: DailyWinnerRecord): DailyWinnerSnapshot {
  const storage = getGeneratedAssetStorage();
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

export async function getDailyWinner(dayKey: string) {
  const winner = await getPrisma().dailyWinner.findUnique({
    where: { dayKey },
  });
  if (!winner) return null;
  return toDailyWinnerSnapshot(winner);
}

export async function getDailyWinnersOverview(
  now = new Date(),
): Promise<DailyWinnersOverview> {
  const completedPeriod = getCompletedDayPeriod(
    now,
    getServerEnv().DAILY_TIMEZONE,
  );
  const records = await getPrisma().dailyWinner.findMany({
    where: { dayEnd: { lte: completedPeriod.end } },
    orderBy: { dayStart: "desc" },
    take: 8,
  });
  const snapshots = records.map(toDailyWinnerSnapshot);
  return {
    latestWinner: snapshots[0] ?? null,
    completedDays: snapshots.slice(1, 8),
  };
}

export async function getLiveDailyRanking({
  now = new Date(),
  page = 1,
}: {
  now?: Date;
  page?: number;
} = {}): Promise<LiveDailyRanking> {
  if (!Number.isInteger(page) || page <= 0) {
    throw new RangeError("page must be a positive integer");
  }
  const env = getServerEnv();
  const period = getDayPeriod(now, env.DAILY_TIMEZONE);
  const storage = getGeneratedAssetStorage();
  const database = getPrisma();
  const minimumRatings = env.DAILY_MIN_RATINGS;
  const activeWhere = {
    status: "PUBLISHED" as const,
    expiresAt: { gt: now },
    isCompetitionEligible: true,
    finalImagePath: { not: null },
  };
  const [totalItems, eligibleItems] = await Promise.all([
    database.outfit.count({ where: activeWhere }),
    database.outfit.count({
      where: {
        ...activeWhere,
        ratingCount: { gte: minimumRatings },
      },
    }),
  ]);
  const ineligibleItems = totalItems - eligibleItems;
  const totalPages = Math.ceil(totalItems / DAILY_RANKING_PAGE_SIZE);
  const resolvedPage = totalPages ? Math.min(page, totalPages) : 1;
  const rankOffset = (resolvedPage - 1) * DAILY_RANKING_PAGE_SIZE;
  const select = {
    id: true,
    shortCode: true,
    thumbnailPath: true,
    ratingAverage: true,
    ratingCount: true,
    weightedScore: true,
    publishedAt: true,
  };
  const readGroup = (options: {
    eligible: boolean;
    skip: number;
    take: number;
  }) =>
    options.take
      ? database.outfit.findMany({
          where: {
            ...activeWhere,
            ratingCount: options.eligible
              ? { gte: minimumRatings }
              : { lt: minimumRatings },
          },
          orderBy: [...DAILY_SCORE_ORDER_BY],
          skip: options.skip,
          take: options.take,
          select,
        })
      : Promise.resolve([]);

  let records: Awaited<ReturnType<typeof readGroup>> = [];
  if (totalItems) {
    if (rankOffset < eligibleItems) {
      const eligibleTake = Math.min(
        DAILY_RANKING_PAGE_SIZE,
        eligibleItems - rankOffset,
      );
      const eligibleRecords = await readGroup({
        eligible: true,
        skip: rankOffset,
        take: eligibleTake,
      });
      const ineligibleRecords = await readGroup({
        eligible: false,
        skip: 0,
        take: Math.min(
          DAILY_RANKING_PAGE_SIZE - eligibleRecords.length,
          ineligibleItems,
        ),
      });
      records = [...eligibleRecords, ...ineligibleRecords];
    } else {
      records = await readGroup({
        eligible: false,
        skip: rankOffset - eligibleItems,
        take: DAILY_RANKING_PAGE_SIZE,
      });
    }
  }
  const ranked = rankDailyCandidates(
    records.map((record) => ({
      ...record,
      ratingAverage: Number(record.ratingAverage),
      weightedScore: Number(record.weightedScore),
    })),
    minimumRatings,
    { rankOffset },
  );

  return {
    dayKey: period.key,
    dayStart: period.start.toISOString(),
    dayEnd: period.end.toISOString(),
    generatedAt: now.toISOString(),
    timeZone: env.DAILY_TIMEZONE,
    minimumRatings,
    page: resolvedPage,
    pageSize: DAILY_RANKING_PAGE_SIZE,
    totalItems,
    totalPages,
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
