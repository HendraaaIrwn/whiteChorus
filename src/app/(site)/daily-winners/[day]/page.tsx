import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getServerEnv } from "@/config/env";
import {
  resolveDailyWinnerPlaceholder,
  SHOW_FAKE_DAILY_WINNER_PLACEHOLDER,
} from "@/features/daily-winners/daily-winner-debug";
import { DailyWinnerDetail } from "@/features/daily-winners/daily-winner-detail";
import { getCompletedDayPeriod } from "@/features/daily-winners/day-period";
import { getDailyWinner } from "@/features/daily-winners/daily-winners";
import { productionAssets } from "@/features/dress-up/catalog";

export const dynamic = "force-dynamic";

async function getDisplayedDailyWinner(dayKey: string) {
  const winner = await getDailyWinner(dayKey);
  const completedDayKey = getCompletedDayPeriod(
    new Date(),
    getServerEnv().DAILY_TIMEZONE,
  ).key;

  return resolveDailyWinnerPlaceholder({
    winner,
    requestedDayKey: dayKey,
    completedDayKey,
    enabled: SHOW_FAKE_DAILY_WINNER_PLACEHOLDER,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ day: string }>;
}): Promise<Metadata> {
  const day = (await params).day;
  const winner = await getDisplayedDailyWinner(day);
  if (!winner) return { title: "Winner unavailable", robots: { index: false } };
  return {
    title: `Daily Winner ${winner.dayKey}`,
    alternates: { canonical: `/daily-winners/${winner.dayKey}` },
    ...(winner.isDebugPlaceholder ? { robots: { index: false } } : {}),
    openGraph: {
      images: [winner.imageUrl || productionAssets.defaultSocialPath],
    },
  };
}

export default async function DailyWinnerPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const winner = await getDisplayedDailyWinner((await params).day);
  if (!winner) notFound();
  return <DailyWinnerDetail winner={winner} />;
}
