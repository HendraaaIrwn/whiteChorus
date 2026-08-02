export const WEIGHTED_SCORE_PRIOR_WEIGHT = 5;

export function calculateWeightedScore({
  average,
  count,
  globalAverage,
  minimumRatings = WEIGHTED_SCORE_PRIOR_WEIGHT,
}: {
  average: number;
  count: number;
  globalAverage: number;
  minimumRatings?: number;
}): number {
  if (count < 0 || minimumRatings <= 0) return 0;
  return (
    (count / (count + minimumRatings)) * average +
    (minimumRatings / (count + minimumRatings)) * globalAverage
  );
}
