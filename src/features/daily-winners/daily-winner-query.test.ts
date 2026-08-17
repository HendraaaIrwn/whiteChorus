import { describe, expect, it } from "vitest";

import { dailyWinnerQuerySchema } from "@/features/daily-winners/daily-winner-query";

describe("Daily Winner API query", () => {
  it("defaults to page one and accepts a positive integer page", () => {
    expect(dailyWinnerQuerySchema.parse({})).toEqual({ page: 1 });
    expect(dailyWinnerQuerySchema.parse({ page: "2" })).toEqual({ page: 2 });
  });

  it.each(["not-a-page", "1.5", "0", "-1"])(
    "rejects invalid page input %s",
    (page) => {
      expect(() => dailyWinnerQuerySchema.parse({ page })).toThrow();
    },
  );
});
