import { describe, expect, it } from "vitest";

import {
  buildHomeLooks,
  curatedHomeLooks,
} from "@/features/home/home-look-data";
import { validateCatalogConfiguration } from "@/features/dress-up/catalog";
import type { OutfitCardDTO } from "@/features/outfits/outfit.types";

function outfit(id: string, shortCode = id): OutfitCardDTO {
  return {
    id,
    shortCode,
    thumbnailUrl: "",
    ratingAverage: 4.2,
    ratingCount: 7,
    publishedAt: "2026-08-09T00:00:00.000Z",
    expiresAt: "2026-08-16T00:00:00.000Z",
    remainingDays: 7,
    isDailyWinner: false,
  };
}

describe("homepage look composition", () => {
  it("keeps live ordering, removes the winner, and fills six slots", () => {
    const result = buildHomeLooks(
      [outfit("one"), outfit("winner", "DAILY"), outfit("two")],
      "DAILY",
    );

    expect(result).toHaveLength(6);
    expect(result.slice(0, 2).map((look) => look.id)).toEqual([
      "live-one",
      "live-two",
    ]);
    expect(result.slice(2).every((look) => look.kind === "curated")).toBe(true);
  });

  it("caps the live collection at six entries", () => {
    const result = buildHomeLooks(
      Array.from({ length: 8 }, (_, index) => outfit(String(index))),
    );

    expect(result).toHaveLength(6);
    expect(result.every((look) => look.kind === "live")).toBe(true);
  });

  it("uses only valid catalog configurations for curated art", () => {
    expect(
      curatedHomeLooks.flatMap((look) =>
        validateCatalogConfiguration(look.configuration),
      ),
    ).toEqual([]);
  });

  it("does not attach ratings or submission state to curated looks", () => {
    for (const look of curatedHomeLooks) {
      expect(look).not.toHaveProperty("outfit");
      expect(look).not.toHaveProperty("ratingAverage");
      expect(look).not.toHaveProperty("ratingCount");
    }
  });
});
