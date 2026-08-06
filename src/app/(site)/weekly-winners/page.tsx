/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";

import {
  MotionPage,
  RevealArticle,
  RevealHeader,
} from "@/components/motion/motion-primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { listWeeklyWinners } from "@/features/weekly-winners/weekly-winners";

export const metadata: Metadata = {
  title: "Weekly Winners",
  alternates: { canonical: "/weekly-winners" },
};
export const dynamic = "force-dynamic";

export default async function WeeklyWinnersPage() {
  const winners = await listWeeklyWinners();
  return (
    <MotionPage className="page">
      <RevealHeader className="hall-heading" inView={false}>
        <div>
          <p className="eyebrow">Permanent spotlight</p>
          <h1>WEEKLY WINNERS</h1>
          <p>The community favourites that stay after their seven-day run.</p>
        </div>
        <span aria-hidden="true">★</span>
      </RevealHeader>
      {winners.length ? (
        <div className="winner-grid">
          {winners.map((winner, index) => (
            <RevealArticle
              className="winner-card"
              key={winner.id}
              delay={Math.min(index, 3) * 0.06}
            >
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
              <div>
                <span>
                  {index === 0 ? "LATEST WINNER" : `WEEK OF ${winner.weekKey}`}
                </span>
                <h2>ANONYMOUS LOOK #{winner.shortCode}</h2>
                <p>
                  {winner.finalAverage.toFixed(1)} ★ · {winner.finalRatingCount}{" "}
                  ratings
                </p>
                <Link href={`/weekly-winners/${winner.weekKey}`}>
                  VIEW WINNER →
                </Link>
              </div>
            </RevealArticle>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No weekly winner yet."
          body="A look needs at least five ratings before it can take the spotlight."
        />
      )}
    </MotionPage>
  );
}
