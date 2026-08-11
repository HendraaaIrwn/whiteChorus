"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, type RefObject } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { productionAssets } from "@/features/dress-up/catalog";
import { Sparkle } from "@/features/home/home-doodles";

const heroEase = [0.22, 1, 0.36, 1] as const;
const fabricWavePath =
  "M-180 253C-8 42 135 50 258 203C374 347 492 352 596 202C699 54 809 37 915 176C1000 288 1118 310 1380 171";
const waveDrawDuration = 2.25;
const waveDrawDelay = 0.18;
const waveDrawEase = [0.65, 0, 0.35, 1] as const;

type HeroArtworkProps = {
  animateIntro: boolean;
  heroRef: RefObject<HTMLElement | null>;
};

export function HeroWaveArtwork({ animateIntro }: HeroArtworkProps) {
  const reduceMotion = useHydratedReducedMotion();
  const playIntro = animateIntro && !reduceMotion;
  const drawTransition = {
    duration: playIntro ? waveDrawDuration : 0,
    delay: playIntro ? waveDrawDelay : 0,
    ease: waveDrawEase,
  } as const;

  return (
    <div className="home-hero__wave-layer" aria-hidden="true">
      <svg
        className="home-hero__wave"
        viewBox="0 0 1200 420"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="home-hero-pink-wave-gradient"
            x1="-180"
            y1="0"
            x2="1380"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#efd7dd" />
            <stop offset="0.48" stopColor="var(--home-accent-pink)" />
            <stop offset="1" stopColor="#bd8e9b" />
          </linearGradient>
          <mask
            id="home-hero-cyan-path-reveal"
            x="-240"
            y="-80"
            width="1680"
            height="580"
            maskUnits="userSpaceOnUse"
          >
            <motion.path
              d={fabricWavePath}
              stroke="white"
              strokeLinecap="round"
              strokeWidth="14"
              initial={playIntro ? { pathLength: 0.001 } : false}
              animate={{ pathLength: 1 }}
              transition={drawTransition}
            />
          </mask>
        </defs>
        <motion.path
          className="home-hero__wave-pink"
          d={fabricWavePath}
          fill="none"
          stroke="url(#home-hero-pink-wave-gradient)"
          strokeLinecap="round"
          strokeWidth="112"
          initial={playIntro ? { pathLength: 0.001 } : false}
          animate={{ pathLength: 1 }}
          transition={drawTransition}
        />
        <path
          className="home-hero__wave-cyan"
          d={fabricWavePath}
          fill="none"
          pathLength="1"
          stroke="var(--home-accent-aqua-soft)"
          strokeDasharray="0.009 0.024"
          strokeLinecap="round"
          strokeWidth="4"
          mask="url(#home-hero-cyan-path-reveal)"
        />
      </svg>
    </div>
  );
}

export function HeroStageArtwork({ animateIntro, heroRef }: HeroArtworkProps) {
  const reduceMotion = useHydratedReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, {
    stiffness: 95,
    damping: 18,
    mass: 0.6,
  });
  const smoothY = useSpring(pointerY, {
    stiffness: 95,
    damping: 18,
    mass: 0.6,
  });
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const emirScrollY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -42],
  );
  const friskaScrollY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -52],
  );
  const sparkleScrollY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -70],
  );
  const emirX = useTransform(() => smoothX.get() * 0.72);
  const friskaX = useTransform(() => smoothX.get());
  const sparkleX = useTransform(() => smoothX.get() * -0.42);
  const emirY = useTransform(() => emirScrollY.get() + smoothY.get() * 0.68);
  const friskaY = useTransform(
    () => friskaScrollY.get() + smoothY.get() * 0.92,
  );
  const sparkleY = useTransform(
    () => sparkleScrollY.get() + smoothY.get() * -0.5,
  );
  const playIntro = animateIntro && !reduceMotion;

  useEffect(() => {
    const hero = heroRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!hero || reduceMotion || !finePointer.matches) return;

    let frame = 0;
    let latestEvent: PointerEvent | null = null;
    const update = () => {
      frame = 0;
      if (!latestEvent) return;
      const bounds = hero.getBoundingClientRect();
      const normalizedX =
        (latestEvent.clientX - bounds.left) / bounds.width - 0.5;
      const normalizedY =
        (latestEvent.clientY - bounds.top) / bounds.height - 0.5;
      pointerX.set(normalizedX * 16);
      pointerY.set(normalizedY * 10);
    };
    const move = (event: PointerEvent) => {
      latestEvent = event;
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const reset = () => {
      latestEvent = null;
      pointerX.set(0);
      pointerY.set(0);
    };

    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", reset);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
    };
  }, [heroRef, pointerX, pointerY, reduceMotion]);

  return (
    <div className="hero-stage__artwork">
      <motion.div
        className="home-hero__background"
        initial={playIntro ? { opacity: 0 } : false}
        animate={{ opacity: 0.2 }}
        transition={{ duration: playIntro ? 0.5 : 0, delay: 0.05 }}
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
        className="hero-person-shell hero-person-shell--a"
        style={{ x: emirX, y: emirY }}
      >
        <motion.div
          className="hero-person hero-person--a"
          initial={playIntro ? { opacity: 0, y: 44, rotate: -2 } : false}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{
            duration: playIntro ? 0.68 : 0,
            delay: playIntro ? 0.65 : 0,
            ease: heroEase,
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
      </motion.div>

      <motion.div
        className="hero-person-shell hero-person-shell--b"
        style={{ x: friskaX, y: friskaY }}
      >
        <motion.div
          className="hero-person hero-person--b"
          initial={playIntro ? { opacity: 0, y: 44, rotate: 2 } : false}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{
            duration: playIntro ? 0.68 : 0,
            delay: playIntro ? 0.77 : 0,
            ease: heroEase,
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
      </motion.div>

      <motion.div
        className="hero-stage__spark"
        style={{ x: sparkleX, y: sparkleY }}
      >
        <motion.div
          initial={playIntro ? { opacity: 0, scale: 0.72, rotate: -14 } : false}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: playIntro ? 0.34 : 0,
            delay: playIntro ? 0.98 : 0,
            ease: heroEase,
          }}
        >
          <motion.div
            className="home-hero__sparkle-idle home-hero__sparkle-idle--stage"
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -5, 0], rotate: [0, 6, 0], scale: [1, 1.04, 1] }
            }
            transition={{
              duration: 4.2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Sparkle />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
