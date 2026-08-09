import { describe, expect, it } from "vitest";

import {
  getCompletedDayPeriod,
  getDayPeriod,
} from "@/features/daily-winners/day-period";

describe("daily winner periods", () => {
  it("uses Asia/Jakarta calendar-day boundaries", () => {
    const period = getDayPeriod(
      new Date("2026-08-08T18:00:00.000Z"),
      "Asia/Jakarta",
    );
    expect(period.key).toBe("2026-08-09");
    expect(period.start.toISOString()).toBe("2026-08-08T17:00:00.000Z");
    expect(period.end.toISOString()).toBe("2026-08-09T17:00:00.000Z");
  });

  it("selects the most recently completed day", () => {
    const period = getCompletedDayPeriod(
      new Date("2026-08-09T17:05:00.000Z"),
      "Asia/Jakarta",
    );
    expect(period.key).toBe("2026-08-09");
    expect(period.start.toISOString()).toBe("2026-08-08T17:00:00.000Z");
    expect(period.end.toISOString()).toBe("2026-08-09T17:00:00.000Z");
  });
});
