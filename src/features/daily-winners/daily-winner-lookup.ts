import "server-only";

import { getPrisma } from "@/server/database/prisma";

type PrismaErrorShape = {
  code?: unknown;
  meta?: { modelName?: unknown };
};

export function isMissingDailyWinnerTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const prismaError = error as PrismaErrorShape;
  return (
    prismaError.code === "P2021" &&
    prismaError.meta?.modelName === "DailyWinner"
  );
}

export async function getDailyWinnerSourceIds(outfitIds: string[]) {
  if (!outfitIds.length) return new Set<string>();

  try {
    const winners = await getPrisma().dailyWinner.findMany({
      where: { sourceOutfitId: { in: outfitIds } },
      select: { sourceOutfitId: true },
    });
    return new Set(
      winners.flatMap((winner) =>
        winner.sourceOutfitId ? [winner.sourceOutfitId] : [],
      ),
    );
  } catch (error) {
    if (isMissingDailyWinnerTable(error)) return new Set<string>();
    throw error;
  }
}
