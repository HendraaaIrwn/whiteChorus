import { FallbackImage } from "@/components/ui/fallback-image";
import { productionAssets } from "@/features/dress-up/catalog";
import { Sparkle, ThreadStroke } from "@/features/home/home-doodles";
import {
  HomeReveal,
  ImageReveal,
  MaskedHeading,
} from "@/features/home/home-motion";
import type { HallOutfitCardDTO } from "@/features/outfits/outfit.types";

export function HallOfFameHero({
  firstLook,
  totalItems,
}: {
  firstLook?: HallOutfitCardDTO;
  totalItems: number;
}) {
  return (
    <section className="hall-hero" aria-labelledby="hall-hero-title">
      <div className="hall-container hall-grid-system hall-hero__composition">
        <span className="hall-label hall-hero__label">
          01 · COMMUNITY EXHIBITION
        </span>

        <MaskedHeading
          id="hall-hero-title"
          className="hall-hero__title"
          level="h1"
          lines={["HALL", "OF", "FAME"]}
          intro
        />

        <HomeReveal className="hall-hero__copy" delay={0.24}>
          <p>Fresh looks live for seven days. Stars decide who rises.</p>
          <span>
            {String(totalItems).padStart(2, "0")}{" "}
            {totalItems === 1 ? "LOOK" : "LOOKS"} ON VIEW
          </span>
        </HomeReveal>

        <ImageReveal className="hall-hero__look" delay={0.38}>
          <FallbackImage
            src={firstLook?.thumbnailUrl}
            fallbackSrc={productionAssets.defaultLookPath}
            alt={
              firstLook
                ? `Anonymous White Chorus outfit ${firstLook.shortCode}.`
                : "Emir and Friska in a White Chorus look."
            }
            fill
            priority
            sizes="(max-width: 767px) 44vw, 28vw"
          />
          <span aria-hidden="true">FROM THE CHORUS</span>
        </ImageReveal>

        <ThreadStroke className="hall-hero__thread" aria-hidden="true" />
        <Sparkle className="hall-hero__sparkle" aria-hidden="true" />
        <span className="hall-hero__edition">DAILY EDITION · 2026</span>
      </div>
    </section>
  );
}
