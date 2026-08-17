import { describe, expect, it } from "vitest";

import {
  rankDailyCandidates,
  type DailyRankingCandidate,
} from "@/features/daily-winners/daily-ranking";

function candidate(
  id: string,
  overrides: Partial<DailyRankingCandidate> = {},
): DailyRankingCandidate {
  return {
    id,
    shortCode: id.toUpperCase(),
    thumbnailPath: `${id}.webp`,
    ratingAverage: 4,
    ratingCount: 5,
    weightedScore: 4,
    publishedAt: new Date("2026-08-09T01:00:00.000Z"),
    ...overrides,
  };
}

describe("daily provisional ranking", () => {
  it("keeps eligible looks above ineligible high-average looks", () => {
    const ranked = rankDailyCandidates(
      [
        candidate("ineligible", {
          ratingAverage: 5,
          ratingCount: 4,
          weightedScore: 4.9,
        }),
        candidate("eligible", {
          ratingAverage: 4.2,
          ratingCount: 5,
          weightedScore: 4.1,
        }),
      ],
      5,
    );

    expect(ranked.map(({ id }) => id)).toEqual(["eligible", "ineligible"]);
    expect(ranked[0]).toMatchObject({
      rank: 1,
      eligible: true,
      ratingsNeeded: 0,
    });
    expect(ranked[1]).toMatchObject({
      rank: 2,
      eligible: false,
      ratingsNeeded: 1,
    });
  });

  it("orders each eligibility group by the authoritative winner tie-breaks", () => {
    const ranked = rankDailyCandidates(
      [
        candidate("later", {
          ratingAverage: 4.8,
          ratingCount: 8,
          weightedScore: 4.4,
          publishedAt: new Date("2026-08-09T02:00:00.000Z"),
        }),
        candidate("higher-score", {
          ratingAverage: 4.2,
          ratingCount: 5,
          weightedScore: 4.5,
        }),
        candidate("earlier", {
          ratingAverage: 4.8,
          ratingCount: 8,
          weightedScore: 4.4,
          publishedAt: new Date("2026-08-09T00:30:00.000Z"),
        }),
      ],
      5,
    );

    expect(ranked.map(({ id }) => id)).toEqual([
      "higher-score",
      "earlier",
      "later",
    ]);
  });

  it("reflects an actual score update and eligibility transition", () => {
    const before = rankDailyCandidates(
      [
        candidate("look-a", { ratingCount: 5, weightedScore: 4.2 }),
        candidate("look-b", { ratingCount: 4, weightedScore: 4.8 }),
      ],
      5,
    );
    const after = rankDailyCandidates(
      [
        candidate("look-a", { ratingCount: 5, weightedScore: 4.2 }),
        candidate("look-b", { ratingCount: 5, weightedScore: 4.4 }),
      ],
      5,
    );

    expect(before.map(({ id }) => id)).toEqual(["look-a", "look-b"]);
    expect(after.map(({ id }) => id)).toEqual(["look-b", "look-a"]);
    expect(after[0]).toMatchObject({ eligible: true, ratingsNeeded: 0 });
  });

  it("returns the complete ranking with a global page offset without mutating candidates", () => {
    const source = [
      candidate("three", { weightedScore: 3 }),
      candidate("one", { weightedScore: 5 }),
      candidate("two", { weightedScore: 4 }),
    ];

    expect(
      rankDailyCandidates(source, 5, { rankOffset: 10 }).map(
        ({ id, rank }) => ({ id, rank }),
      ),
    ).toEqual([
      { id: "one", rank: 11 },
      { id: "two", rank: 12 },
      { id: "three", rank: 13 },
    ]);
    expect(source.map(({ id }) => id)).toEqual(["three", "one", "two"]);
  });
});
