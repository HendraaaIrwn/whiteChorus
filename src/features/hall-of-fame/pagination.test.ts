import { describe, expect, it } from "vitest";

import { getHallPaginationHref } from "@/features/hall-of-fame/pagination";

describe("Hall pagination URLs", () => {
  it("keeps both sort and page in previous and next links", () => {
    expect(getHallPaginationHref("top-rated", 1)).toBe(
      "/hall-of-fame?sort=top-rated&page=1",
    );
    expect(getHallPaginationHref("trending", 7)).toBe(
      "/hall-of-fame?sort=trending&page=7",
    );
  });
});
