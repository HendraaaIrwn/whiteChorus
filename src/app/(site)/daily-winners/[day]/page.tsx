import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  MotionPage,
  Reveal,
  RevealAside,
} from "@/components/motion/motion-primitives";
import { FallbackImage } from "@/components/ui/fallback-image";
import { getDailyWinner } from "@/features/daily-winners/daily-winners";
import { productionAssets } from "@/features/dress-up/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ day: string }>;
}): Promise<Metadata> {
  const day = (await params).day;
  const winner = await getDailyWinner(day);
  if (!winner) return { title: "Winner unavailable", robots: { index: false } };
  return {
    title: `Daily Winner ${winner.dayKey}`,
    alternates: { canonical: `/daily-winners/${winner.dayKey}` },
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
  const winner = await getDailyWinner((await params).day);
  if (!winner) notFound();
  return (
    <MotionPage className="page detail-page">
      <Link className="back-link" href="/daily-winners">
        ← BACK TO DAILY WINNERS
      </Link>
      <div className="detail-layout">
        <Reveal className="detail-image" inView={false}>
          <FallbackImage
            src={winner.imageUrl}
            fallbackSrc={productionAssets.defaultLookPath}
            width="1200"
            height="1600"
            sizes="(max-width: 800px) 100vw, 62vw"
            alt={`Daily winning White Chorus look ${winner.shortCode}.`}
          />
        </Reveal>
        <RevealAside className="detail-panel" delay={0.08} distance={12} inView={false}>
          <p className="eyebrow">Winner for {winner.dayKey}</p>
          <h1>ANONYMOUS LOOK #{winner.shortCode}</h1>
          <p>
            {winner.finalAverage.toFixed(1)} ★ · {winner.finalRatingCount} final
            ratings
          </p>
          <p>Final weighted score: {winner.finalWeightedScore.toFixed(3)}</p>
          <Link className="button button--primary button--md" href="/studio">
            BACK TO STUDIO
          </Link>
        </RevealAside>
      </div>
    </MotionPage>
  );
}
