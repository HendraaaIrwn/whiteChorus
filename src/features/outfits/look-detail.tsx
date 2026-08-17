"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { FallbackImage } from "@/components/ui/fallback-image";
import { productionAssets } from "@/features/dress-up/catalog";
import { Sparkle, ThreadStroke } from "@/features/home/home-doodles";
import type { OutfitDetailDTO } from "@/features/outfits/outfit.types";
import { StarRating } from "@/features/ratings/star-rating";
import { ShareActions } from "@/features/sharing/share-actions";

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(value))
    .toUpperCase();
}

export function LookDetail({
  backHref,
  backLabel,
  outfit,
  shareUrl,
}: {
  backHref: string;
  backLabel: "BACK TO HALL OF FAME" | "BACK TO DAILY WINNER";
  outfit: OutfitDetailDTO;
  shareUrl: string;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const mediaX = useSpring(pointerX, {
    stiffness: 240,
    damping: 28,
    mass: 0.4,
  });
  const mediaY = useSpring(pointerY, {
    stiffness: 240,
    damping: 28,
    mass: 0.4,
  });
  const decorationX = useTransform(mediaX, (value) => value * 1.65);
  const decorationY = useTransform(mediaY, (value) => value * 1.65);
  const title = `Look #${outfit.shortCode}`;

  return (
    <section className="look-detail__hero" aria-labelledby="look-detail-title">
      <div className="look-detail__container look-detail__grid">
        <Link className="look-detail__back" href={backHref} data-cursor="OPEN">
          <span aria-hidden="true">←</span> {backLabel}
        </Link>

        <div className="look-detail__status-line">
          <span>01 · THE LOOK</span>
          {outfit.isOwner ? <strong>YOUR LOOK</strong> : null}
          {outfit.isDailyWinner ? <strong>DAILY WINNER</strong> : null}
        </div>

        <motion.div
          className="look-detail__identity"
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: reduceMotion ? 0 : 0.2,
            duration: reduceMotion ? 0 : 0.58,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <h1 id="look-detail-title" aria-label={title}>
            <span>LOOK</span>
            <span>#{outfit.shortCode}</span>
          </h1>
        </motion.div>

        <div
          className="look-detail__stage"
          onPointerMove={(event) => {
            if (reduceMotion || event.pointerType !== "mouse") return;
            const bounds = event.currentTarget.getBoundingClientRect();
            pointerX.set(
              ((event.clientX - bounds.left) / bounds.width - 0.5) * 8,
            );
            pointerY.set(
              ((event.clientY - bounds.top) / bounds.height - 0.5) * 8,
            );
          }}
          onPointerLeave={() => {
            pointerX.set(0);
            pointerY.set(0);
          }}
        >
          <motion.div
            className="look-detail__media-position"
            style={reduceMotion ? undefined : { x: mediaX, y: mediaY }}
          >
            <motion.div
              className="look-detail__media-mask"
              initial={
                reduceMotion
                  ? false
                  : { clipPath: "inset(12% 0 0 0)", opacity: 0.85 }
              }
              animate={{ clipPath: "inset(0% 0 0 0)", opacity: 1 }}
              transition={{
                duration: reduceMotion ? 0 : 0.76,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.div
                className="look-detail__media"
                initial={reduceMotion ? false : { scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.84,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <FallbackImage
                  src={outfit.finalImageUrl}
                  fallbackSrc={productionAssets.defaultLookPath}
                  width={1200}
                  height={1600}
                  sizes="(max-width: 767px) calc(100vw - 28px), (max-width: 1199px) 58vw, 48vw"
                  preload
                  alt={`${title}, a complete White Chorus outfit composition.`}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="look-detail__thread"
            aria-hidden="true"
            style={
              reduceMotion ? undefined : { x: decorationX, y: decorationY }
            }
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.38, duration: 0.5 }}
          >
            <ThreadStroke />
          </motion.div>
          <motion.div
            className="look-detail__sparkle"
            aria-hidden="true"
            style={
              reduceMotion ? undefined : { x: decorationX, y: decorationY }
            }
            initial={reduceMotion ? false : { opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: reduceMotion ? 0 : 0.48,
              duration: reduceMotion ? 0 : 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Sparkle />
          </motion.div>
        </div>

        <motion.aside
          className="look-detail__information"
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: reduceMotion ? 0 : 0.28,
            duration: reduceMotion ? 0 : 0.58,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <dl className="look-detail__metadata">
            <div>
              <dt>PUBLISHED</dt>
              <dd>
                <time dateTime={outfit.publishedAt}>
                  {formatPublishedDate(outfit.publishedAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt>LIVE</dt>
              <dd>
                {outfit.remainingDays
                  ? `${outfit.remainingDays}D`
                  : "ENDS SOON"}
              </dd>
            </div>
          </dl>

          <div className="look-detail__rating">
            <span className="look-detail__section-label">
              {outfit.isOwner ? "THE RATING" : "RATE THIS LOOK"}
            </span>
            <StarRating
              outfitId={outfit.id}
              initialValue={outfit.viewerRating}
              average={outfit.ratingAverage}
              count={outfit.ratingCount}
              disabled={!outfit.canRate}
              variant="detail"
            />
          </div>

          <div className="look-detail__actions">
            <span className="look-detail__section-label">
              {outfit.isOwner ? "TAKE IT WITH YOU" : "PASS IT ON"}
            </span>
            <ShareActions
              outfitId={outfit.id}
              shortCode={outfit.shortCode}
              downloadUrl={outfit.downloadUrl}
              shareImageUrl={outfit.shareImageUrl}
              shareUrl={shareUrl}
              primaryAction={outfit.isOwner ? "download" : "share"}
            />
            {outfit.isOwner ? (
              <Link
                className="look-detail__studio-link"
                href="/studio"
                data-cursor="DRESS"
              >
                KEEP DRESSING <span aria-hidden="true">↗</span>
              </Link>
            ) : null}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
