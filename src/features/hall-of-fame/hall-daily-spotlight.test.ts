import { describe, expect, it } from "vitest";

import { getHallDailySpotlight } from "@/features/hall-of-fame/hall-daily-spotlight";

const winner = {
  dayKey: "2026-08-08",
  shortCode: "WC-0008",
  imageUrl: "/winner.webp",
  finalAverage: 4.8,
  finalRatingCount: 18,
};

describe("Hall Daily Spotlight isolation", () => {
  it("returns the current winner when one exists", async () => {
    await expect(getHallDailySpotlight(async () => winner)).resolves.toEqual({
      status: "winner",
      winner,
    });
  });

  it("keeps the spotlight open when no winner exists", async () => {
    await expect(getHallDailySpotlight(async () => null)).resolves.toEqual({
      status: "open",
      winner: null,
    });
  });

  it("classifies a missing Daily Winner table without throwing", async () => {
    await expect(
      getHallDailySpotlight(async () => {
        throw { code: "P2021", meta: { modelName: "DailyWinner" } };
      }),
    ).resolves.toEqual({ status: "not-ready", winner: null });
  });

  it("degrades only the spotlight for unexpected winner failures", async () => {
    await expect(
      getHallDailySpotlight(async () => {
        throw new Error("winner database unavailable");
      }),
    ).resolves.toEqual({ status: "degraded", winner: null });
  });
});
