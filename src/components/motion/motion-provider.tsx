"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";

type MotionExperienceContextValue = {
  landingIntroPlayed: boolean;
  markLandingIntroPlayed(): void;
};

const MotionExperienceContext =
  createContext<MotionExperienceContextValue | null>(null);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [landingIntroPlayed, setLandingIntroPlayed] = useState(false);
  const value = useMemo(
    () => ({
      landingIntroPlayed,
      markLandingIntroPlayed: () => setLandingIntroPlayed(true),
    }),
    [landingIntroPlayed],
  );

  return (
    <MotionConfig reducedMotion="user">
      <MotionExperienceContext.Provider value={value}>
        {children}
      </MotionExperienceContext.Provider>
    </MotionConfig>
  );
}

export function useMotionExperience(): MotionExperienceContextValue {
  const value = useContext(MotionExperienceContext);
  if (!value)
    throw new Error("useMotionExperience must be used inside MotionProvider");
  return value;
}
