"use client";

import { motion, useScroll, useTransform } from "framer-motion";
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
  const firstX = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const secondX = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  return (
    <section
      ref={sceneRef}
      className="home-statement"
      aria-labelledby="home-statement-title"
    >
      <div className="home-statement__sticky">
        <span className="home-label">05 · ONE LIVING ARCHIVE</span>
        <h2 id="home-statement-title">
          <motion.span style={reduceMotion ? undefined : { x: firstX }}>
            EVERY LOOK ADDS
          </motion.span>
          <motion.span style={reduceMotion ? undefined : { x: secondX }}>
            A NEW VOICE.
          </motion.span>
        </h2>
        <ChorusWave aria-hidden="true" />
        <Sparkle aria-hidden="true" />
      </div>
    </section>
  );
}
