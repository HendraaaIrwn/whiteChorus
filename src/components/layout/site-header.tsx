"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { productionAssets } from "@/features/dress-up/catalog";
import { MusicControl } from "@/features/audio/music-control";
import { HomeMenu } from "@/features/home/home-menu";

export function SiteHeader() {
  const pathname = usePathname();
  const reduceMotion = useHydratedReducedMotion();
  const [homeCompact, setHomeCompact] = useState(false);
  const isHome = pathname === "/";
  const isStudio = pathname === "/studio";
  const isHall =
    pathname === "/hall-of-fame" || pathname.startsWith("/outfits/");
  const isWinners = pathname.startsWith("/daily-winners");

  useEffect(() => {
    if (!isHome) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const compact = window.scrollY > 8;
      setHomeCompact((current) => (current === compact ? current : compact));
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [isHome]);
  const hallActive =
    pathname.startsWith("/hall-of-fame") || pathname.startsWith("/outfits/");
  const navigation = [
    ["/studio", "STUDIO", pathname.startsWith("/studio")],
    ["/hall-of-fame", "HALL OF FAME", hallActive],
    ["/daily-winners", "WINNERS", pathname.startsWith("/daily-winners")],
  ] as const;

  if (isHome) {
    return (
      <motion.header
        className="site-header site-header--home"
        data-compact={homeCompact || undefined}
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.38 }}
      >
        <div className="site-header__home-inner">
          <Link
            className="home-wordmark"
            href="/"
            aria-label="White Chorus home"
          >
            <span>WHITE</span>
            <span>CHORUS</span>
          </Link>
          <span className="site-header__home-note">DAILY DRESS-UP / 2026</span>
          <HomeMenu />
        </div>
      </motion.header>
    );
  }

  if (isStudio) {
    return (
      <motion.header
        className="site-header site-header--studio"
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28 }}
      >
        <div className="site-header__studio-inner">
          <Link
            className="studio-wordmark"
            href="/"
            aria-label="White Chorus home"
            data-cursor="OPEN"
          >
            <span>WHITE</span>
            <span>CHORUS</span>
          </Link>
          <span className="site-header__studio-status">
            STUDIO · AUTO-SAVED
          </span>
          <div className="site-header__studio-actions">
            <MusicControl />
            <HomeMenu />
          </div>
        </div>
      </motion.header>
    );
  }

  if (isHall) {
    return (
      <motion.header
        className="site-header site-header--hall"
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.34 }}
      >
        <div className="site-header__hall-inner">
          <Link
            className="hall-wordmark"
            href="/"
            aria-label="White Chorus home"
            data-cursor="OPEN"
          >
            <span>WHITE</span>
            <span>CHORUS</span>
          </Link>
          <span className="site-header__hall-note">
            COMMUNITY ARCHIVE · 2026
          </span>
          <div className="site-header__hall-actions">
            <MusicControl />
            <HomeMenu />
          </div>
        </div>
      </motion.header>
    );
  }

  if (isWinners) {
    return (
      <motion.header
        className="site-header site-header--winners"
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.34 }}
      >
        <div className="site-header__winners-inner">
          <Link
            className="winners-wordmark"
            href="/"
            aria-label="White Chorus home"
            data-cursor="OPEN"
          >
            <span>WHITE</span>
            <span>CHORUS</span>
          </Link>
          <span className="site-header__winners-note">
            DAILY COMPETITION · LIVE
          </span>
          <div className="site-header__winners-actions">
            <MusicControl />
            <HomeMenu />
          </div>
        </div>
      </motion.header>
    );
  }

  return (
    <motion.header
      className="site-header"
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
    >
      <div className="site-header__inner">
        <Link className="wordmark" href="/" aria-label="White Chorus home">
          <Image
            src={productionAssets.logoPath}
            alt="White Chorus"
            width={120}
            height={54}
            preload
          />
        </Link>
        <nav aria-label="Primary navigation">
          {navigation.map(([href, label, active]) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
            >
              <span>{label}</span>
              {active ? (
                <motion.span
                  className="nav-indicator"
                  layoutId="primary-navigation-indicator"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          ))}
        </nav>
        <Link
          className="mobile-hall-link"
          href="/hall-of-fame"
          aria-current={hallActive ? "page" : undefined}
        >
          <Sparkles aria-hidden="true" />
          <span>HALL</span>
        </Link>
        <MusicControl />
      </div>
    </motion.header>
  );
}
