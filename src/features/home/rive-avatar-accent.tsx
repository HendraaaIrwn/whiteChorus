"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";

const LazyRiveAvatarCanvas = dynamic(
  () =>
    import("@/features/home/rive-avatar-canvas").then(
      (module) => module.RiveAvatarCanvas,
    ),
  { ssr: false },
);

export function RiveAvatarAccent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useHydratedReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "80px", threshold: 0.1 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const shouldRenderRive = isVisible && !reduceMotion && !hasFailed;

  return (
    <div className="rive-avatar-accent" ref={rootRef}>
      <span aria-hidden="true" className="rive-avatar-fallback">
        <span>•</span>
        <span>⌣</span>
        <span>•</span>
      </span>
      {shouldRenderRive ? (
        <LazyRiveAvatarCanvas
          active={isVisible}
          onFailure={() => setHasFailed(true)}
        />
      ) : null}
      <span aria-hidden="true" className="rive-avatar-label">
        RIVE LIVE
      </span>
    </div>
  );
}
