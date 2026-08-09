import Image from "next/image";
import Link from "next/link";

import { FallbackImage } from "@/components/ui/fallback-image";
import { EntryAudioGate } from "@/features/audio/entry-audio-gate";
import { productionAssets } from "@/features/dress-up/catalog";
import {
  Bow,
  ChorusWave,
  Sparkle,
  StitchedArrow,
  ThreadStroke,
} from "@/features/home/home-doodles";
import {
  HomeLookCard,
  CuratedLookArtwork,
} from "@/features/home/home-look-card";
import type { HomeLook } from "@/features/home/home-look-data";
import {
  HomeReveal,
  Magnetic,
  MaskedHeading,
} from "@/features/home/home-motion";

export type HomeDailyWinner = {
  dayKey: string;
  shortCode: string;
  imageUrl: string;
  finalAverage: number;
  finalRatingCount: number;
};

export function HomeManifesto() {
  return (
    <section
      className="home-scene home-manifesto"
      aria-labelledby="home-manifesto-title"
    >
      <div className="home-container home-grid">
        <span className="home-label home-manifesto__label">02 · THE DUET</span>
        <MaskedHeading
          className="home-heading home-manifesto__title"
          lines={["TWO VOICES.", "ONE SHARED STAGE."]}
        />
        <HomeReveal className="home-manifesto__copy">
          <p>
            Dress Emir and Friska in one scene, publish an immutable anonymous
            snapshot, and let the community choose its daily spotlight.
          </p>
          <span>NO PROFILES. NO FOLLOWERS. JUST THE LOOK.</span>
        </HomeReveal>
        <ThreadStroke className="home-manifesto__thread" aria-hidden="true" />
        <Bow className="home-manifesto__bow" aria-hidden="true" />
      </div>
    </section>
  );
}

