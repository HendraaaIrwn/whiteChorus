import Link from "next/link";

import { FallbackImage } from "@/components/ui/fallback-image";
import { productionAssets } from "@/features/dress-up/catalog";
import type {
  HallLookTone,
  HallLookVariant,
} from "@/features/hall-of-fame/layout-pattern";
import { StitchedArrow } from "@/features/home/home-doodles";
import type {
  HallOutfitCardDTO,
  OutfitCardDTO,
} from "@/features/outfits/outfit.types";
import { StarRating } from "@/features/ratings/star-rating";

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

type HallLookCardBaseProps = {
  index: number;
  priority?: boolean;
  tone: HallLookTone;
  variant: HallLookVariant;
};

type HallLookCardProps = HallLookCardBaseProps &
  (
    | {
        outfit: HallOutfitCardDTO;
        ratingMode?: "interactive";
      }
    | {
        outfit: OutfitCardDTO;
        ratingMode: "summary";
      }
  );

export function HallLookCard(props: HallLookCardProps) {
  const { index, outfit, priority, tone, variant } = props;
  const title = `ANONYMOUS LOOK #${outfit.shortCode}`;
  const sizes =
    variant === "wide"
      ? "(max-width: 767px) 92vw, (max-width: 1199px) 62vw, 58vw"
      : variant === "compact"
        ? "(max-width: 767px) 84vw, (max-width: 1199px) 34vw, 30vw"
        : "(max-width: 767px) 92vw, (max-width: 1199px) 54vw, 48vw";

  return (
    <article
      className={`hall-look hall-look--${variant} hall-look--${tone}`}
      data-layout-variant={variant}
    >
      <Link
        className="hall-look__media-link"
        href={`/outfits/${outfit.id}`}
        data-cursor="VIEW"
        aria-label={`View ${title}`}
      >
        <div className="hall-look__media">
          <FallbackImage
            src={outfit.thumbnailUrl}
            fallbackSrc={productionAssets.defaultLookPath}
            fill
            priority={priority}
            sizes={sizes}
            alt={`${title}, a White Chorus community outfit.`}
          />
          <span className="hall-look__number" aria-hidden="true">
            LOOK {String(index + 1).padStart(2, "0")}
          </span>
          {outfit.isDailyWinner ? (
            <span className="hall-look__winner">DAILY WINNER</span>
          ) : null}
        </div>
      </Link>

      <div className="hall-look__meta">
        <div className="hall-look__heading">
          <div>
            <span>FROM THE CHORUS</span>
            <Link href={`/outfits/${outfit.id}`} data-cursor="VIEW">
              <h3>{title}</h3>
            </Link>
          </div>
          <dl>
            <div>
              <dt>LIVE</dt>
              <dd>
                {outfit.remainingDays ? `${outfit.remainingDays}D` : "NOW"}
              </dd>
            </div>
            <div>
              <dt>ADDED</dt>
              <dd>{formatPublishedAt(outfit.publishedAt).toUpperCase()}</dd>
            </div>
          </dl>
        </div>

        <div className="hall-look__rating-row">
          {props.ratingMode === "summary" ? (
            <div className="hall-look__rating-summary" aria-label="Look rating">
              <strong>{outfit.ratingAverage.toFixed(1)} ★</strong>
              <span>
                {outfit.ratingCount}{" "}
                {outfit.ratingCount === 1 ? "rating" : "ratings"}
              </span>
            </div>
          ) : (
            <StarRating
              outfitId={outfit.id}
              initialValue={props.outfit.viewerRating}
              average={outfit.ratingAverage}
              count={outfit.ratingCount}
              disabled={!props.outfit.canRate}
              variant="compact"
            />
          )}
          <Link
            className="hall-look__open"
            href={`/outfits/${outfit.id}`}
            data-cursor="OPEN"
            aria-label={`Open details for ${title}`}
          >
            <span>OPEN</span>
            <StitchedArrow aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
