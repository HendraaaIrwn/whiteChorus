import Image from "next/image";
import Link from "next/link";

import { FallbackImage } from "@/components/ui/fallback-image";
import {
  getAsset,
  productionAssets,
  renderLayersFor,
} from "@/features/dress-up/catalog";
import type { DressUpConfiguration } from "@/features/dress-up/model";
import { StitchedArrow } from "@/features/home/home-doodles";
import type { HomeLook } from "@/features/home/home-look-data";
import { ImageReveal } from "@/features/home/home-motion";
import { cn } from "@/lib/cn";

export function CuratedLookArtwork({
  configuration,
  sizes,
  priority = false,
}: {
  configuration: DressUpConfiguration;
  sizes: string;
  priority?: boolean;
}) {
  const background = getAsset(configuration.backgroundId);

  return (
    <div className="home-look-art" aria-hidden="true">
      {background?.renderPaths[0] ? (
        <Image
          className="home-look-art__layer"
          src={background.renderPaths[0]}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
        />
      ) : null}
      {renderLayersFor(configuration).map((layer) => (
        <Image
          className="home-look-art__layer"
          key={layer.path}
          src={layer.path}
          alt=""
          fill
          sizes={sizes}
          style={{ top: layer.top ? `${(layer.top / 1600) * 100}%` : 0 }}
        />
      ))}
    </div>
  );
}

export function HomeLookCard({
  look,
  variant,
}: {
  look: HomeLook;
  variant: "large" | "small" | "wide" | "portrait" | "offset";
}) {
  const live = look.kind === "live";
  const href = live ? `/outfits/${look.outfit.id}` : "/studio";
  const title = live ? `ANONYMOUS LOOK #${look.outfit.shortCode}` : look.label;

  return (
    <article className={cn("home-look-card", `home-look-card--${variant}`)}>
      <Link
        className="home-look-card__link"
        href={href}
        data-cursor={live ? "VIEW" : "DRESS"}
        aria-label={live ? `View ${title}` : `Dress up from ${title}`}
      >
        <ImageReveal className="home-look-card__media">
          {live ? (
            <FallbackImage
              src={look.outfit.thumbnailUrl}
              fallbackSrc={productionAssets.defaultLookPath}
              alt={`${title}, a White Chorus community outfit.`}
              fill
              sizes="(max-width: 767px) 94vw, (max-width: 1199px) 48vw, 42vw"
            />
          ) : (
            <CuratedLookArtwork
              configuration={look.configuration}
              sizes="(max-width: 767px) 94vw, (max-width: 1199px) 48vw, 42vw"
            />
          )}
          <span className="home-look-card__index" aria-hidden="true">
            {live ? "LIVE" : "CURATED"}
          </span>
        </ImageReveal>

        <div className="home-look-card__meta">
          <div>
            <span className="home-label">
              {live ? "FROM THE CHORUS" : "STUDIO COMPOSITION"}
            </span>
            <h3>{title}</h3>
          </div>
          {live ? (
            <p>
              {look.outfit.ratingAverage.toFixed(1)} SCORE ·{" "}
              {look.outfit.ratingCount} RATINGS · {look.outfit.remainingDays}D
            </p>
          ) : (
            <p>OPEN THIS RHYTHM IN THE STUDIO</p>
          )}
          <StitchedArrow aria-hidden="true" />
        </div>
      </Link>
    </article>
  );
}
