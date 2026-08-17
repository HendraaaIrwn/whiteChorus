import { HallLookCard } from "@/features/hall-of-fame/hall-look-card";
import {
  buildLookDetailHref,
  type LookDetailNavigationContext,
} from "@/features/outfits/look-detail-navigation";
import type { OutfitCardDTO } from "@/features/outfits/outfit.types";

export function RelatedLooks({
  navigationContext,
  outfits,
}: {
  navigationContext: LookDetailNavigationContext;
  outfits: OutfitCardDTO[];
}) {
  if (!outfits.length) return null;
  const visibleOutfits = outfits.slice(0, 4);
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
          {visibleOutfits.map((outfit, index) => (
            <HallLookCard
              key={outfit.id}
              detailHref={buildLookDetailHref(outfit.id, navigationContext)}
              imageSizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) calc(50vw - 36px), (max-width: 1600px) calc(25vw - 36px), 368px"
              index={index}
              outfit={outfit}
              ratingMode="summary"
              tone="soft"
              variant="grid"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
