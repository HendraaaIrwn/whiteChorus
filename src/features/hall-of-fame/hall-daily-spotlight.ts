import "server-only";

import { isMissingDailyWinnerTable } from "@/features/daily-winners/daily-winner-lookup";
import { getLatestDailyWinner } from "@/features/daily-winners/daily-winners";

export type HallDailyWinner = {
  dayKey: string;
  shortCode: string;
  imageUrl: string;
  finalAverage: number;
  finalRatingCount: number;
};

export type HallDailySpotlightState =
  | { status: "winner"; winner: HallDailyWinner }
  | { status: "open" | "not-ready" | "degraded"; winner: null };

type WinnerLoader = () => Promise<HallDailyWinner | null>;

export async function getHallDailySpotlight(
  loadWinner: WinnerLoader = getLatestDailyWinner,
): Promise<HallDailySpotlightState> {
  try {
    const winner = await loadWinner();
    return winner
      ? { status: "winner", winner }
      : { status: "open", winner: null };
  } catch (error) {
    return {
      status: isMissingDailyWinnerTable(error) ? "not-ready" : "degraded",
      winner: null,
    };
  }
}
