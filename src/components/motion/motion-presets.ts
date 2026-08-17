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

/**
 * Shared microinteraction primitives for the "selectable card" family.
 * The background carousel cards are the authoritative source of truth;
 * wardrobe outfit icons reuse these exact values so hover/press/selected
 * motion stays in the same interaction family.
 */
export const selectableCardHover = { y: -5, scale: 1.03 };

export const selectableCardTap = { scale: 0.97 };

export const selectableCardSpring = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.7,
} as const;
