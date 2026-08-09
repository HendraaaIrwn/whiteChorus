"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useMotionExperience } from "@/components/motion/motion-provider";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { EntryAudioGate } from "@/features/audio/entry-audio-gate";
import { HeroStageArtwork } from "@/features/home/hero-stage-artwork";
import { Sparkle } from "@/features/home/home-doodles";
import { Magnetic, MaskedHeading } from "@/features/home/home-motion";

export function LandingHero() {
  const reduceMotion = useHydratedReducedMotion();
  const { landingIntroPlayed, markLandingIntroPlayed } = useMotionExperience();
  const [shouldPlay] = useState(() => !landingIntroPlayed);

  useEffect(() => {
    if (shouldPlay) markLandingIntroPlayed();
  }, [markLandingIntroPlayed, shouldPlay]);

  return (
    <section
      className="home-hero hero"
      data-landing-intro={shouldPlay ? "played" : "skipped"}
      aria-labelledby="home-hero-title"
    >
      <motion.div
        className="home-hero__grid-lines"
        initial={reduceMotion || !shouldPlay ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldPlay ? 0.34 : 0 }}
        aria-hidden="true"
      />
      <div className="home-container home-grid home-hero__composition">
        <motion.span
          className="home-label home-hero__eyebrow"
          initial={reduceMotion || !shouldPlay ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldPlay ? 0.42 : 0, delay: 0.08 }}
        >
          01 · AN INTERACTIVE FASHION CHORUS
        </motion.span>

        <div className="hero-heading home-hero__heading">
          <MaskedHeading
            className="home-hero__title"
            level="h1"
            lines={["DRESS THE", "CHORUS", "YOUR WAY."]}
            intro
            skipAnimation={!shouldPlay}
          />
          <Sparkle className="home-hero__title-spark" aria-hidden="true" />
        </div>

        <div className="hero-stage home-hero__stage">
          <HeroStageArtwork animateIntro={shouldPlay && !reduceMotion} />
        </div>

        <motion.aside
          className="home-hero__info"
          initial={reduceMotion || !shouldPlay ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldPlay ? 0.55 : 0,
            delay: shouldPlay ? 0.92 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span>PLAY IT YOUR WAY</span>
          <p>
            Style Emir and Friska together. Publish anonymously. Let every
            rating add another beat.
          </p>
        </motion.aside>

        <motion.div
          className="hero-actions home-hero__actions"
          initial={reduceMotion || !shouldPlay ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldPlay ? 0.5 : 0,
            delay: shouldPlay ? 1.08 : 0,
          }}
        >
          <EntryAudioGate triggerClassName="home-action home-action--primary" />
          <Magnetic>
            <Link
              className="home-text-link"
              href="/hall-of-fame"
              data-cursor="OPEN"
            >
              EXPLORE HALL OF FAME <span>↗</span>
            </Link>
          </Magnetic>
        </motion.div>

        <span className="home-hero__edition">VOL. 01 / DAILY EDITION</span>
      </div>
    </section>
  );
}
