import "server-only";

import { getServerEnv } from "@/config/env";
import { publicConfig } from "@/config/public-config";
import { recalculateActiveWeightedScores } from "@/features/ratings/recalculate-weighted-scores";
import { getCompletedWeekPeriod } from "@/features/weekly-winners/week-period";
import { getPrisma } from "@/server/database/prisma";
import {
  getGeneratedAssetStorage,
  type GeneratedAssetStorage,
} from "@/server/storage/generated-asset-storage";

export async function selectWeeklyWinner(
  now = new Date(),
  storage: GeneratedAssetStorage = getGeneratedAssetStorage(),
) {
  const env = getServerEnv();
  if (env.WEEKLY_WINNER_ENABLED !== "true")
    return { status: "disabled" as const };
  const period = getCompletedWeekPeriod(now, env.WEEKLY_TIMEZONE);
  const existing = await getPrisma().weeklyWinner.findUnique({
    where: { weekKey: period.key },
  });
  if (existing)
    return {
      status: "already-selected" as const,
      winnerId: existing.id,
      weekKey: period.key,
    };
  await recalculateActiveWeightedScores();
  const candidate = await getPrisma().outfit.findFirst({
    where: {
      status: "PUBLISHED",
      expiresAt: { gt: now },
      isCompetitionEligible: true,
      publishedAt: { gte: period.start, lt: period.end },
      ratingCount: { gte: env.WEEKLY_MIN_RATINGS },
      finalImagePath: { not: null },
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
    return { status: "no-eligible-winner" as const, weekKey: period.key };
  const winnerImagePath = `weekly-winners/${period.key}/winner.webp`;
  const socialImagePath = candidate.socialImagePath
    ? `weekly-winners/${period.key}/social.jpg`
    : null;
  const copied: string[] = [];
  try {
    await storage.copy(candidate.finalImagePath, winnerImagePath);
    copied.push(winnerImagePath);
    if (candidate.socialImagePath && socialImagePath) {
      await storage.copy(candidate.socialImagePath, socialImagePath);
      copied.push(socialImagePath);
    }
    const winner = await getPrisma().weeklyWinner.create({
      data: {
        sourceOutfitId: candidate.id,
        weekKey: period.key,
        weekStart: period.start,
        weekEnd: period.end,
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
      weekKey: period.key,
    };
  } catch (error) {
    await storage.delete(copied).catch(() => undefined);
    const raced = await getPrisma().weeklyWinner.findUnique({
      where: { weekKey: period.key },
    });
    if (raced)
      return {
        status: "already-selected" as const,
        winnerId: raced.id,
        weekKey: period.key,
      };
    throw error;
  }
}

export async function listWeeklyWinners() {
  const storage = getGeneratedAssetStorage();
  const records = await getPrisma().weeklyWinner.findMany({
    orderBy: { weekStart: "desc" },
  });
  return records.map((winner) => ({
    id: winner.id,
    weekKey: winner.weekKey.trim(),
    shortCode: winner.shortCode,
    imageUrl:
      publicConfig.assetMode === "production"
        ? storage.publicUrl(winner.winnerImagePath)
        : "",
    finalAverage: Number(winner.finalAverage),
    finalRatingCount: winner.finalRatingCount,
    finalWeightedScore: Number(winner.finalWeightedScore),
    weekStart: winner.weekStart.toISOString(),
    weekEnd: winner.weekEnd.toISOString(),
  }));
}
