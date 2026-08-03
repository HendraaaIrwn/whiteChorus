"use client";

import { animated, to, useSpring } from "@react-spring/web";
import type { PointerEvent } from "react";

import { BorderBeam } from "@/components/motion/border-beam";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { MusicFlourish } from "@/features/home/music-flourish";
import { RiveAvatarAccent } from "@/features/home/rive-avatar-accent";

export function HeroStageArtwork() {
  const reduceMotion = useHydratedReducedMotion();
  const [{ x, y }, springApi] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { mass: 0.65, tension: 190, friction: 20 },
  }));

  function moveSpotlight(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    springApi.start({ x: relativeX * 10, y: relativeY * 8 });
  }

  function resetSpotlight() {
    springApi.start({ x: 0, y: 0, immediate: reduceMotion });
  }

  return (
    <div
      className="hero-stage__interaction"
      onPointerLeave={resetSpotlight}
      onPointerMove={moveSpotlight}
    >
      <animated.div
        className="hero-stage__spring-layer"
        style={{
          transform: to(
            [x, y],
            (springX, springY) => `translate3d(${springX}px, ${springY}px, 0)`,
          ),
        }}
      >
        <div className="hero-stage__scroll-layer" data-hero-scroll-layer>
          <span className="paper-note">MIX &amp; MATCH</span>
          <MusicFlourish />
          <RiveAvatarAccent />
          <span className="hero-person hero-person--a" aria-hidden="true" />
          <span className="hero-person hero-person--b" aria-hidden="true" />
          <span className="hero-caption">EMIR + FRISKA ✦</span>
        </div>
      </animated.div>
      <BorderBeam />
    </div>
  );
}
