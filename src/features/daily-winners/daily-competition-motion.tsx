"use client";

import { animate, motion } from "framer-motion";
import Link from "next/link";
import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";

import { editorialEase } from "@/components/motion/motion-presets";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";

const SCROLL_DURATION_SECONDS = 0.48;
const SCROLL_BREATHING_ROOM_PX = 24;

export function SmoothRankingLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const stopActiveAnimationRef = useRef<() => void>(() => undefined);

  useEffect(() => () => stopActiveAnimationRef.current(), []);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = document.getElementById("live-ranking-title");
    if (!target) return;

    event.preventDefault();
    stopActiveAnimationRef.current();

    const header = document.querySelector<HTMLElement>(".site-header--winners");
    const headerOffset =
      (header?.getBoundingClientRect().height ?? 72) + SCROLL_BREATHING_ROOM_PX;
    const maximumScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const targetScroll = Math.min(
      maximumScroll,
      Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - headerOffset,
      ),
    );

    if (window.location.hash !== "#live-ranking-title") {
      window.history.pushState(null, "", "#live-ranking-title");
    }

    const focusTarget = () => target.focus({ preventScroll: true });
    if (reduceMotion) {
      window.scrollTo(0, targetScroll);
      focusTarget();
      return;
    }

    let controls: ReturnType<typeof animate> | null = null;
    let listenersAttached = true;
    const scrollKeys = new Set([
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " ",
    ]);

    const removeInterruptionListeners = () => {
      if (!listenersAttached) return;
      listenersAttached = false;
      window.removeEventListener("wheel", stopAnimation);
      window.removeEventListener("touchstart", stopAnimation);
      window.removeEventListener("keydown", stopOnScrollKey);
    };
    const stopAnimation = () => {
      controls?.stop();
      controls = null;
      removeInterruptionListeners();
    };
    const stopOnScrollKey = (keyboardEvent: KeyboardEvent) => {
      if (scrollKeys.has(keyboardEvent.key)) stopAnimation();
    };

    window.addEventListener("wheel", stopAnimation, { passive: true });
    window.addEventListener("touchstart", stopAnimation, { passive: true });
    window.addEventListener("keydown", stopOnScrollKey);

    controls = animate(window.scrollY, targetScroll, {
      duration: SCROLL_DURATION_SECONDS,
      ease: editorialEase,
      onUpdate: (value) => window.scrollTo(0, value),
      onComplete: () => {
        controls = null;
        removeInterruptionListeners();
        focusTarget();
      },
    });
    stopActiveAnimationRef.current = stopAnimation;
  };

  return (
    <Link className={className} href="#live-ranking-title" onClick={onClick}>
      {children}
    </Link>
  );
}

export function DailyCompetitionDoodles() {
  const reduceMotion = useHydratedReducedMotion();
  const lineMotion = (delay: number, duration: number) => ({
    initial: reduceMotion ? false : { opacity: 0, pathLength: 0 },
    animate: { opacity: 1, pathLength: 1 },
    transition: reduceMotion
      ? { duration: 0 }
      : { delay, duration, ease: editorialEase },
  });

  return (
    <div className="winner-hero-scene__doodles" aria-hidden="true">
      <svg
        className="winner-hero-scene__doodle winner-hero-scene__doodle--loop"
        viewBox="0 0 420 180"
        fill="none"
      >
        <motion.path
          d="M8 109C60 31 128 36 154 95C179 150 122 170 91 130C59 90 108 40 187 53C264 65 270 155 219 162C168 169 163 83 248 51C311 28 365 51 412 94"
          {...lineMotion(0.28, 0.92)}
        />
      </svg>
      <svg
        className="winner-hero-scene__doodle winner-hero-scene__doodle--rhythm"
        viewBox="0 0 560 150"
        fill="none"
      >
        <motion.path
          d="M7 88C63 22 119 131 179 69C239 7 294 127 354 66C414 4 477 116 553 48"
          {...lineMotion(0.4, 0.82)}
        />
      </svg>
      <svg
        className="winner-hero-scene__doodle winner-hero-scene__doodle--stitch"
        viewBox="0 0 430 120"
        fill="none"
      >
        <motion.path
          d="M6 73C72 23 132 101 197 57C262 13 322 92 424 37"
          strokeDasharray="7 14"
          {...lineMotion(0.5, 0.76)}
        />
      </svg>
    </div>
  );
}
