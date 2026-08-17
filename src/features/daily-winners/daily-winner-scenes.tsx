import Link from "next/link";

import { FallbackImage } from "@/components/ui/fallback-image";
import type { DailyWinnerSnapshot } from "@/features/daily-winners/daily-winners";
import { productionAssets } from "@/features/dress-up/catalog";
import { EntryAudioGate } from "@/features/audio/entry-audio-gate";
import {
  DailyCompetitionDoodles,
  SmoothRankingLink,
} from "@/features/daily-winners/daily-competition-motion";
import { Bow, Sparkle } from "@/features/home/home-doodles";
import { HomeReveal, MaskedHeading } from "@/features/home/home-motion";

function formatWinnerDay(dayKey: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dayKey}T00:00:00.000Z`));
}

export function DailyWinnerHero() {
  return (
    <section className="winner-hero-scene" aria-labelledby="winner-hero-title">
      <div className="winner-container winner-grid-system winner-hero-scene__layout">
        <span className="winner-label winner-hero-scene__label">
          01 · DAILY COMPETITION
        </span>
        <MaskedHeading
          id="winner-hero-title"
          className="winner-hero-scene__title"
          level="h1"
          lines={["DAILY", "WINNER"]}
          intro
        />
        <HomeReveal className="winner-hero-scene__copy" delay={0.24}>
          <p>
            One finalized look owns the completed day. Today&apos;s chorus keeps
            moving below.
          </p>
          <SmoothRankingLink className="winner-editorial-link">
            FOLLOW THE LIVE RANKING <span aria-hidden="true">↓</span>
          </SmoothRankingLink>
        </HomeReveal>
        <DailyCompetitionDoodles />
        <Bow className="winner-hero-scene__bow" aria-hidden="true" />
        <Sparkle className="winner-hero-scene__sparkle" aria-hidden="true" />
      </div>
    </section>
  );
}

export function DailyWinnerArchive({
  winners,
}: {
  winners: DailyWinnerSnapshot[];
}) {
  if (!winners.length) return null;

  return (
    <section className="winner-archive" aria-labelledby="winner-archive-title">
      <div className="winner-container">
        <div className="winner-grid-system winner-archive__intro">
          <span className="winner-label">03 · COMPLETED DAYS</span>
          <MaskedHeading
            id="winner-archive-title"
            className="winner-archive__title"
            lines={["PAST LOOKS.", "PERMANENT MOMENTS."]}
          />
        </div>
        <ol className="winner-archive__list">
          {winners.map((winner, index) => (
            <li key={winner.id}>
              <Link href={`/daily-winners/${winner.dayKey}`} data-cursor="VIEW">
                <span className="winner-archive__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="winner-archive__media">
                  <FallbackImage
                    src={winner.imageUrl}
                    fallbackSrc={productionAssets.defaultLookPath}
                    alt={`Daily Winner look ${winner.shortCode} for ${formatWinnerDay(winner.dayKey)}.`}
                    fill
                    sizes="(max-width: 767px) 34vw, 13vw"
                  />
                </span>
                <span className="winner-archive__identity">
                  <strong>LOOK #{winner.shortCode}</strong>
                  <small>{formatWinnerDay(winner.dayKey).toUpperCase()}</small>
                </span>
                <span className="winner-archive__score">
                  {winner.finalWeightedScore.toFixed(3)}
                  <small>FINAL WEIGHTED</small>
                </span>
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function DailyWinnerCta({
  sectionNumber = "04",
}: {
  sectionNumber?: string;
}) {
  return (
    <section className="winner-cta" aria-labelledby="winner-cta-title">
      <div className="winner-container winner-grid-system winner-cta__layout">
        <span className="winner-label">{sectionNumber} · YOUR NEXT LOOK</span>
        <MaskedHeading
          id="winner-cta-title"
          className="winner-cta__title"
          lines={["TOMORROW’S", "#01", "COULD BE YOURS."]}
        />
        <div className="winner-cta__action-wrap" data-cursor="DRESS">
          <EntryAudioGate triggerClassName="home-action winner-cta__action" />
          <span>BUILD BOTH VOICES. PUBLISH ONE FINAL LOOK.</span>
        </div>
        <Sparkle className="winner-cta__spark" aria-hidden="true" />
      </div>
    </section>
  );
}
