import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { OutfitCardDTO } from "@/features/outfits/outfit.types";

vi.mock("@/features/hall-of-fame/hall-look-card", () => ({
  HallLookCard: ({
    detailHref,
    outfit,
  }: {
    detailHref: string;
    outfit: OutfitCardDTO;
  }) => <article data-detail-href={detailHref} data-outfit-id={outfit.id} />,
}));

import { RelatedLooks } from "@/features/outfits/related-looks";

const navigationContext = {
  origin: "daily-winner",
  returnTo: "/daily-winners",
} as const;

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
    expect(
      renderToStaticMarkup(
        <RelatedLooks navigationContext={navigationContext} outfits={[]} />,
      ),
    ).toBe("");
  });

  it("renders no more than four real looks and preserves navigation context", () => {
    const html = renderToStaticMarkup(
      <RelatedLooks
        navigationContext={navigationContext}
        outfits={Array.from({ length: 5 }, (_, index) => makeOutfit(index))}
      />,
    );

    expect(html.match(/data-outfit-id=/g)).toHaveLength(4);
    expect(html).toContain("4 more voices from the Hall.");
    expect(html).toContain("from=daily-winner");
    expect(html).toContain("returnTo=%2Fdaily-winners");
    expect(html).not.toContain("outfit-4");
  });
});
