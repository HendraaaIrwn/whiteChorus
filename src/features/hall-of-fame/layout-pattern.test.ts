import { describe, expect, it } from "vitest";

import {
  getHallCardLayout,
  getRelatedLookLayout,
  HALL_CARD_PATTERN,
  HALL_CLUSTER_SIZES,
  RELATED_LOOK_PATTERN,
} from "@/features/hall-of-fame/layout-pattern";

describe("Hall editorial layout pattern", () => {
  it("maps all nine positions to a stable cluster rhythm", () => {
    expect(HALL_CLUSTER_SIZES).toEqual([2, 2, 2, 2, 1]);
    expect(HALL_CARD_PATTERN).toEqual([
      { variant: "large", tone: "aqua" },
      { variant: "portrait", tone: "pink" },
      { variant: "compact", tone: "orange" },
      { variant: "wide", tone: "primary" },
      { variant: "portrait", tone: "soft" },
      { variant: "large", tone: "aqua" },
      { variant: "wide", tone: "pink" },
      { variant: "compact", tone: "orange" },
      { variant: "feature", tone: "primary" },
    ]);
    expect(
      Array.from({ length: 9 }, (_, index) => getHallCardLayout(index)),
    ).toEqual(HALL_CARD_PATTERN);
  });

  it("repeats deterministically without random layout state", () => {
    expect(getHallCardLayout(9)).toEqual(getHallCardLayout(0));
    expect(getHallCardLayout(17)).toEqual(getHallCardLayout(8));
  });

  it("uses a stable large, compact, and wide rhythm for Related Looks", () => {
    expect(RELATED_LOOK_PATTERN).toEqual([
      { variant: "large", tone: "aqua" },
      { variant: "compact", tone: "pink" },
      { variant: "wide", tone: "primary" },
    ]);
    expect(
      Array.from({ length: 3 }, (_, index) => getRelatedLookLayout(index)),
    ).toEqual(RELATED_LOOK_PATTERN);
    expect(getRelatedLookLayout(3)).toEqual(RELATED_LOOK_PATTERN[0]);
  });
});
