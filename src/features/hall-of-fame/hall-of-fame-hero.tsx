"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import {
  chorusWavePath,
  Sparkle,
  ThreadStroke,
} from "@/features/home/home-doodles";
import { MaskedHeading } from "@/features/home/home-motion";

export function HallOfFameHero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useHydratedReducedMotion();
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={heroRef}
      className="hall-hero"
      aria-labelledby="hall-hero-title"
    >
      <div className="hall-container hall-grid-system hall-hero__composition">
        <span className="hall-label hall-hero__label">
          01 · COMMUNITY EXHIBITION
        </span>

        <MaskedHeading
          id="hall-hero-title"
          className="hall-hero__title"
          level="h1"
          lines={["HALL OF", "FAME"]}
          intro
        />

        <MaskedHeading
          id="hall-hero-statement"
          className="hall-hero__statement"
          level="h2"
          lines={["ONE LOOK.", "ONE MOMENT.", "ONE SHARED WALL."]}
        />

        <ThreadStroke
          className="hall-hero__thread"
          aria-hidden="true"
          withArrow={false}
        />
        <Sparkle className="hall-hero__sparkle" aria-hidden="true" />
        <svg
          className="hall-hero__wave"
          viewBox="0 0 1000 240"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="hall-hero-wave-reveal" clipPathUnits="userSpaceOnUse">
              <motion.rect
                x="0"
                y="-24"
                height="288"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{
                  width: reduceMotion || heroInView ? 1000 : 0,
                }}
                transition={{
                  duration: reduceMotion ? 0 : 2.25,
                  delay: reduceMotion ? 0 : 0.18,
                  ease: [0.65, 0, 0.35, 1],
                }}
              />
            </clipPath>
          </defs>
          <path
            d={chorusWavePath}
            clipPath="url(#hall-hero-wave-reveal)"
            stroke="currentColor"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </section>
  );
}
