import Link from "next/link";

import { FallbackImage } from "@/components/ui/fallback-image";
import type { DailyWinnerSnapshot } from "@/features/daily-winners/daily-winners";
import { productionAssets } from "@/features/dress-up/catalog";
import { EntryAudioGate } from "@/features/audio/entry-audio-gate";
import {
  Bow,
  ChorusWave,
  Sparkle,
  StitchedArrow,
  ThreadStroke,
} from "@/features/home/home-doodles";
import {
  HomeReveal,
  ImageReveal,
  Magnetic,
  MaskedHeading,
} from "@/features/home/home-motion";

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
          <Link className="winner-editorial-link" href="#live-ranking-title">
            FOLLOW THE LIVE RANKING <span aria-hidden="true">↓</span>
          </Link>
        </HomeReveal>
        <div className="winner-hero-scene__states" aria-hidden="true">
          <span>FINAL</span>
          <ThreadStroke />
          <span>PROVISIONAL</span>
        </div>
        <Bow className="winner-hero-scene__bow" aria-hidden="true" />
        <Sparkle className="winner-hero-scene__sparkle" aria-hidden="true" />
      </div>
    </section>
  );
}

export function DailyWinnerStage({
  completedDayKey,
  state,
  winner,
}: {
  completedDayKey: string;
  state: "winner" | "empty" | "error";
  winner: DailyWinnerSnapshot | null;
}) {
  return (
    <section
      className="winner-stage"
      aria-labelledby="daily-winner-stage-title"
      data-winner-state={state}
    >
      <div className="winner-container winner-grid-system winner-stage__layout">
        <span className="winner-label winner-stage__label">
          02 · FINAL SPOTLIGHT
        </span>

        {state === "winner" && winner ? (
          <>
            <span className="winner-stage__number" aria-hidden="true">
              01
            </span>
            <ImageReveal className="winner-stage__media" delay={0.18}>
              <FallbackImage
                src={winner.imageUrl}
                fallbackSrc={productionAssets.defaultLookPath}
                alt={`Final Daily Winner look ${winner.shortCode} for ${formatWinnerDay(winner.dayKey)}.`}
                fill
                priority
                sizes="(max-width: 767px) 92vw, 48vw"
              />
              <ChorusWave aria-hidden="true" />
            </ImageReveal>
            <HomeReveal className="winner-stage__copy" delay={0.28}>
              <span className="winner-stage__day">
                FINAL · {formatWinnerDay(winner.dayKey).toUpperCase()}
              </span>
              <h2 id="daily-winner-stage-title">
                ANONYMOUS LOOK <span>#{winner.shortCode}</span>
              </h2>
              <dl className="winner-stage__metrics">
                <div className="winner-stage__metric--primary">
                  <dt>FINAL WEIGHTED SCORE</dt>
                  <dd>{winner.finalWeightedScore.toFixed(3)}</dd>
                </div>
                <div>
                  <dt>AVERAGE RATING</dt>
                  <dd>{winner.finalAverage.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>FINAL RATINGS</dt>
                  <dd>{winner.finalRatingCount}</dd>
                </div>
              </dl>
              <Magnetic>
                <Link
                  className="winner-editorial-link winner-stage__link"
                  href={`/daily-winners/${winner.dayKey}`}
                  data-cursor="VIEW"
                >
                  OPEN THE FINAL LOOK <span aria-hidden="true">↗</span>
                </Link>
              </Magnetic>
            </HomeReveal>
            <ThreadStroke className="winner-stage__thread" aria-hidden="true" />
            <Sparkle className="winner-stage__sparkle" aria-hidden="true" />
          </>
        ) : (
          <div className="winner-stage__open-state">
            <MaskedHeading
              id="daily-winner-stage-title"
              className="winner-stage__open-title"
              lines={
                state === "error"
                  ? ["THE FINAL SPOTLIGHT", "IS RECONNECTING."]
                  : ["NO FINAL DAILY", "WINNER YET."]
              }
            />
            <HomeReveal className="winner-stage__open-copy">
              <span className="winner-stage__day">
                COMPLETED DAY · {formatWinnerDay(completedDayKey).toUpperCase()}
              </span>
              <p>
                {state === "error"
                  ? "The stored Daily Winner could not be verified. The live competition remains separate below."
                  : "A completed day can close without an eligible look. Live #01 is never promoted before finalization."}
              </p>
              <Link
                className="winner-editorial-link"
                href="#live-ranking-title"
              >
                SEE THE CURRENT RACE <span aria-hidden="true">↓</span>
              </Link>
            </HomeReveal>
            <ThreadStroke aria-hidden="true" />
            <Sparkle aria-hidden="true" />
          </div>
        )}
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
          <span className="winner-label">04 · COMPLETED DAYS</span>
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
                  {String(index + 2).padStart(2, "0")}
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
  sectionNumber = "05",
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
          <EntryAudioGate triggerClassName="winner-cta__action" />
          <span>BUILD BOTH VOICES. PUBLISH ONE FINAL LOOK.</span>
        </div>
        <ThreadStroke aria-hidden="true" />
        <StitchedArrow aria-hidden="true" />
        <Sparkle aria-hidden="true" />
      </div>
    </section>
  );
}
