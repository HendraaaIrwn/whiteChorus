import { describe, expect, it } from "vitest";

import {
  getCompletedWeekPeriod,
  getWeekPeriod,
} from "@/features/weekly-winners/week-period";

describe("getWeekPeriod", () => {
  it("uses Monday through the next Monday in Asia/Jakarta", () => {
    const period = getWeekPeriod(new Date("2026-08-06T12:00:00Z"));
    expect(period.key).toBe("2026-08-03");
    expect(period.start.toISOString()).toBe("2026-08-02T17:00:00.000Z");
    expect(period.end.toISOString()).toBe("2026-08-09T17:00:00.000Z");
  });

  it("selects the completed week when the Monday cron runs", () => {
    const period = getCompletedWeekPeriod(new Date("2026-08-09T17:05:00.000Z"));
    expect(period.key).toBe("2026-08-03");
    expect(period.start.toISOString()).toBe("2026-08-02T17:00:00.000Z");
    expect(period.end.toISOString()).toBe("2026-08-09T17:00:00.000Z");
  });
});
