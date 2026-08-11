"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

import { useMotionExperience } from "@/components/motion/motion-provider";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { EntryAudioGate } from "@/features/audio/entry-audio-gate";
import {
  HeroStageArtwork,
  HeroWaveArtwork,
} from "@/features/home/hero-stage-artwork";
import { Sparkle } from "@/features/home/home-doodles";
import { MaskedHeading } from "@/features/home/home-motion";

export function LandingHero() {
  const reduceMotion = useHydratedReducedMotion();
  const { landingIntroPlayed, markLandingIntroPlayed } = useMotionExperience();
  const [shouldPlay] = useState(() => !landingIntroPlayed);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const titleSparkY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -58],
  );

  useEffect(() => {
    if (shouldPlay) markLandingIntroPlayed();
  }, [markLandingIntroPlayed, shouldPlay]);

  return (
    <section
      ref={heroRef}
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
      <HeroWaveArtwork
        animateIntro={shouldPlay && !reduceMotion}
        heroRef={heroRef}
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
            id="home-hero-title"
            className="home-hero__title"
            level="h1"
            lines={["DRESS THE", "CHORUS", "YOUR WAY."]}
            intro
            skipAnimation={!shouldPlay}
          />
          <motion.span
            className="home-hero__title-spark"
            style={{ y: titleSparkY }}
            initial={
              reduceMotion || !shouldPlay
                ? false
                : { opacity: 0, scale: 0.74, rotate: -8 }
            }
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{
              duration: shouldPlay && !reduceMotion ? 0.38 : 0,
              delay: shouldPlay && !reduceMotion ? 0.9 : 0,
            }}
            aria-hidden="true"
          >
            <motion.span
              className="home-hero__sparkle-idle home-hero__sparkle-idle--title"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, -4, 0],
                      rotate: [0, -5, 0],
                      scale: [1, 1.035, 1],
                    }
              }
              transition={{
                duration: 5.1,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              <Sparkle />
            </motion.span>
          </motion.span>
        </div>

        <div className="hero-stage home-hero__stage">
          <HeroStageArtwork
            animateIntro={shouldPlay && !reduceMotion}
            heroRef={heroRef}
          />
        </div>

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
          <Link
            className="home-text-link"
            href="/hall-of-fame"
            data-cursor="OPEN"
          >
            EXPLORE HALL OF FAME <span>↗</span>
          </Link>
        </motion.div>

        <motion.span
          className="home-hero__edition"
          initial={reduceMotion || !shouldPlay ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldPlay && !reduceMotion ? 0.42 : 0,
            delay: shouldPlay && !reduceMotion ? 0.12 : 0,
          }}
        >
          VOL. 01 / DAILY EDITION
        </motion.span>
      </div>
    </section>
  );
}
