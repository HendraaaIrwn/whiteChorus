"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { ComponentProps } from "react";
import { useRef } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { ChorusWave, Sparkle } from "@/features/home/home-doodles";

export function EditorialStatement() {
  const sceneRef = useRef<HTMLElement>(null);
  const reduceMotion = useHydratedReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });
  const firstDesktopX = useTransform(scrollYProgress, [0, 1], ["-11%", "11%"]);
  const firstTabletX = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const firstMobileX = useTransform(scrollYProgress, [0, 1], ["-4.5%", "4.5%"]);
  const secondDesktopX = useTransform(scrollYProgress, [0, 1], ["11%", "-11%"]);
  const secondTabletX = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const secondMobileX = useTransform(
    scrollYProgress,
    [0, 1],
    ["4.5%", "-4.5%"],
  );
  const firstY = useTransform(scrollYProgress, [0, 0.5, 1], [18, 0, -14]);
  const secondY = useTransform(scrollYProgress, [0, 0.5, 1], [-14, 0, 18]);
  const firstScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.985, 1.012, 0.995],
  );
  const secondScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.99, 1.008, 0.985],
  );
  const firstOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.74, 1, 0.86],
  );
  const secondOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.8, 1, 0.84],
  );
  const firstLineStyle = reduceMotion
    ? undefined
    : ({
        "--statement-x-desktop": firstDesktopX,
        "--statement-x-tablet": firstTabletX,
        "--statement-x-mobile": firstMobileX,
      } as ComponentProps<typeof motion.span>["style"]);
  const secondLineStyle = reduceMotion
    ? undefined
    : ({
        "--statement-x-desktop": secondDesktopX,
        "--statement-x-tablet": secondTabletX,
        "--statement-x-mobile": secondMobileX,
      } as ComponentProps<typeof motion.span>["style"]);

  return (
    <section
      ref={sceneRef}
      className="home-statement"
      aria-labelledby="home-statement-title"
    >
      <div className="home-statement__sticky">
        <span className="home-label">04 · ONE LIVING ARCHIVE</span>
        <h2 id="home-statement-title">
          <motion.span className="home-statement__line" style={firstLineStyle}>
            <motion.span
              className="home-statement__line-depth"
              style={
                reduceMotion
                  ? undefined
                  : { y: firstY, scale: firstScale, opacity: firstOpacity }
              }
            >
              EVERY LOOK ADDS
            </motion.span>
          </motion.span>
          <motion.span className="home-statement__line" style={secondLineStyle}>
            <motion.span
              className="home-statement__line-depth"
              style={
                reduceMotion
                  ? undefined
                  : { y: secondY, scale: secondScale, opacity: secondOpacity }
              }
            >
              A NEW VOICE.
            </motion.span>
          </motion.span>
        </h2>
        <ChorusWave aria-hidden="true" />
        <Sparkle aria-hidden="true" />
      </div>
    </section>
  );
}
