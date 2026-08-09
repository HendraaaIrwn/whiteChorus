"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sparkle, ThreadStroke } from "@/features/home/home-doodles";

export default function HallOfFameError({ reset }: { reset: () => void }) {
  return (
    <div className="hall-page hall-error-page">
      <section className="hall-error" aria-labelledby="hall-error-title">
        <span className="hall-label">THE HALL MISSED A BEAT</span>
        <h1 id="hall-error-title">WE COULDN’T LOAD THE LOOKS.</h1>
        <p>Try the collection again, or make a new look while it reconnects.</p>
        <div>
          <Button onClick={reset} replacementLabel="TRY AGAIN ↗">
            TRY AGAIN
          </Button>
          <Link
            className="hall-editorial-link"
            href="/studio"
            data-cursor="DRESS"
          >
            START DRESSING <span>↗</span>
          </Link>
        </div>
        <ThreadStroke aria-hidden="true" />
        <Sparkle aria-hidden="true" />
      </section>
    </div>
  );
}
