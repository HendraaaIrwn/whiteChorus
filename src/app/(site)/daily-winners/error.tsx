"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sparkle, ThreadStroke } from "@/features/home/home-doodles";

export default function DailyWinnersError({ reset }: { reset(): void }) {
  return (
    <div className="winner-page winner-route-state">
      <section aria-labelledby="winner-error-title">
        <div className="winner-container">
          <span className="winner-label">COMPETITION SIGNAL LOST</span>
          <h1 id="winner-error-title">
            THE CHORUS COULDN&apos;T CHECK THE SCORE.
          </h1>
          <p>
            No unverified ranking is being shown as live. Reconnect, or return
            to the Hall while the source recovers.
          </p>
          <div>
            <Button
              type="button"
              onClick={reset}
              replacementLabel="TRY AGAIN →"
            >
              TRY AGAIN
            </Button>
            <Link className="winner-editorial-link" href="/hall-of-fame">
              OPEN HALL OF FAME <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <ThreadStroke aria-hidden="true" />
          <Sparkle aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
