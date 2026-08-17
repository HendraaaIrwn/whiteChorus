import { describe, expect, it } from "vitest";

import {
  buildLookDetailHref,
  createHallLookDetailContext,
  DAILY_WINNER_LOOK_DETAIL_CONTEXT,
  resolveLookDetailNavigation,
} from "@/features/outfits/look-detail-navigation";

describe("Look Detail navigation context", () => {
  it("preserves the active Hall sort and page in the detail URL", () => {
    const context = createHallLookDetailContext("trending", 3);
    const href = buildLookDetailHref("outfit-1", context);
    const url = new URL(href, "https://white-chorus.test");

    expect(url.pathname).toBe("/outfits/outfit-1");
    expect(url.searchParams.get("from")).toBe("hall-of-fame");
    expect(url.searchParams.get("returnTo")).toBe(
      "/hall-of-fame?sort=trending&page=3",
    );
    expect(
      resolveLookDetailNavigation(Object.fromEntries(url.searchParams)),
    ).toEqual({
      origin: "hall-of-fame",
      returnTo: "/hall-of-fame?sort=trending&page=3",
      backLabel: "BACK TO HALL OF FAME",
    });
  });

  it("resolves Daily Winner context to the singular back label", () => {
    const href = buildLookDetailHref(
      "outfit-2",
      DAILY_WINNER_LOOK_DETAIL_CONTEXT,
    );
    const url = new URL(href, "https://white-chorus.test");

    expect(
      resolveLookDetailNavigation(Object.fromEntries(url.searchParams)),
    ).toEqual({
      origin: "daily-winner",
      returnTo: "/daily-winners",
      backLabel: "BACK TO DAILY WINNER",
    });
  });

  it("falls back safely for direct, malformed, and external contexts", () => {
    const fallback = {
      origin: "hall-of-fame",
      returnTo: "/hall-of-fame",
      backLabel: "BACK TO HALL OF FAME",
    };

    expect(resolveLookDetailNavigation({})).toEqual(fallback);
    expect(
      resolveLookDetailNavigation({
        from: "unknown",
        returnTo: "/daily-winners",
      }),
    ).toEqual(fallback);
    expect(
      resolveLookDetailNavigation({
        from: "hall-of-fame",
        returnTo: "https://example.com/hall-of-fame",
      }),
    ).toEqual(fallback);
    expect(
      resolveLookDetailNavigation({
        from: "hall-of-fame",
        returnTo: "/hall-of-fame?sort=unknown&page=0",
      }),
    ).toEqual(fallback);
  });
});
