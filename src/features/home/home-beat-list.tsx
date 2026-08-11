"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { editorialEase } from "@/components/motion/motion-presets";
import { Bow, Sparkle, StitchedArrow } from "@/features/home/home-doodles";

const beats = [
  {
    number: "01",
    title: "DRESS",
    copy: "Choose Emir or Friska, then build each look from the White Chorus wardrobe.",
    artwork: <Sparkle />,
  },
  {
    number: "02",
    title: "MIX",
    copy: "Move between both characters and the shared stage until the duet feels right.",
    artwork: <Bow />,
  },
  {
    number: "03",
    title: "SHARE",
    copy: "Publish one anonymous snapshot to the living archive.",
    artwork: <StitchedArrow />,
  },
] as const;

const entrances = [
  {
    number: { x: -34, y: 62, scale: 0.88 },
    title: { x: -24, y: "108%" },
    body: { x: -14, y: 18 },
    art: { x: -24, rotate: -7, scale: 0.86 },
    drift: { x: [-8, 10], y: [12, -12] },
  },
  {
    number: { x: 38, y: 30, scale: 0.92 },
    title: { x: 22, y: "-108%" },
    body: { x: 14, y: 16 },
    art: { x: 22, rotate: 7, scale: 0.9 },
    drift: { x: [10, -10], y: [-8, 10] },
  },
  {
    number: { x: 0, y: 72, scale: 0.82 },
    title: { x: 42, y: "0%" },
    body: { x: 0, y: 22 },
    art: { x: 0, rotate: -5, scale: 0.76 },
    drift: { x: [-5, 7], y: [14, -10] },
  },
] as const;

function Beat({
  beat,
  index,
}: {
  beat: (typeof beats)[number];
  index: number;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const beatRef = useRef<HTMLDivElement>(null);
  const entrance = entrances[index];
  const { scrollYProgress } = useScroll({
    target: beatRef,
    offset: ["start end", "end start"],
  });
  const driftX = useTransform(scrollYProgress, [0, 1], [...entrance.drift.x]);
  const driftY = useTransform(scrollYProgress, [0, 1], [...entrance.drift.y]);

  const number: Variants = {
    hidden: { opacity: 0, ...entrance.number },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.7,
        ease: editorialEase,
      },
    },
  };
  const title: Variants = {
    hidden: { opacity: 0, ...entrance.title },
    visible: {
      opacity: 1,
      x: 0,
      y: "0%",
      transition: {
        delay: reduceMotion ? 0 : 0.1,
        duration: reduceMotion ? 0 : 0.68,
        ease: editorialEase,
      },
    },
  };
  const body: Variants = {
    hidden: { opacity: 0, ...entrance.body },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay: reduceMotion ? 0 : 0.24,
        duration: reduceMotion ? 0 : 0.52,
        ease: editorialEase,
      },
    },
  };
  const art: Variants = {
    hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)", ...entrance.art },
    visible: {
      opacity: 1,
      clipPath: "inset(0 0% 0 0)",
      x: 0,
      rotate: 0,
      scale: 1,
      transition: {
        delay: reduceMotion ? 0 : 0.38,
        duration: reduceMotion ? 0 : 0.72,
        ease: editorialEase,
      },
    },
  };

  return (
    <motion.div
      ref={beatRef}
      className="home-how__step"
      data-beat={beat.number}
      variants={{ hidden: {}, visible: {} }}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? "visible" : undefined}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.48 }}
    >
      <span className="home-how__number-mask">
        <motion.span className="home-how__number" variants={number}>
          {beat.number}
        </motion.span>
      </span>
      <div className="home-how__copy">
        <span className="home-how__title-mask">
          <motion.h3 variants={title}>{beat.title}</motion.h3>
        </span>
        <motion.p variants={body}>{beat.copy}</motion.p>
      </div>
      <motion.div className="home-how__art" aria-hidden="true" variants={art}>
        <motion.div
          className="home-how__art-drift"
          style={reduceMotion ? undefined : { x: driftX, y: driftY }}
        >
          {beat.artwork}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function HomeBeatList() {
  const reduceMotion = useHydratedReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 78%", "end 34%"],
  });

  return (
    <ol ref={listRef} className="home-how__list">
      <motion.span
        className="home-how__progress"
        aria-hidden="true"
        style={reduceMotion ? { scaleY: 1 } : { scaleY: scrollYProgress }}
      />
      {beats.map((beat, index) => (
        <li key={beat.number} className={index % 2 ? "is-offset" : undefined}>
          <Beat beat={beat} index={index} />
        </li>
      ))}
    </ol>
  );
}
