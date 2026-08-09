"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { productionAssets } from "@/features/dress-up/catalog";
import { FabricRibbon, Sparkle } from "@/features/home/home-doodles";

export function HeroStageArtwork({ animateIntro }: { animateIntro: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 95, damping: 18, mass: 0.6 });
  const smoothY = useSpring(y, { stiffness: 95, damping: 18, mass: 0.6 });

  return (
    <div
      className="hero-stage__artwork"
      onPointerMove={(event) => {
        if (
          !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 14);
        y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 10);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div
        className="home-hero__background"
        initial={animateIntro ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: animateIntro ? 0.5 : 0, delay: 0.05 }}
      >
        <Image
          className="hero-stage__background"
          src="/dress-up/backgrounds/background-01.webp"
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 66vw"
          priority
        />
      </motion.div>
      <motion.div
        className="home-hero__ribbon"
        initial={
          animateIntro ? { opacity: 0, scaleX: 0.42, rotate: -9 } : false
        }
        animate={{ opacity: 1, scaleX: 1, rotate: -4 }}
        transition={{
          duration: animateIntro ? 0.72 : 0,
          delay: animateIntro ? 0.46 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        aria-hidden="true"
      >
        <FabricRibbon />
      </motion.div>
      <motion.div
        className="hero-person hero-person--a"
        initial={animateIntro ? { opacity: 0, y: 44, rotate: -2 } : false}
        animate={{ opacity: 1, y: 0 }}
        style={{ x: smoothX, translateY: smoothY }}
        transition={{
          duration: animateIntro ? 0.68 : 0,
          delay: animateIntro ? 0.63 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Image
          src={productionAssets.characterLooks.emir}
          alt="Emir wearing a dark layered White Chorus look."
          fill
          sizes="(max-width: 767px) 58vw, 36vw"
          priority
        />
      </motion.div>
      <motion.div
        className="hero-person hero-person--b"
        initial={animateIntro ? { opacity: 0, y: 44, rotate: 2 } : false}
        animate={{ opacity: 1, y: 0 }}
        style={{ x: smoothX, translateY: smoothY }}
        transition={{
          duration: animateIntro ? 0.68 : 0,
          delay: animateIntro ? 0.75 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Image
          src={productionAssets.characterLooks.friska}
          alt="Friska wearing a cropped dark White Chorus look."
          fill
          sizes="(max-width: 767px) 58vw, 36vw"
          priority
        />
      </motion.div>
      <motion.div
        className="hero-stage__spark"
        aria-hidden="true"
        initial={
          animateIntro ? { opacity: 0, scale: 0.65, rotate: -18 } : false
        }
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          duration: animateIntro ? 0.24 : 0.08,
          delay: animateIntro ? 1.04 : 0,
        }}
      >
        <Sparkle />
      </motion.div>
      <span className="hero-caption">EMIR / FRISKA · 2026</span>
    </div>
  );
}
