"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CustomCursor } from "@/features/home/home-motion";

export default function LookDetailError({ reset }: { reset(): void }) {
  return (
    <div className="hall-page look-detail-page look-detail-state-page">
      <CustomCursor scope="hall" />
      <section
        className="look-detail-state"
        role="alert"
        aria-labelledby="look-error-title"
      >
        <span className="look-detail-state__label">
          THE STAGE MISSED A BEAT
        </span>
        <h1 id="look-error-title">WE COULDN’T LOAD THIS LOOK.</h1>
        <p>Try again, or return to the Hall while the stage reconnects.</p>
        <div className="look-detail-state__actions">
          <Button onClick={reset} data-cursor="OPEN">
            TRY AGAIN
          </Button>
          <Link
            className="look-detail-state__link"
            href="/hall-of-fame"
            data-cursor="OPEN"
          >
            BACK TO THE HALL ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
