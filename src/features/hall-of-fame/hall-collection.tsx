"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { Bow, Sparkle, ThreadStroke } from "@/features/home/home-doodles";
import { HALL_PAGE_SIZE } from "@/features/hall-of-fame/hall-constants";
import { HallLookCard } from "@/features/hall-of-fame/hall-look-card";
import { Pagination } from "@/features/hall-of-fame/pagination";
import { SortTabs } from "@/features/hall-of-fame/sort-tabs";
import type { HallOutfitCardDTO } from "@/features/outfits/outfit.types";
import {
  buildLookDetailHref,
  createHallLookDetailContext,
} from "@/features/outfits/look-detail-navigation";

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
  const detailContext = createHallLookDetailContext(activeSort, page);

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

  return (
    <section
      ref={sectionRef}
      id="hall-collection"
      className="hall-collection"
      aria-labelledby="hall-collection-title"
    >
      <div className="hall-container">
        <header className="hall-grid-system hall-collection__header">
          <h2 id="hall-collection-title" className="hall-label">
            02 · THE OPEN HALL
          </h2>
        </header>

        <SortTabs
          activeSort={activeSort}
          onNavigate={markCollectionNavigation}
        />

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={collectionKey}
            className="hall-collection__page"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: reduceMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{
              opacity: reduceMotion ? 1 : 0,
              y: reduceMotion ? 0 : -8,
              transition: reduceMotion
                ? { duration: 0 }
                : { duration: 0.14, ease: [0.65, 0, 0.35, 1] },
            }}
          >
            {items.length ? (
              <div className="hall-grid" data-page={page}>
                {items.map((outfit, index) => (
                  <HallLookCard
                    key={outfit.id}
                    detailHref={buildLookDetailHref(outfit.id, detailContext)}
                    index={(page - 1) * HALL_PAGE_SIZE + index}
                    outfit={outfit}
                    priority={page === 1 && index < 2}
                    tone="soft"
                    variant="grid"
                  />
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
