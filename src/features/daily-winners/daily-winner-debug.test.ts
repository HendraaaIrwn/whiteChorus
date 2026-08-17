import { describe, expect, it } from "vitest";

import {
  resolveDailyWinnerPlaceholder,
  withFakeDailyWinnerPlaceholder,
} from "@/features/daily-winners/daily-winner-debug";
import type { DailyWinnerSnapshot } from "@/features/daily-winners/daily-winners";

const completedDayKey = "2026-08-16";
const realWinner: DailyWinnerSnapshot = {
  id: "winner-1",
  dayKey: "2026-08-15",
  shortCode: "REAL01",
  imageUrl: "/winner.webp",
  finalAverage: 4.5,
  finalRatingCount: 12,
  finalWeightedScore: 4.321,
  dayStart: "2026-08-15T00:00:00.000Z",
  dayEnd: "2026-08-16T00:00:00.000Z",
};

describe("Daily Winner debug placeholder", () => {
  it("adds a fake completed-day winner when debugging is enabled", () => {
    const winners = withFakeDailyWinnerPlaceholder({
      winners: [realWinner],
      completedDayKey,
      enabled: true,
    });

    expect(winners).toHaveLength(2);
    expect(winners[0]).toMatchObject({
      dayKey: completedDayKey,
      shortCode: "DEBUG01",
      isDebugPlaceholder: true,
    });
    expect(winners[1]).toBe(realWinner);
  });

  it("returns only real data when debugging is disabled", () => {
    const winners = [realWinner];

    expect(
      withFakeDailyWinnerPlaceholder({
        winners,
        completedDayKey,
        enabled: false,
      }),
    ).toBe(winners);
  });

  it("does not duplicate a real winner for the completed day", () => {
    const completedWinner = { ...realWinner, dayKey: completedDayKey };

    expect(
      withFakeDailyWinnerPlaceholder({
        winners: [completedWinner],
        completedDayKey,
        enabled: true,
      }),
    ).toEqual([completedWinner]);
  });

  it("resolves the placeholder detail only for the configured completed day", () => {
    expect(
      resolveDailyWinnerPlaceholder({
        winner: null,
        requestedDayKey: completedDayKey,
        completedDayKey,
        enabled: true,
      }),
    ).toMatchObject({
      dayKey: completedDayKey,
      isDebugPlaceholder: true,
    });

    expect(
      resolveDailyWinnerPlaceholder({
        winner: null,
        requestedDayKey: "2026-08-14",
        completedDayKey,
        enabled: true,
      }),
    ).toBeNull();
  });

  it("always prefers a real winner", () => {
    expect(
      resolveDailyWinnerPlaceholder({
        winner: realWinner,
        requestedDayKey: completedDayKey,
        completedDayKey,
        enabled: true,
      }),
    ).toBe(realWinner);
  });
});
