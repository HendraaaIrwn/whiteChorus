/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  MotionPage,
  Reveal,
  RevealAside,
} from "@/components/motion/motion-primitives";
import { listWeeklyWinners } from "@/features/weekly-winners/weekly-winners";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ week: string }>;
}): Promise<Metadata> {
  const week = (await params).week;
  const winner = (await listWeeklyWinners()).find(
    (item) => item.weekKey === week,
  );
  if (!winner) return { title: "Winner unavailable", robots: { index: false } };
  return {
    title: `Weekly Winner ${winner.weekKey}`,
    alternates: { canonical: `/weekly-winners/${winner.weekKey}` },
    openGraph: winner.imageUrl ? { images: [winner.imageUrl] } : undefined,
  };
}

export default async function WeeklyWinnerPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const week = (await params).week;
  const winner = (await listWeeklyWinners()).find(
    (item) => item.weekKey === week,
  );
  if (!winner) notFound();
  return (
    <MotionPage className="page detail-page">
      <div className="detail-layout">
        <Reveal className="detail-image" inView={false}>
          {winner.imageUrl ? (
            <img
              src={winner.imageUrl}
              width="1200"
              height="1600"
              alt={`Weekly winning White Chorus look ${winner.shortCode}.`}
            />
          ) : (
            <div className="outfit-card__placeholder" aria-hidden="true">
              ★ ♪
            </div>
          )}
        </Reveal>
        <RevealAside
          className="detail-panel"
          delay={0.08}
          distance={12}
          inView={false}
        >
          <p className="eyebrow">Week of {winner.weekKey}</p>
          <h1>ANONYMOUS LOOK #{winner.shortCode}</h1>
          <p>
            {winner.finalAverage.toFixed(1)} ★ · {winner.finalRatingCount} final
            ratings
          </p>
          <p>Final weighted score: {winner.finalWeightedScore.toFixed(3)}</p>
        </RevealAside>
      </div>
    </MotionPage>
  );
}
