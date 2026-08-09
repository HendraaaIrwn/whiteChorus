"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { MusicControl } from "@/features/audio/music-control";
import { Bow, ChorusWave, Sparkle } from "@/features/home/home-doodles";

const menuItems = [
  ["/", "HOME"],
  ["/studio", "DRESS UP"],
  ["/hall-of-fame", "HALL OF FAME"],
  ["/daily-winners", "DAILY WINNERS"],
] as const;

export function HomeMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeArtwork, setActiveArtwork] = useState(0);
  const reduceMotion = useHydratedReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => {
        dialog.querySelector<HTMLElement>("[data-home-menu-link]")?.focus();
      });
    }
    if (!open && dialog.open) {
      dialog.close();
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  function requestClose() {
    if (closing) return;
    if (reduceMotion) {
      setOpen(false);
      return;
    }
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 430);
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="home-menu-trigger"
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="home-navigation-scene"
        data-cursor="OPEN"
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
      </button>

      <dialog
        ref={dialogRef}
        className="home-menu-dialog"
        id="home-navigation-scene"
        aria-label="White Chorus navigation"
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        {open ? (
          <motion.div
            className="home-menu-scene"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: closing ? "100%" : "0%" }}
            transition={{
              duration: reduceMotion ? 0 : closing ? 0.43 : 0.72,
              ease: [0.65, 0, 0.35, 1],
            }}
          >
            <div className="home-menu-scene__top">
              <span className="home-menu-scene__wordmark">WHITE CHORUS</span>
              <button
                type="button"
                className="home-menu-close"
                aria-label="Close menu"
                data-cursor="OPEN"
                onClick={requestClose}
              >
                <span />
                <span />
              </button>
            </div>

            <nav aria-label="Primary navigation">
              <ol>
                {menuItems.map(([href, label], index) => (
                  <motion.li
                    key={href}
                    initial={reduceMotion ? false : { opacity: 0, y: 34 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: reduceMotion ? 0 : 0.26 + index * 0.07,
                      duration: reduceMotion ? 0 : 0.56,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Link
                      href={href}
                      data-home-menu-link
                      data-cursor="OPEN"
                      onMouseEnter={() => setActiveArtwork(index)}
                      onFocus={() => setActiveArtwork(index)}
                      onClick={requestClose}
                    >
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </ol>
            </nav>

            <div
              className="home-menu-art"
              data-active={activeArtwork}
              aria-hidden="true"
            >
              <motion.div
                key={activeArtwork}
                initial={
                  reduceMotion ? false : { opacity: 0, scale: 0.84, rotate: -6 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.42 }}
              >
                {activeArtwork % 2 ? <Bow /> : <Sparkle />}
              </motion.div>
              <ChorusWave />
            </div>

            <div className="home-menu-scene__meta">
              <span>ANONYMOUS BY DESIGN</span>
              <MusicControl />
            </div>
          </motion.div>
        ) : null}
      </dialog>
    </>
  );
}
