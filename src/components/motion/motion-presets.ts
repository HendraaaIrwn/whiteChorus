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
