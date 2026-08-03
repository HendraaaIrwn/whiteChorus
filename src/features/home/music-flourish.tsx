"use client";

import { useEffect, useRef } from "react";
import type { Timeline } from "animejs";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";

export function MusicFlourish() {
  const rootRef = useRef<SVGSVGElement>(null);
  const reduceMotion = useHydratedReducedMotion();

  useEffect(() => {
    if (reduceMotion || !rootRef.current) return;

    let cancelled = false;
    let timeline: Timeline | null = null;
    const root = rootRef.current;

    async function playFlourish() {
      const { createTimeline, stagger } = await import("animejs");
      if (cancelled) return;

      const strokes = root.querySelectorAll<SVGPathElement>(
        "[data-anime-stroke]",
      );
      const notes = root.querySelectorAll<SVGGElement>("[data-anime-note]");
      const star = root.querySelector<SVGGElement>("[data-anime-star]");

      timeline = createTimeline({
        defaults: { duration: 360, ease: "out(3)" },
      })
        .add(
          strokes,
          {
            opacity: { from: 0.28 },
            strokeDashoffset: { from: 1 },
            delay: stagger(45),
          },
          0,
        )
        .add(
          notes,
          {
            opacity: { from: 0 },
            scale: { from: 0.8 },
            y: { from: 8 },
            delay: stagger(55),
            duration: 260,
          },
          70,
        );

      if (star) {
        timeline.add(
          star,
          {
            opacity: { from: 0 },
            rotate: { from: -18 },
            scale: { from: 0.72 },
            duration: 300,
          },
          "-=180",
        );
      }
    }

    void playFlourish();

    return () => {
      cancelled = true;
      timeline?.revert();
    };
  }, [reduceMotion]);

  return (
    <svg
      aria-hidden="true"
      className="music-flourish"
      ref={rootRef}
      viewBox="0 0 150 96"
    >
      <path
        d="M12 68C39 38 71 78 102 42C115 27 126 22 140 21"
        data-anime-stroke
        pathLength="1"
      />
      <path d="M27 78C50 62 76 83 96 66" data-anime-stroke pathLength="1" />
      <g data-anime-note transform="translate(43 38)">
        <path d="M0 0V25" />
        <ellipse cx="-5" cy="27" rx="7" ry="5" />
        <path d="M0 1L13 -2" />
      </g>
      <g data-anime-note transform="translate(103 19)">
        <path d="M0 0V23" />
        <ellipse cx="-5" cy="25" rx="7" ry="5" />
        <path d="M0 1L13 -2V18" />
        <ellipse cx="8" cy="20" rx="7" ry="5" />
      </g>
      <g data-anime-star transform="translate(122 66)">
        <path d="M0 -10L3 -3L10 0L3 3L0 10L-3 3L-10 0L-3 -3Z" />
      </g>
    </svg>
  );
}
