"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { Bow, Sparkle } from "@/features/home/home-doodles";
import { HomeReveal } from "@/features/home/home-motion";

const headlineLines = [
  ["TWO", "VOICES."],
  ["ONE", "SHARED", "STAGE."],
] as const;

export function HomeManifesto() {
  const reduceMotion = useHydratedReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const firstThreadY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [18, -18],
  );
  const secondThreadY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-12, 14],
  );
  const bowRotate = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [-7, -7] : [-10, 2],
  );

  return (
    <section
      ref={sectionRef}
      className="home-scene home-manifesto"
      aria-labelledby="home-manifesto-title"
    >
      <div className="home-manifesto__bridge" aria-hidden="true" />

      <div className="home-container home-manifesto__stage">
        <HomeReveal className="home-label home-manifesto__label">
          02 · THE DUET
        </HomeReveal>

        <h2
          id="home-manifesto-title"
          className="home-heading home-manifesto__title"
          aria-label="Two voices. One shared stage."
        >
          {headlineLines.map((words, lineIndex) => (
            <span
              className={`home-manifesto__title-line home-manifesto__title-line--${lineIndex + 1}`}
              aria-hidden="true"
              key={words.join("-")}
            >
              {words.map((word, wordIndex) => {
                const absoluteIndex =
                  lineIndex === 0 ? wordIndex : wordIndex + 2;
                return (
                  <ScrollWord
                    key={word}
                    progress={scrollYProgress}
                    range={[
                      0.12 + absoluteIndex * 0.055,
                      0.27 + absoluteIndex * 0.055,
                    ]}
                    reduceMotion={reduceMotion}
                  >
                    {word}
                  </ScrollWord>
                );
              })}
            </span>
          ))}
        </h2>

        <HomeReveal className="home-manifesto__copy" delay={0.12}>
          <p>
            Dress Emir and Friska as two distinct voices in one composition—each
            look answers the other until the chorus feels complete.
          </p>
          <span>TWO CHARACTERS. ONE SHARED RHYTHM.</span>
        </HomeReveal>

        <motion.div
          className="home-manifesto__thread home-manifesto__thread--one"
          style={{ y: firstThreadY }}
          aria-hidden="true"
        >
          <DuetThread
            progress={scrollYProgress}
            reduceMotion={reduceMotion}
            voice="one"
          />
        </motion.div>

        <motion.div
          className="home-manifesto__thread home-manifesto__thread--two"
          style={{ y: secondThreadY }}
          aria-hidden="true"
        >
          <DuetThread
            progress={scrollYProgress}
            reduceMotion={reduceMotion}
            voice="two"
          />
        </motion.div>

        <motion.div
          className="home-manifesto__bow"
          style={{ rotate: bowRotate }}
          aria-hidden="true"
        >
          <Bow />
        </motion.div>

        <motion.div
          className="home-manifesto__spark home-manifesto__spark--one"
          animate={
            reduceMotion
              ? undefined
              : { rotate: [0, 8, 0], scale: [1, 1.06, 1] }
          }
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Sparkle />
        </motion.div>

      </div>

      <div className="home-manifesto__edge-note" aria-hidden="true">
        <span>KEEP THE CHORUS MOVING →</span>
      </div>
    </section>
  );
}

function ScrollWord({
  children,
  progress,
  range,
  reduceMotion,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  reduceMotion: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, ["0.42em", "0em"]);

  return (
    <motion.span
      className="home-manifesto__word"
      style={reduceMotion ? undefined : { opacity, y }}
    >
      {children}
    </motion.span>
  );
}

function DuetThread({
  progress,
  reduceMotion,
  voice,
}: {
  progress: MotionValue<number>;
  reduceMotion: boolean;
  voice: "one" | "two";
}) {
  const pathLength = useTransform(
    progress,
    voice === "one" ? [0.08, 0.55] : [0.18, 0.68],
    reduceMotion ? [1, 1] : [0, 1],
  );
  const opacity = useTransform(
    progress,
    voice === "one" ? [0.08, 0.2] : [0.18, 0.3],
    reduceMotion ? [1, 1] : [0, 1],
  );
  const path =
    voice === "one"
      ? "M5 100C71 24 128 171 203 78C268 -2 328 148 399 65C446 10 492 34 548 79"
      : "M7 55C75 136 143 -4 215 87C280 169 342 16 414 100C456 149 503 128 554 81";

  return (
    <svg viewBox="0 0 560 170" fill="none">
      <motion.path
        d={path}
        style={{ pathLength, opacity }}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
