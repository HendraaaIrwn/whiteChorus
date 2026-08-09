import { HallLookCard } from "@/features/hall-of-fame/hall-look-card";
import { getRelatedLookLayout } from "@/features/hall-of-fame/layout-pattern";
import type { OutfitCardDTO } from "@/features/outfits/outfit.types";

export function RelatedLooks({ outfits }: { outfits: OutfitCardDTO[] }) {
  if (!outfits.length) return null;
  const visibleOutfits = outfits.slice(0, 3);
  const relatedCopy =
    visibleOutfits.length === 1
      ? "One more voice from the Hall."
      : `${visibleOutfits.length} more voices from the Hall.`;

  return (
    <section
      className="look-detail__related"
      aria-labelledby="related-looks-title"
    >
      <div className="look-detail__container">
        <header className="look-detail__related-heading">
          <span>02 · KEEP EXPLORING</span>
          <h2 id="related-looks-title">
            <span>RELATED</span>
            <span>LOOKS</span>
          </h2>
          <p>{relatedCopy}</p>
        </header>
        <div className="look-detail__related-grid">
          {visibleOutfits.map((outfit, index) => {
            const layout = getRelatedLookLayout(index);
            return (
              <HallLookCard
                key={outfit.id}
                index={index}
                outfit={outfit}
                ratingMode="summary"
                tone={layout.tone}
                variant={layout.variant}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
