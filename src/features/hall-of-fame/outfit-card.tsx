/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Clock3, Star } from "lucide-react";

import type { OutfitCardDTO } from "@/features/outfits/outfit.types";

export function OutfitCard({ outfit }: { outfit: OutfitCardDTO }) {
  return (
    <article className="outfit-card">
      <Link
        href={`/outfits/${outfit.id}`}
        aria-label={`Open Anonymous Look ${outfit.shortCode}`}
      >
        {outfit.thumbnailUrl ? (
          <img
            src={outfit.thumbnailUrl}
            width="450"
            height="600"
            alt={`Anonymous White Chorus outfit ${outfit.shortCode}.`}
          />
        ) : (
          <div className="outfit-card__placeholder" aria-hidden="true">
            ♪ ✦
          </div>
        )}
        <div className="outfit-card__body">
          <h2>ANONYMOUS LOOK #{outfit.shortCode}</h2>
          <div className="outfit-card__meta">
            <span>
              <Star aria-hidden="true" size={17} fill="currentColor" />{" "}
              {outfit.ratingAverage.toFixed(1)} · {outfit.ratingCount}
            </span>
            <span>
              <Clock3 aria-hidden="true" size={16} />{" "}
              {outfit.remainingDays
                ? `${outfit.remainingDays}d left`
                : "Ends soon"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
