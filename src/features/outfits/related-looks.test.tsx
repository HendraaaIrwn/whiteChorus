import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { OutfitCardDTO } from "@/features/outfits/outfit.types";

vi.mock("@/features/hall-of-fame/hall-look-card", () => ({
  HallLookCard: ({ outfit }: { outfit: OutfitCardDTO }) => (
    <article data-outfit-id={outfit.id} />
  ),
}));

import { RelatedLooks } from "@/features/outfits/related-looks";

function makeOutfit(index: number): OutfitCardDTO {
  return {
    id: `outfit-${index}`,
    shortCode: `WC-${index}`,
    thumbnailUrl: `/look-${index}.webp`,
    ratingAverage: 4,
    ratingCount: index,
    publishedAt: "2026-08-09T00:00:00.000Z",
    expiresAt: "2026-08-16T00:00:00.000Z",
    remainingDays: 7,
    isDailyWinner: false,
  };
}

describe("RelatedLooks", () => {
  it("omits the section when no active related looks are available", () => {
    expect(renderToStaticMarkup(<RelatedLooks outfits={[]} />)).toBe("");
  });

  it("renders no more than three real looks and matches the visible count", () => {
    const html = renderToStaticMarkup(
      <RelatedLooks
        outfits={Array.from({ length: 4 }, (_, index) => makeOutfit(index))}
      />,
    );

    expect(html.match(/data-outfit-id=/g)).toHaveLength(3);
    expect(html).toContain("3 more voices from the Hall.");
    expect(html).not.toContain("outfit-3");
  });
});
