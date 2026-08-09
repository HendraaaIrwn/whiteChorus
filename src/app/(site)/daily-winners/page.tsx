import type { Metadata } from "next";

import { getServerEnv } from "@/config/env";
import { getCompletedDayPeriod } from "@/features/daily-winners/day-period";
import {
  getLiveDailyRanking,
  listDailyWinners,
} from "@/features/daily-winners/daily-winners";
import {
  DailyWinnerArchive,
  DailyWinnerCta,
  DailyWinnerHero,
  DailyWinnerStage,
} from "@/features/daily-winners/daily-winner-scenes";
import { LiveDailyRanking } from "@/features/daily-winners/live-daily-ranking";
import { CustomCursor } from "@/features/home/home-motion";

export const metadata: Metadata = {
  title: "Daily Winner & Live Ranking",
  description:
    "See the finalized White Chorus Daily Winner and follow today's provisional ranking as real ratings change.",
  alternates: { canonical: "/daily-winners" },
};
export const dynamic = "force-dynamic";

export default async function DailyWinnersPage() {
  const completedDayKey = getCompletedDayPeriod(
    new Date(),
    getServerEnv().DAILY_TIMEZONE,
  ).key;
  const [winnersResult, rankingResult] = await Promise.allSettled([
    listDailyWinners(7),
    getLiveDailyRanking(),
  ]);
  const winners =
    winnersResult.status === "fulfilled" ? winnersResult.value : [];
  const latestWinner =
    winners.find((winner) => winner.dayKey === completedDayKey) ?? null;
  const previousWinners = winners.filter(
    (winner) =>
      winner.id !== latestWinner?.id && winner.dayKey < completedDayKey,
  );
  const winnerState =
    winnersResult.status === "rejected"
      ? "error"
      : latestWinner
        ? "winner"
        : "empty";

  return (
    <div className="winner-page" data-winner-page>
      <CustomCursor scope="winner" />
      <DailyWinnerHero />
      <DailyWinnerStage
        completedDayKey={completedDayKey}
        state={winnerState}
        winner={latestWinner}
      />
      <LiveDailyRanking
        initialRanking={
          rankingResult.status === "fulfilled" ? rankingResult.value : null
        }
      />
      <DailyWinnerArchive winners={previousWinners} />
      <DailyWinnerCta sectionNumber={previousWinners.length ? "05" : "04"} />
    </div>
  );
}
