import type { Metadata } from "next";

import { getServerEnv } from "@/config/env";
import {
  SHOW_FAKE_DAILY_WINNER_PLACEHOLDER,
  withFakeDailyWinnerPlaceholder,
} from "@/features/daily-winners/daily-winner-debug";
import { getCompletedDayPeriod } from "@/features/daily-winners/day-period";
import {
  getDailyWinnersOverview,
  getLiveDailyRanking,
} from "@/features/daily-winners/daily-winners";
import {
  DailyWinnerArchive,
  DailyWinnerCta,
  LatestDailyWinner,
} from "@/features/daily-winners/daily-winner-scenes";
import { LiveDailyRanking } from "@/features/daily-winners/live-daily-ranking";
import { CustomCursor } from "@/features/home/home-motion";

export const metadata: Metadata = {
  title: "Daily Winner & Live Ranking",
  description:
    "See the latest finalized White Chorus Daily Winner and follow the active provisional ranking as real ratings change.",
  alternates: { canonical: "/daily-winners" },
};
export const dynamic = "force-dynamic";

export default async function DailyWinnersPage() {
  const now = new Date();
  const completedDayKey = getCompletedDayPeriod(
    now,
    getServerEnv().DAILY_TIMEZONE,
  ).key;
  const [overviewResult, rankingResult] = await Promise.allSettled([
    getDailyWinnersOverview(now),
    getLiveDailyRanking({ now, page: 1 }),
  ]);
  const overview =
    overviewResult.status === "fulfilled"
      ? overviewResult.value
      : { latestWinner: null, completedDays: [] };
  const displayedWinners = withFakeDailyWinnerPlaceholder({
    winners: [overview.latestWinner, ...overview.completedDays].filter(
      (winner) => winner !== null,
    ),
    completedDayKey,
    enabled: SHOW_FAKE_DAILY_WINNER_PLACEHOLDER,
  });
  const latestWinner = displayedWinners[0] ?? null;
  const completedDays = displayedWinners.slice(1, 8);
  const latestState = latestWinner
    ? "winner"
    : overviewResult.status === "rejected"
      ? "error"
      : "empty";

  return (
    <div className="winner-page" data-winner-page>
      <CustomCursor scope="winner" />
      <LatestDailyWinner
        completedDayKey={completedDayKey}
        state={latestState}
        winner={latestWinner}
      />
      <LiveDailyRanking
        initialRanking={
          rankingResult.status === "fulfilled" ? rankingResult.value : null
        }
      />
      <DailyWinnerArchive winners={completedDays} />
      <DailyWinnerCta sectionNumber="04" />
    </div>
  );
}
