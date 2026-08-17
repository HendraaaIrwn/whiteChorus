import { RadialRevealButton } from "@/components/ui/radial-reveal-button";
import { Bow, Sparkle, ThreadStroke } from "@/features/home/home-doodles";
import { MaskedHeading } from "@/features/home/home-motion";

export function HallOfFameCta() {
  return (
    <section className="hall-cta" aria-labelledby="hall-cta-title">
      <div className="hall-container hall-grid-system">
        <span className="hall-label">03 · YOUR TURN</span>
        <MaskedHeading
          id="hall-cta-title"
          className="hall-cta__title"
          lines={["YOU’VE SEEN", "THE CHORUS.", "NOW MAKE YOURS."]}
        />
        <div className="hall-cta__action-wrap" data-cursor="DRESS">
          <RadialRevealButton
            className="hall-cta__action"
            href="/studio"
            variant="navy"
          >
            <span>START DRESSING</span>
            <span aria-hidden="true">↗</span>
          </RadialRevealButton>
        </div>
        <ThreadStroke aria-hidden="true" withArrow={false} />
        <Bow aria-hidden="true" />
        <Sparkle aria-hidden="true" />
      </div>
    </section>
  );
}