export function FeaturedLooks({ looks }: { looks: HomeLook[] }) {
  return (
    <section
      className="home-scene home-featured"
      aria-labelledby="home-featured-title"
    >
      <div className="home-container">
        <div className="home-grid home-section-intro">
          <span className="home-label">04 · FRESH COMPOSITIONS</span>
          <MaskedHeading
            className="home-heading"
            lines={["LOOKS WITH THEIR", "OWN RHYTHM."]}
          />
          <p>
            Live community entries meet a small set of catalog-valid studio
            compositions—always labeled, never pretending to be submissions.
          </p>
        </div>
        <div className="home-featured__bento">
          {looks.map((look, index) => (
            <HomeLookCard
              key={look.id}
              look={look}
              variant={index === 0 ? "large" : index === 1 ? "small" : "wide"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const howSteps = [
  {
    number: "01",
    title: "DRESS",
    copy: "Choose the duo, then build each character from the real White Chorus wardrobe.",
    artwork: "sparkle",
  },
  {
    number: "02",
    title: "MIX",
    copy: "Switch the shared stage, move between separates and one-pieces, and find the chorus.",
    artwork: "bow",
  },
  {
    number: "03",
    title: "SHARE",
    copy: "Publish one anonymous snapshot to the Hall and enter the current daily ranking.",
    artwork: "arrow",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="home-scene home-how" aria-labelledby="home-how-title">
      <div className="home-container">
        <div className="home-grid home-section-intro">
          <span className="home-label">06 · THREE BEATS</span>
          <MaskedHeading
            className="home-heading"
            lines={["HOW THE CHORUS", "COMES TOGETHER."]}
          />
        </div>
        <ol className="home-how__list">
          {howSteps.map((step, index) => (
            <li
              key={step.number}
              className={index % 2 ? "is-offset" : undefined}
            >
              <HomeReveal className="home-how__step">
                <span className="home-how__number">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
                <div className="home-how__art" aria-hidden="true">
                  {step.artwork === "sparkle" ? <Sparkle /> : null}
                  {step.artwork === "bow" ? <Bow /> : null}
                  {step.artwork === "arrow" ? <StitchedArrow /> : null}
                </div>
              </HomeReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function DailySpotlight({
  winner,
  fallbackLook,
}: {
  winner: HomeDailyWinner | null;
  fallbackLook: HomeLook;
}) {
  return (
    <section
      className="home-scene home-spotlight"
      aria-labelledby="home-spotlight-title"
    >
      <div className="home-container home-grid home-spotlight__layout">
        <span className="home-label">07 · DAILY SPOTLIGHT</span>
        <div
          className="home-spotlight__media"
          data-cursor={winner ? "VIEW" : "DRESS"}
        >
          {winner ? (
            <FallbackImage
              src={winner.imageUrl}
              fallbackSrc={productionAssets.defaultLookPath}
              alt={`Daily winning White Chorus look ${winner.shortCode}.`}
              fill
              sizes="(max-width: 767px) 94vw, 58vw"
            />
          ) : fallbackLook.kind === "curated" ? (
            <CuratedLookArtwork
              configuration={fallbackLook.configuration}
              sizes="(max-width: 767px) 94vw, 58vw"
            />
          ) : (
            <FallbackImage
              src={fallbackLook.outfit.thumbnailUrl}
              fallbackSrc={productionAssets.defaultLookPath}
              alt="A White Chorus community look."
              fill
              sizes="(max-width: 767px) 94vw, 58vw"
            />
          )}
          <ChorusWave aria-hidden="true" />
        </div>
        <HomeReveal className="home-spotlight__copy">
          {winner ? (
            <>
              <h2 id="home-spotlight-title">
                ANONYMOUS LOOK <span>#{winner.shortCode}</span>
              </h2>
              <dl>
                <div>
                  <dt>SCORE</dt>
                  <dd>{winner.finalAverage.toFixed(1)}</dd>
                </div>
                <div>
                  <dt>RATINGS</dt>
                  <dd>{winner.finalRatingCount}</dd>
                </div>
              </dl>
              <Link
                className="home-text-link"
                href={`/daily-winners/${winner.dayKey}`}
                data-cursor="VIEW"
              >
                VIEW TODAY’S SPOTLIGHT <span>↗</span>
              </Link>
            </>
          ) : (
            <>
              <h2 id="home-spotlight-title">THE NEXT SPOTLIGHT IS OPEN</h2>
              <p>
                No completed Daily Winner snapshot is available yet. The next
                eligible look can still take the stage.
              </p>
              <Link
                className="home-text-link"
                href="/studio"
                data-cursor="DRESS"
              >
                MAKE A LOOK <span>→</span>
              </Link>
            </>
          )}
          <Link
            className="home-text-link home-spotlight__archive"
            href="/daily-winners"
          >
            BROWSE THE DAILY ARCHIVE <span>→</span>
          </Link>
        </HomeReveal>
      </div>
    </section>
  );
}

export function HallPreview({ looks }: { looks: HomeLook[] }) {
  return (
    <section
      className="home-scene home-hall-preview"
      aria-labelledby="home-hall-title"
    >
      <div className="home-container">
        <div className="home-grid home-section-intro">
          <span className="home-label">08 · THE OPEN ARCHIVE</span>
          <MaskedHeading
            className="home-heading"
            lines={["A HALL BUILT", "ONE LOOK AT A TIME."]}
          />
          <p>
            Current community submissions and clearly marked studio
            compositions, arranged as a living editorial wall.
          </p>
        </div>
        <div className="home-hall-preview__grid">
          {looks.map((look, index) => (
            <HomeLookCard
              key={look.id}
              look={look}
              variant={index === 1 ? "portrait" : "offset"}
            />
          ))}
        </div>
        <Magnetic className="home-hall-preview__link-wrap">
          <Link
            className="home-action home-action--outline"
            href="/hall-of-fame"
            data-cursor="OPEN"
          >
            <span>ENTER THE HALL OF FAME</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}

export function FinalHomeCta() {
  return (
    <section className="home-final-cta" aria-labelledby="home-final-title">
      <div className="home-container home-grid">
        <span className="home-label">09 · YOUR TURN</span>
        <MaskedHeading
          className="home-final-cta__title"
          lines={["PUT YOUR NEXT LOOK", "IN THE CHORUS."]}
        />
        <div className="home-final-cta__characters" aria-hidden="true">
          <Image
            src={productionAssets.characterLooks.emir}
            alt=""
            fill
            sizes="(max-width: 767px) 55vw, 28vw"
          />
          <Image
            src={productionAssets.characterLooks.friska}
            alt=""
            fill
            sizes="(max-width: 767px) 55vw, 28vw"
          />
        </div>
        <div className="home-final-cta__action" data-cursor="DRESS">
          <EntryAudioGate triggerClassName="home-action home-action--giant" />
          <span>CHOOSE YOUR SOUND, THEN STEP INTO THE STUDIO.</span>
        </div>
        <ThreadStroke aria-hidden="true" />
        <Bow aria-hidden="true" />
        <Sparkle aria-hidden="true" />
      </div>
    </section>
  );
}
