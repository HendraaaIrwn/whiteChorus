import { describe, expect, it } from "vitest";

import { trendingScore } from "@/features/hall-of-fame/trending-score";

describe("trendingScore", () => {
  it("uses ratings, shares, weighted score, and age decay", () => {
    const now = new Date("2026-08-02T00:00:00Z");
    expect(
      trendingScore({
        recentRatings: 2,
        recentShares: 3,
        weightedScore: 4,
        publishedAt: new Date("2026-08-01T00:00:00Z"),
        now,
      }),
    ).toBe(28);
  });
});
