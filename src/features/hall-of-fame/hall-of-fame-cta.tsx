import Link from "next/link";

import { Bow, Sparkle, ThreadStroke } from "@/features/home/home-doodles";
import { Magnetic, MaskedHeading } from "@/features/home/home-motion";

export function HallOfFameCta() {
  return (
    <section className="hall-cta" aria-labelledby="hall-cta-title">
      <div className="hall-container hall-grid-system">
        <span className="hall-label">04 · YOUR TURN</span>
        <MaskedHeading
          id="hall-cta-title"
          className="hall-cta__title"
          lines={["YOU’VE SEEN", "THE CHORUS.", "NOW MAKE YOURS."]}
        />
        <Magnetic className="hall-cta__action-wrap">
          <Link className="hall-cta__action" href="/studio" data-cursor="DRESS">
            <span>START DRESSING</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </Magnetic>
        <span className="hall-cta__note">
          TWO CHARACTERS · ONE SHARED STAGE · ANONYMOUS BY DESIGN
        </span>
        <ThreadStroke aria-hidden="true" />
        <Bow aria-hidden="true" />
        <Sparkle aria-hidden="true" />
      </div>
    </section>
  );
}
