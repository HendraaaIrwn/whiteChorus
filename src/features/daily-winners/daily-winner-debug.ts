import type { DailyWinnerSnapshot } from "@/features/daily-winners/daily-winners";

/**
 * Flip this flag to `false` to remove every fake Daily Winner placeholder.
 * This only affects presentation; it never writes to the database.
 */
export const SHOW_FAKE_DAILY_WINNER_PLACEHOLDER = true;

export type DailyWinnerDisplaySnapshot = DailyWinnerSnapshot & {
  isDebugPlaceholder?: true;
};

function createFakeDailyWinnerPlaceholder(
  dayKey: string,
): DailyWinnerDisplaySnapshot {
  const dayStart = new Date(`${dayKey}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  return {
    id: `debug-daily-winner-${dayKey}`,
    dayKey,
    shortCode: "DEBUG01",
    imageUrl: "",
    finalAverage: 4.8,
    finalRatingCount: 27,
    finalWeightedScore: 4.612,
    dayStart: dayStart.toISOString(),
    dayEnd: dayEnd.toISOString(),
    isDebugPlaceholder: true,
  };
}

export function withFakeDailyWinnerPlaceholder({
  winners,
  completedDayKey,
  enabled,
}: {
  winners: DailyWinnerSnapshot[];
  completedDayKey: string;
  enabled: boolean;
}): DailyWinnerDisplaySnapshot[] {
  if (!enabled || winners.some((winner) => winner.dayKey === completedDayKey)) {
    return winners;
  }

  return [createFakeDailyWinnerPlaceholder(completedDayKey), ...winners];
}

export function resolveDailyWinnerPlaceholder({
  winner,
  requestedDayKey,
  completedDayKey,
  enabled,
}: {
  winner: DailyWinnerSnapshot | null;
  requestedDayKey: string;
  completedDayKey: string;
  enabled: boolean;
}): DailyWinnerDisplaySnapshot | null {
  if (winner) return winner;
  if (!enabled || requestedDayKey !== completedDayKey) return null;

  return createFakeDailyWinnerPlaceholder(completedDayKey);
}
