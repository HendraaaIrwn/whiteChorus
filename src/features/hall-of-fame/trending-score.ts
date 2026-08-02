export function trendingScore({
  recentRatings,
  recentShares,
  weightedScore,
  publishedAt,
  now,
}: {
  recentRatings: number;
  recentShares: number;
  weightedScore: number;
  publishedAt: Date;
  now: Date;
}): number {
  const ageInDays = Math.max(
    0,
    (now.getTime() - publishedAt.getTime()) / 86_400_000,
  );
  return recentRatings * 3 + recentShares + weightedScore * 5 - ageInDays;
}
