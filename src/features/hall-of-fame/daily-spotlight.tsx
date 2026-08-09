import Link from "next/link";

import { FallbackImage } from "@/components/ui/fallback-image";
import { productionAssets } from "@/features/dress-up/catalog";
import {
  ChorusWave,
  Sparkle,
  ThreadStroke,
} from "@/features/home/home-doodles";
import {
  HomeReveal,
  ImageReveal,
  Magnetic,
  MaskedHeading,
} from "@/features/home/home-motion";
import type { HallDailySpotlightState } from "@/features/hall-of-fame/hall-daily-spotlight";

function formatDay(dayKey: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dayKey}T00:00:00Z`));
}

export function DailySpotlight({ state }: { state: HallDailySpotlightState }) {
  const winner = state.status === "winner" ? state.winner : null;
  const degraded = state.status === "degraded";
  return (
    <section
      className="hall-spotlight"
      aria-labelledby="hall-spotlight-title"
      data-spotlight-state={state.status}
    >
      <div className="hall-container hall-grid-system hall-spotlight__layout">
        <span className="hall-label hall-spotlight__label">
          02 · DAILY SPOTLIGHT
        </span>

        {winner ? (
          <>
            <ImageReveal className="hall-spotlight__media">
              <FallbackImage
                src={winner.imageUrl}
                fallbackSrc={productionAssets.defaultLookPath}
                alt={`Daily winning White Chorus look ${winner.shortCode}.`}
                fill
                priority
                sizes="(max-width: 767px) 92vw, 54vw"
              />
              <ChorusWave aria-hidden="true" />
            </ImageReveal>

            <HomeReveal className="hall-spotlight__copy" delay={0.08}>
              <span className="hall-spotlight__day">
                WINNER · {formatDay(winner.dayKey).toUpperCase()}
              </span>
              <h2 id="hall-spotlight-title">
                ANONYMOUS LOOK <span>#{winner.shortCode}</span>
              </h2>
              <dl>
                <div>
                  <dt>FINAL SCORE</dt>
                  <dd>{winner.finalAverage.toFixed(1)}</dd>
                </div>
                <div>
                  <dt>RATINGS</dt>
                  <dd>{winner.finalRatingCount}</dd>
                </div>
              </dl>
              <Magnetic>
                <Link
                  className="hall-editorial-link"
                  href={`/daily-winners/${winner.dayKey}`}
                  data-cursor="VIEW"
                >
                  VIEW THE SPOTLIGHT <span>↗</span>
                </Link>
              </Magnetic>
            </HomeReveal>
          </>
        ) : (
          <div className="hall-spotlight__open">
            <MaskedHeading
              id="hall-spotlight-title"
              className="hall-spotlight__open-title"
              lines={[
                degraded ? "SPOTLIGHT" : "THE NEXT SPOTLIGHT",
                degraded ? "OFFLINE FOR A BEAT." : "IS OPEN.",
              ]}
            />
            <HomeReveal className="hall-spotlight__open-copy">
              <p>
                {degraded
                  ? "The gallery is still live while the Daily Spotlight reconnects."
                  : state.status === "not-ready"
                    ? "Daily Spotlight is not available in this environment yet. The open Hall is still live."
                    : "Rate the Hall or publish a look. The next eligible chorus can still take the stage."}
              </p>
              <div>
                <Link
                  className="hall-editorial-link"
                  href="/daily-winners"
                  data-cursor="OPEN"
                >
                  BROWSE DAILY WINNERS <span>→</span>
                </Link>
                <Link
                  className="hall-editorial-link"
                  href="/studio"
                  data-cursor="DRESS"
                >
                  MAKE A LOOK <span>↗</span>
                </Link>
              </div>
            </HomeReveal>
            <ThreadStroke aria-hidden="true" />
            <Sparkle aria-hidden="true" />
          </div>
        )}
      </div>
    </section>
  );
}
