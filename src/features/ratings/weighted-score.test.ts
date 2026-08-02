import { describe, expect, it } from "vitest";

import { calculateWeightedScore } from "@/features/ratings/weighted-score";

describe("calculateWeightedScore", () => {
  it("pulls low-evidence ratings toward the global mean", () => {
    expect(
      calculateWeightedScore({ average: 5, count: 1, globalAverage: 4.2 }),
    ).toBeCloseTo(4.3333, 3);
    expect(
      calculateWeightedScore({ average: 4.8, count: 40, globalAverage: 4.2 }),
    ).toBeCloseTo(4.7333, 3);
  });
});
