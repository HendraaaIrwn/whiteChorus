import Link from "next/link";

import { FallbackImage } from "@/components/ui/fallback-image";
import { DailyWinnerBadge } from "@/features/daily-winners/daily-winner-badge";
import type { DailyWinnerDisplaySnapshot } from "@/features/daily-winners/daily-winner-debug";
import { formatDailyWinnerDate } from "@/features/daily-winners/daily-winner-format";
import { productionAssets } from "@/features/dress-up/catalog";
import { EntryAudioGate } from "@/features/audio/entry-audio-gate";
import { Sparkle } from "@/features/home/home-doodles";
import {
  HomeReveal,
  ImageReveal,
  Magnetic,
  MaskedHeading,
} from "@/features/home/home-motion";

export function LatestDailyWinner({
  completedDayKey,
  state,
  winner,
}: {
  completedDayKey: string;
  state: "winner" | "empty" | "error";
  winner: DailyWinnerDisplaySnapshot | null;
}) {
  return (
    <section
      className="winner-latest"
      aria-labelledby="winner-latest-title"
      data-winner-state={state}
    >
      <div className="winner-container winner-grid-system winner-latest__layout">
        <span className="winner-label winner-latest__label">
          01 · LATEST DAILY WINNER
        </span>
        <MaskedHeading
          id="winner-latest-title"
          className="winner-latest__title"
          level="h1"
          lines={["LATEST", "DAILY WINNER"]}
          intro
        />

        {state === "winner" && winner ? (
          <>
            <ImageReveal className="winner-latest__media" delay={0.18}>
              <FallbackImage
                src={winner.imageUrl}
                fallbackSrc={productionAssets.defaultLookPath}
                alt={`Latest Daily Winner look ${winner.shortCode} for ${formatDailyWinnerDate(winner.dayKey)}.`}
                fill
                priority
                sizes="(max-width: 767px) calc(100vw - 28px), 52vw"
              />
            </ImageReveal>
            <HomeReveal className="winner-latest__copy" delay={0.28}>
              <DailyWinnerBadge />
              <span className="winner-latest__day">
                FINAL · {formatDailyWinnerDate(winner.dayKey).toUpperCase()}
              </span>
              <h2>
                ANONYMOUS LOOK <span>#{winner.shortCode}</span>
              </h2>
              {winner.isDebugPlaceholder ? (
                <small>DEBUG PREVIEW · PRESENTATION ONLY</small>
              ) : null}
              <dl className="winner-latest__metrics">
                <div className="winner-latest__metric--primary">
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
                  className="winner-editorial-link winner-latest__link"
                  href={`/daily-winners/${winner.dayKey}`}
                  data-cursor="VIEW"
                >
                  OPEN THE FINAL LOOK <span aria-hidden="true">↗</span>
                </Link>
              </Magnetic>
            </HomeReveal>
          </>
        ) : (
          <div className="winner-latest__open-state">
            <HomeReveal>
              <span className="winner-latest__day">
                COMPLETED DAY ·{" "}
                {formatDailyWinnerDate(completedDayKey).toUpperCase()}
              </span>
              <h2>
                {state === "error"
                  ? "THE LATEST SNAPSHOT IS RECONNECTING."
                  : "NO FINAL DAILY WINNER YET."}
              </h2>
              <p>
                {state === "error"
                  ? "The stored Daily Winner could not be verified. The active competition remains available below."
                  : "A completed day can close without an eligible look. The live leader remains provisional until finalization."}
              </p>
              <Link
                className="winner-editorial-link"
                href="#live-ranking-title"
              >
                SEE THE ACTIVE RANKING <span aria-hidden="true">↓</span>
              </Link>
            </HomeReveal>
          </div>
        )}

        <Sparkle className="winner-latest__sparkle" aria-hidden="true" />
      </div>
    </section>
  );
}

export function DailyWinnerArchive({
  winners,
}: {
  winners: DailyWinnerDisplaySnapshot[];
}) {
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
        {winners.length ? (
          <ol className="winner-archive__list">
            {winners.map((winner, index) => (
              <li key={winner.id}>
                <Link
                  href={`/daily-winners/${winner.dayKey}`}
                  data-cursor="VIEW"
                >
                  <span className="winner-archive__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="winner-archive__media">
                    <FallbackImage
                      src={winner.imageUrl}
                      fallbackSrc={productionAssets.defaultLookPath}
                      alt={`Daily Winner look ${winner.shortCode} for ${formatDailyWinnerDate(winner.dayKey)}.`}
                      fill
                      sizes="(max-width: 767px) 34vw, 13vw"
                    />
                  </span>
                  <span className="winner-archive__identity">
                    <strong>LOOK #{winner.shortCode}</strong>
                    <small>
                      {winner.isDebugPlaceholder
                        ? "DEBUG PLACEHOLDER"
                        : formatDailyWinnerDate(winner.dayKey).toUpperCase()}
                    </small>
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
        ) : (
          <p className="winner-archive__empty">
            NO PREVIOUS FINALIZED DAYS YET.
          </p>
        )}
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
