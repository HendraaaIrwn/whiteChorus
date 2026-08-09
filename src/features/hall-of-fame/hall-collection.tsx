"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { Bow, Sparkle, ThreadStroke } from "@/features/home/home-doodles";
import { MaskedHeading } from "@/features/home/home-motion";
import { HallLookCard } from "@/features/hall-of-fame/hall-look-card";
import {
  getHallCardLayout,
  getHallClusterStart,
  HALL_CLUSTER_SIZES,
} from "@/features/hall-of-fame/layout-pattern";
import { Pagination } from "@/features/hall-of-fame/pagination";
import { SortTabs } from "@/features/hall-of-fame/sort-tabs";
import type { HallOutfitCardDTO } from "@/features/outfits/outfit.types";

const HALL_SCROLL_KEY = "white-chorus:hall-scroll-to-collection";

export function HallCollection({
  activeSort,
  items,
  page,
  totalPages,
}: {
  activeSort: "newest" | "top-rated" | "trending";
  items: HallOutfitCardDTO[];
  page: number;
  totalPages: number;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const collectionKey = `${activeSort}:${page}`;
  const clusters = useMemo(
    () =>
      HALL_CLUSTER_SIZES.map((size, clusterIndex) => {
        const offset = getHallClusterStart(clusterIndex);
        const cluster = items
          .slice(offset, offset + size)
          .map((outfit, index) => ({ index: offset + index, outfit }));
        return { cluster, clusterIndex };
      }).filter(({ cluster }) => cluster.length > 0),
    [items],
  );

  useEffect(() => {
    if (window.sessionStorage.getItem(HALL_SCROLL_KEY) !== "1") return;
    window.sessionStorage.removeItem(HALL_SCROLL_KEY);
    const frame = window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [collectionKey, reduceMotion]);

  const markCollectionNavigation = () => {
    window.sessionStorage.setItem(HALL_SCROLL_KEY, "1");
  };
  const clusterVariants: Variants = {
    hidden: {
      opacity: 0,
      clipPath: "inset(10% 0 0 0 round 28px)",
      y: 22,
      scale: 1.01,
    },
    visible: {
      opacity: 1,
      clipPath: "inset(0% 0 0 0 round 0px)",
      y: 0,
      scale: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.72,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="hall-collection"
      className="hall-collection"
      aria-labelledby="hall-collection-title"
    >
      <div className="hall-container">
        <div className="hall-grid-system hall-collection__intro">
          <span className="hall-label">03 · THE OPEN HALL</span>
          <MaskedHeading
            id="hall-collection-title"
            className="hall-collection__title"
            lines={["ONE LOOK.", "ONE MOMENT.", "ONE SHARED WALL."]}
          />
          <p>
            Browse the newest entries, the strongest scores, or the looks moving
            through the chorus right now.
          </p>
        </div>

        <SortTabs
          activeSort={activeSort}
          onNavigate={markCollectionNavigation}
        />

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={collectionKey}
            className="hall-collection__page"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.32 }}
          >
            {items.length ? (
              <div className="hall-grid" data-page={page}>
                {clusters.map(({ cluster, clusterIndex }) => (
                  <motion.section
                    key={`${collectionKey}:${clusterIndex}`}
                    className={`hall-cluster hall-cluster--${clusterIndex + 1}`}
                    aria-label={`Look collection ${clusterIndex + 1}`}
                    variants={clusterVariants}
                    initial={reduceMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.12 }}
                  >
                    {cluster.map(({ index, outfit }) => {
                      const layout = getHallCardLayout(index);
                      return (
                        <HallLookCard
                          key={outfit.id}
                          index={index}
                          outfit={outfit}
                          priority={page === 1 && index < 2}
                          tone={layout.tone}
                          variant={layout.variant}
                        />
                      );
                    })}
                  </motion.section>
                ))}
              </div>
            ) : (
              <section
                className="hall-empty"
                aria-labelledby="hall-empty-title"
              >
                <span className="hall-label">THE STAGE IS QUIET</span>
                <h2 id="hall-empty-title">NO LOOKS YET.</h2>
                <p>Be the first to make some noise.</p>
                <Link
                  className="hall-editorial-link"
                  href="/studio"
                  data-cursor="DRESS"
                >
                  START DRESSING <span>↗</span>
                </Link>
                <ThreadStroke aria-hidden="true" />
                <Bow aria-hidden="true" />
                <Sparkle aria-hidden="true" />
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        <Pagination
          page={page}
          totalPages={totalPages}
          sort={activeSort}
          onNavigate={markCollectionNavigation}
        />
      </div>
    </section>
  );
}
