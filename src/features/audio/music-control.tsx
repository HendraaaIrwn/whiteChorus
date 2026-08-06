"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Music2, Volume2, VolumeX } from "lucide-react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { useMusic } from "@/components/providers/music-provider";

export function MusicControl() {
  const { muted, playbackError, toggle } = useMusic();
  const reduceMotion = useHydratedReducedMotion();
  const label = playbackError
    ? "Music unavailable"
    : muted
      ? "Play background music"
      : "Mute background music";
  const state = playbackError ? "error" : muted ? "muted" : "playing";

  return (
    <motion.button
      className="music-control"
      type="button"
      onClick={() => void toggle()}
      aria-label={label}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          className="music-control__icon"
          key={state}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
        >
          {playbackError ? (
            <Music2 aria-hidden="true" />
          ) : muted ? (
            <VolumeX aria-hidden="true" />
          ) : (
            <Volume2 aria-hidden="true" />
          )}
        </motion.span>
      </AnimatePresence>
      <span className="music-control__label">
        {playbackError ? "UNAVAILABLE" : muted ? "MUSIC OFF" : "MUSIC ON"}
      </span>
    </motion.button>
  );
}
