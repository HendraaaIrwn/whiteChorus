"use client";

import { motion } from "framer-motion";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { Sparkle } from "@/features/home/home-doodles";

export function DailyWinnerBadge() {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.span
      className="daily-winner-badge"
      initial={
        reduceMotion ? false : { opacity: 0, scale: 0.82, rotate: -9, y: 12 }
      }
      animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 360, damping: 22, delay: 0.38 }
      }
    >
      <Sparkle aria-hidden="true" />
      <span>DAILY WINNER</span>
    </motion.span>
  );
}
