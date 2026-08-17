"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { FallbackImage } from "@/components/ui/fallback-image";
import { DailyWinnerBadge } from "@/features/daily-winners/daily-winner-badge";
import type { DailyWinnerDisplaySnapshot } from "@/features/daily-winners/daily-winner-debug";
import { formatDailyWinnerDate } from "@/features/daily-winners/daily-winner-format";
import { productionAssets } from "@/features/dress-up/catalog";
import { Sparkle, ThreadStroke } from "@/features/home/home-doodles";
import { CustomCursor, MaskedHeading } from "@/features/home/home-motion";

const editorialEase = [0.22, 1, 0.36, 1] as const;

export function DailyWinnerDetail({
  winner,
}: {
  winner: DailyWinnerDisplaySnapshot;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const displayDate = formatDailyWinnerDate(winner.dayKey).toUpperCase();
  const statsContainer: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { duration: 0 }
        : { delayChildren: 0.44, staggerChildren: 0.08 },
    },
  };
  const statItem: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.46,
        ease: editorialEase,
      },
    },
  };

  return (
    <div className="winner-page winner-detail-page">
      <CustomCursor scope="winner" />
      <section className="winner-detail" aria-labelledby="winner-detail-title">
        <div className="winner-container">
          <Link
            className="winner-detail__back"
            href="/daily-winners"
            data-cursor="OPEN"
          >
            <span aria-hidden="true">←</span> BACK TO DAILY WINNERS
          </Link>

          <header className="winner-grid-system winner-detail__masthead">
            <span className="winner-label winner-detail__eyebrow">
              DAILY WINNER · {displayDate}
            </span>
            <motion.div
              className="winner-detail__title-wrap"
              initial={
                reduceMotion ? false : { clipPath: "inset(0 0 100% 0)", y: 24 }
              }
              animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.76,
                delay: reduceMotion ? 0 : 0.14,
                ease: editorialEase,
              }}
            >
              <MaskedHeading
                id="winner-detail-title"
                className="winner-detail__title"
                level="h1"
                lines={["LOOK OF", "THE DAY"]}
                skipAnimation
              />
            </motion.div>
            <motion.p
              className="winner-detail__masthead-note"
              initial={reduceMotion ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.56,
                delay: reduceMotion ? 0 : 0.34,
                ease: editorialEase,
              }}
            >
              ONE COMPLETED DAY.
              <br />
              ONE FINAL LOOK.
            </motion.p>
            <motion.span
              className="winner-detail__masthead-spark"
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.72 }}
              animate={
                reduceMotion
                  ? { opacity: 1, scale: 1 }
                  : {
                      opacity: [0, 1, 0.86, 1],
                      scale: [0.72, 1, 1.05, 1],
                      rotate: [0, 0, 4, 0],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      opacity: { duration: 0.72, times: [0, 0.35, 0.75, 1] },
                      scale: { duration: 4.8, repeat: Infinity, delay: 0.28 },
                      rotate: { duration: 4.8, repeat: Infinity, delay: 0.28 },
                    }
              }
            >
              <Sparkle />
            </motion.span>
            <ThreadStroke
              className="winner-detail__masthead-thread"
              aria-hidden="true"
              withArrow={false}
            />
          </header>

          <div className="winner-grid-system winner-detail__feature">
            <motion.figure
              className="winner-detail__stage"
              initial={
                reduceMotion
                  ? false
                  : {
                      clipPath: "inset(9% 0 0 0 round 28px 28px 4px 28px)",
                      opacity: 0.86,
                      y: 22,
                    }
              }
              animate={{
                clipPath: "inset(0% 0 0 0 round 28px 28px 4px 28px)",
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.82,
                delay: reduceMotion ? 0 : 0.16,
                ease: editorialEase,
              }}
            >
              <motion.div
                className="winner-detail__media"
                initial={reduceMotion ? false : { scale: 1.045 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.92,
                  delay: reduceMotion ? 0 : 0.16,
                  ease: editorialEase,
                }}
              >
                <FallbackImage
                  src={winner.imageUrl}
                  fallbackSrc={productionAssets.defaultLookPath}
                  width={1200}
                  height={1600}
                  sizes="(max-width: 767px) calc(100vw - 28px), (max-width: 1199px) 60vw, 58vw"
                  preload
                  alt={`Daily winning White Chorus look ${winner.shortCode} for ${formatDailyWinnerDate(winner.dayKey)}.`}
                />
              </motion.div>
              <figcaption className="sr-only">
                Daily Winner look {winner.shortCode} for {displayDate}.
              </figcaption>
            </motion.figure>

            <motion.aside
              className="winner-detail__information"
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.62,
                delay: reduceMotion ? 0 : 0.26,
                ease: editorialEase,
              }}
            >
              <DailyWinnerBadge />

              <div className="winner-detail__identity">
                <span className="winner-label">02 · WINNER RECORD</span>
                <h2>
                  <span>LOOK</span>
                  <strong>#{winner.shortCode}</strong>
                </h2>
                <time dateTime={winner.dayKey}>{displayDate}</time>
                {winner.isDebugPlaceholder ? (
                  <small>DEBUG PREVIEW · PRESENTATION ONLY</small>
                ) : null}
              </div>

              <motion.dl
                className="winner-detail__stats"
                variants={statsContainer}
                initial={reduceMotion ? false : "hidden"}
                animate="visible"
              >
                <motion.div variants={statItem}>
                  <dt>FINAL AVERAGE</dt>
                  <dd>
                    {winner.finalAverage.toFixed(1)}{" "}
                    <span aria-hidden="true">★</span>
                  </dd>
                </motion.div>
                <motion.div variants={statItem}>
                  <dt>FINAL RATINGS</dt>
                  <dd>{winner.finalRatingCount}</dd>
                </motion.div>
                <motion.div variants={statItem}>
                  <dt>FINAL WEIGHTED SCORE</dt>
                  <dd>{winner.finalWeightedScore.toFixed(3)}</dd>
                </motion.div>
              </motion.dl>

              <div className="winner-detail__actions">
                <span className="winner-label">MAKE THE NEXT LOOK</span>
                <Link
                  className="button button--primary button--lg winner-detail__studio-link"
                  href="/studio"
                  data-cursor="DRESS"
                >
                  <span>BACK TO STUDIO</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>
    </div>
  );
}
