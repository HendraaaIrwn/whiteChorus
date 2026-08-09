import type { Variants } from "framer-motion";

export const motionEase = [0.2, 0.8, 0.2, 1] as const;

export const editorialEase = [0.22, 1, 0.36, 1] as const;

export const editorialMotionDurations = {
  layerExit: 0.16,
  layerEnter: 0.26,
  interaction: 0.32,
  background: 0.52,
  scene: 0.76,
  randomize: 0.68,
} as const;

export const motionDurations = {
  instant: 0.08,
  fast: 0.15,
  base: 0.22,
  slow: 0.36,
  celebration: 0.65,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.slow, ease: motionEase },
  },
};

export const softScale: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionDurations.base, ease: motionEase },
  },
};

export const stagger = (delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { delayChildren, staggerChildren: 0.07 },
  },
});

export const tactileSelection: Variants = {
  idle: { y: 0, scale: 1 },
  selected: {
    y: -2,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 30 },
  },
};
