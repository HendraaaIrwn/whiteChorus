import Link from "next/link";
import type { Metadata } from "next";

import {
  MotionPage,
  Reveal,
  RevealSection,
  StaggerArticle,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import { BorderBeam } from "@/components/motion/border-beam";
import { EntryAudioGate } from "@/features/audio/entry-audio-gate";
import { HeroStageArtwork } from "@/features/home/hero-stage-artwork";
import { HomeMotionExperience } from "@/features/home/home-motion-experience";
import { getFeaturedOutfits } from "@/features/hall-of-fame/hall-of-fame";
import { OutfitCard } from "@/features/hall-of-fame/outfit-card";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedOutfits().catch(() => []);
  return (
    <MotionPage>
      <HomeMotionExperience>
        <section className="hero" data-home-hero>
          <StaggerGroup inView={false} delay={0.06}>
            <StaggerItem>
              <p className="eyebrow">A two-character fashion playground</p>
            </StaggerItem>
            <StaggerItem>
              <h1>
                DRESS. CREATE. <em>CHORUS.</em>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="hero-copy">
                Style Emir and Friska together, publish your look anonymously,
                and let the community decide who earns the weekly spotlight.
              </p>
            </StaggerItem>
            <StaggerItem>
              <EntryAudioGate />
            </StaggerItem>
          </StaggerGroup>
          <Reveal
            className="hero-stage"
            aria-label="Emir and Friska ready to be styled"
            delay={0.14}
            distance={24}
            inView={false}
          >
            <HeroStageArtwork />
          </Reveal>
        </section>

        <RevealSection
          className="section home-steps"
          aria-labelledby="how-title"
          data-home-steps
        >
          <p className="eyebrow">Three easy beats</p>
          <h2 className="section-title" id="how-title">
            HOW IT WORKS
          </h2>
          <span aria-hidden="true" className="steps-rail">
            <span className="steps-progress" data-steps-progress />
          </span>
          <StaggerGroup className="steps">
            <StaggerArticle className="step-card">
              <span className="step-card__number">01</span>
              <span
                aria-hidden="true"
                className="step-card__pulse"
                data-scroll-beat
              >
                ✦
              </span>
              <h3>DRESS THE DUO</h3>
              <p>
                Choose a shared scene, switch characters, and build two
                coordinated looks.
              </p>
            </StaggerArticle>
            <StaggerArticle className="step-card">
              <span className="step-card__number">02</span>
              <span
                aria-hidden="true"
                className="step-card__pulse"
                data-scroll-beat
              >
                ♪
              </span>
              <h3>TAKE THE STAGE</h3>
              <p>
                Publish one immutable snapshot to the anonymous Hall of Fame.
              </p>
            </StaggerArticle>
            <StaggerArticle className="step-card">
              <span className="step-card__number">03</span>
              <span
                aria-hidden="true"
                className="step-card__pulse"
                data-scroll-beat
              >
                ★
              </span>
              <h3>SHARE THE SPOTLIGHT</h3>
              <p>
                Rate, share, and compete for a permanent weekly winner card.
              </p>
            </StaggerArticle>
          </StaggerGroup>
        </RevealSection>

        {featured.length ? (
          <RevealSection className="section" aria-labelledby="featured-title">
            <p className="eyebrow">Fresh from the community</p>
            <h2 className="section-title" id="featured-title">
              FEATURED LOOKS
            </h2>
            <div className="hall-grid hall-grid--featured">
              {featured.map((outfit, index) => (
                <OutfitCard key={outfit.id} outfit={outfit} index={index} />
              ))}
            </div>
          </RevealSection>
        ) : null}

        <RevealSection className="section" data-home-cta>
          <div className="cta-strip">
            <span aria-hidden="true" className="cta-orbit" data-cta-orbit>
              ♪ ✦
            </span>
            <div>
              <p className="eyebrow">The hall is listening</p>
              <h2>DISCOVER THIS WEEK&apos;S LOOKS</h2>
            </div>
            <Link
              className="button button--tertiary button--lg"
              href="/hall-of-fame"
            >
              EXPLORE HALL OF FAME
            </Link>
            <BorderBeam color="var(--navy-700)" durationSeconds={8} />
          </div>
        </RevealSection>
      </HomeMotionExperience>
    </MotionPage>
  );
}
