"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock3, Star } from "lucide-react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import type { OutfitCardDTO } from "@/features/outfits/outfit.types";

const standardEase = [0.2, 0.8, 0.2, 1] as const;

export function OutfitCard({
  outfit,
  index = 0,
}: {
  outfit: OutfitCardDTO;
  index?: number;
}) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.article
      className="outfit-card"
      initial={reduceMotion ? false : { opacity: 1, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reduceMotion ? 0 : 0.22,
        delay: reduceMotion ? 0 : Math.min(index, 4) * 0.04,
        ease: standardEase,
      }}
    >
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
    </motion.article>
  );
}
