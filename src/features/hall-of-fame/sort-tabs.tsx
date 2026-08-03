"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";

const tabs = [
  ["newest", "NEWEST"],
  ["top-rated", "TOP RATED"],
  ["trending", "TRENDING"],
] as const;

export function SortTabs({ activeSort }: { activeSort: string }) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.nav
      className="sort-tabs"
      aria-label="Sort Hall of Fame"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, delay: 0.06 }}
    >
      {tabs.map(([value, label]) => {
        const active = activeSort === value;
        return (
          <Link
            key={value}
            aria-current={active ? "page" : undefined}
            href={`/hall-of-fame?sort=${value}&page=1`}
          >
            <span>{label}</span>
            {active ? (
              <motion.span
                className="sort-tab__indicator"
                layoutId="hall-sort-indicator"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden="true"
              />
            ) : null}
          </Link>
        );
      })}
      <Link href="/weekly-winners">
        <span>WEEKLY WINNERS</span>
      </Link>
    </motion.nav>
  );
}
