export type DailyRankingCandidate = {
  id: string;
  shortCode: string;
  thumbnailPath: string | null;
  ratingAverage: number;
  ratingCount: number;
  weightedScore: number;
  publishedAt: Date | null;
};

export type RankedDailyCandidate = DailyRankingCandidate & {
  rank: number;
  eligible: boolean;
  ratingsNeeded: number;
};

function compareCandidates(
  left: DailyRankingCandidate,
  right: DailyRankingCandidate,
  minimumRatings: number,
) {
  const eligibilityDifference =
    Number(right.ratingCount >= minimumRatings) -
    Number(left.ratingCount >= minimumRatings);
  if (eligibilityDifference) return eligibilityDifference;

  const scoreDifference = right.weightedScore - left.weightedScore;
  if (scoreDifference) return scoreDifference;

  const countDifference = right.ratingCount - left.ratingCount;
  if (countDifference) return countDifference;

  const averageDifference = right.ratingAverage - left.ratingAverage;
  if (averageDifference) return averageDifference;

  const leftPublishedAt =
    left.publishedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const rightPublishedAt =
    right.publishedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const publishedDifference = leftPublishedAt - rightPublishedAt;
  if (publishedDifference) return publishedDifference;

  return left.id.localeCompare(right.id);
}

export function rankDailyCandidates(
  candidates: DailyRankingCandidate[],
  minimumRatings: number,
  take = 10,
): RankedDailyCandidate[] {
  if (!Number.isInteger(minimumRatings) || minimumRatings <= 0) {
    throw new RangeError("minimumRatings must be a positive integer");
  }
  if (!Number.isInteger(take) || take < 0) {
    throw new RangeError("take must be a non-negative integer");
  }

  return [...candidates]
    .sort((left, right) => compareCandidates(left, right, minimumRatings))
    .slice(0, take)
    .map((candidate, index) => {
      const eligible = candidate.ratingCount >= minimumRatings;
      return {
        ...candidate,
        rank: index + 1,
        eligible,
        ratingsNeeded: eligible ? 0 : minimumRatings - candidate.ratingCount,
      };
    });
}
