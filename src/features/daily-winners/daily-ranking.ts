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

export const DAILY_SCORE_ORDER_BY = [
  { weightedScore: "desc" },
  { ratingCount: "desc" },
  { ratingAverage: "desc" },
  { publishedAt: "asc" },
  { id: "asc" },
] as const;

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
  { rankOffset = 0 }: { rankOffset?: number } = {},
): RankedDailyCandidate[] {
  if (!Number.isInteger(minimumRatings) || minimumRatings <= 0) {
    throw new RangeError("minimumRatings must be a positive integer");
  }
  if (!Number.isInteger(rankOffset) || rankOffset < 0) {
    throw new RangeError("rankOffset must be a non-negative integer");
  }

  return [...candidates]
    .sort((left, right) => compareCandidates(left, right, minimumRatings))
    .map((candidate, index) => {
      const eligible = candidate.ratingCount >= minimumRatings;
      return {
        ...candidate,
        rank: rankOffset + index + 1,
        eligible,
        ratingsNeeded: eligible ? 0 : minimumRatings - candidate.ratingCount,
      };
    });
}
