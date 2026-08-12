"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";

import { editorialEase } from "@/components/motion/motion-presets";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { MusicControl } from "@/features/audio/music-control";
import { ChorusWave, Sparkle } from "@/features/home/home-doodles";

const footerEase = [0.22, 1, 0.36, 1] as const;

function StudioFooterDoodles() {
  return (
    <div className="studio-editorial-footer__doodles" aria-hidden="true">
      <svg
        className="studio-editorial-footer__doodle studio-editorial-footer__doodle--wave"
        viewBox="0 0 620 160"
        fill="none"
      >
        <path d="M8 104C75 28 137 145 205 78C272 12 331 137 398 72C462 10 515 124 612 48" />
      </svg>
      <svg
        className="studio-editorial-footer__doodle studio-editorial-footer__doodle--loop"
        viewBox="0 0 360 180"
        fill="none"
      >
        <path d="M8 106C58 35 115 39 142 92C168 143 119 164 91 128C62 91 103 47 171 55C237 62 245 151 198 158C150 165 146 83 221 55C274 35 315 52 352 91" />
      </svg>
      <svg
        className="studio-editorial-footer__doodle studio-editorial-footer__doodle--stitch"
        viewBox="0 0 420 140"
        fill="none"
      >
        <path d="M6 92C67 17 135 121 201 62C265 5 324 117 414 46" />
      </svg>
    </div>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  const reduceMotion = useHydratedReducedMotion();
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });
  const titleDrift = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [26, -26],
  );

  const titleGroup: Variants = {
    hidden: { scale: 0.98 },
    visible: {
      scale: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : {
            delayChildren: 0.14,
            staggerChildren: 0.14,
            duration: 0.95,
            ease: editorialEase,
          },
    },
  };
  const titleLine: Variants = {
    hidden: { y: "115%" },
    visible: {
      y: "0%",
      transition: reduceMotion
        ? { duration: 0 }
        : { duration: 0.8, ease: editorialEase },
    },
  };

  const sparkVariants = (delay: number, rotate: number): Variants => ({
    hidden: { opacity: 0, scale: 0.42, rotate: rotate - 16 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate,
      transition: reduceMotion
        ? { duration: 0 }
        : { delay, duration: 0.62, ease: editorialEase },
    },
  });

  if (pathname === "/") {
    return (
      <footer ref={footerRef} className="site-footer site-footer--home">
        <div className="home-editorial-footer home-container">
          <motion.span
            className="home-label"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: reduceMotion ? 0 : 0.6,
              ease: footerEase,
            }}
          >
            07 · THE LAST NOTE
          </motion.span>
          <motion.div
            className="home-editorial-footer__title"
            aria-label="White Chorus"
            style={reduceMotion ? undefined : { y: titleDrift }}
          >
            <motion.div
              className="home-editorial-footer__title-lines"
              variants={titleGroup}
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.35 }}
              aria-hidden="true"
            >
              <span className="home-editorial-footer__mask-line">
                <motion.span variants={titleLine}>WHITE</motion.span>
              </span>
              <span className="home-editorial-footer__mask-line">
                <motion.span variants={titleLine}>CHORUS</motion.span>
              </span>
            </motion.div>
          </motion.div>
          <motion.nav
            aria-label="Footer navigation"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: reduceMotion ? 0 : 0.62,
              delay: reduceMotion ? 0 : 0.92,
              ease: footerEase,
            }}
          >
            <Link href="/">HOME</Link>
            <Link href="/studio">DRESS UP</Link>
            <Link href="/hall-of-fame">HALL OF FAME</Link>
            <Link href="/daily-winners">DAILY WINNERS</Link>
          </motion.nav>
          <motion.div
            className="home-editorial-footer__meta"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: reduceMotion ? 0 : 0.62,
              delay: reduceMotion ? 0 : 1.02,
              ease: footerEase,
            }}
          >
            <span>WHITE CHORUS © 2026</span>
            <MusicControl />
          </motion.div>
          <ChorusWave aria-hidden="true" />
          <motion.div
            className="home-editorial-footer__spark home-editorial-footer__spark--one"
            variants={sparkVariants(0.55, 10)}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.3 }}
            aria-hidden="true"
          >
            <SparkleIdle reduceMotion={reduceMotion} delay={1.5} />
          </motion.div>
          <motion.div
            className="home-editorial-footer__spark home-editorial-footer__spark--two"
            variants={sparkVariants(0.72, -8)}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.3 }}
            aria-hidden="true"
          >
            <SparkleIdle reduceMotion={reduceMotion} delay={2.1} />
          </motion.div>
          <motion.div
            className="home-editorial-footer__spark home-editorial-footer__spark--three"
            variants={sparkVariants(0.9, 14)}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.3 }}
            aria-hidden="true"
          >
            <SparkleIdle reduceMotion={reduceMotion} delay={2.8} />
          </motion.div>
        </div>
      </footer>
    );
  }

  if (pathname === "/studio") {
    return (
      <footer ref={footerRef} className="site-footer site-footer--studio">
        <div className="studio-editorial-footer">
          <span className="studio-kicker">THE LOOK CONTINUES</span>
          <Link
            className="studio-editorial-footer__link"
            href="/hall-of-fame"
            data-cursor="OPEN"
          >
            <span>ENTER THE</span>
            <span>HALL OF FAME ↗</span>
          </Link>
          <div className="studio-editorial-footer__meta">
            <Link href="/daily-winners">DAILY WINNERS</Link>
          </div>
          <StudioFooterDoodles />
        </div>
      </footer>
    );
  }

  if (pathname === "/hall-of-fame" || pathname.startsWith("/outfits/")) {
    return (
      <footer ref={footerRef} className="site-footer site-footer--hall">
        <div className="hall-editorial-footer hall-container">
          <span className="hall-label">05 · THE LAST LOOK</span>
          <div
            className="hall-editorial-footer__title"
            aria-label="White Chorus"
          >
            <span>WHITE</span>
            <span>CHORUS</span>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/" data-cursor="OPEN">
              HOME
            </Link>
            <Link href="/studio" data-cursor="DRESS">
              DRESS UP
            </Link>
            <Link href="/daily-winners" data-cursor="OPEN">
              DAILY WINNERS
            </Link>
          </nav>
          <div className="hall-editorial-footer__meta">
            <span>ANONYMOUS BY DESIGN.</span>
            <MusicControl />
            <span>WHITE CHORUS © 2026</span>
          </div>
          <ChorusWave aria-hidden="true" />
          <Sparkle aria-hidden="true" />
        </div>
      </footer>
    );
  }

  if (pathname.startsWith("/daily-winners")) {
    return (
      <footer ref={footerRef} className="site-footer site-footer--winners">
        <div className="winner-editorial-footer winner-container">
          <span className="winner-label">THE RACE CONTINUES</span>
          <div
            className="winner-editorial-footer__title"
            aria-label="White Chorus"
          >
            <span>WHITE</span>
            <span>CHORUS</span>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/" data-cursor="OPEN">
              HOME
            </Link>
            <Link href="/studio" data-cursor="DRESS">
              DRESS UP
            </Link>
            <Link href="/hall-of-fame" data-cursor="OPEN">
              HALL OF FAME
            </Link>
          </nav>
          <div className="winner-editorial-footer__meta">
            <span>ANONYMOUS BY DESIGN.</span>
            <MusicControl />
            <span>WHITE CHORUS © 2026</span>
          </div>
          <ChorusWave aria-hidden="true" />
          <Sparkle aria-hidden="true" />
        </div>
      </footer>
    );
  }

  return (
    <footer ref={footerRef} className="site-footer">
      <div className="site-footer__inner">
        <div>
          <strong>WHITE CHORUS</strong>
          <span>Dress together. Shine together.</span>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/studio">STUDIO</Link>
          <Link href="/hall-of-fame">HALL OF FAME</Link>
          <Link href="/daily-winners">DAILY WINNERS</Link>
        </nav>
        <span>Anonymous by design.</span>
      </div>
    </footer>
  );
}

function SparkleIdle({
  reduceMotion,
  delay,
}: {
  reduceMotion: boolean;
  delay: number;
}) {
  return (
    <motion.span
      className="home-editorial-footer__spark-idle"
      animate={
        reduceMotion
          ? undefined
          : {
              scale: [1, 1.09, 1],
              rotate: [0, 6, 0],
              opacity: [0.82, 1, 0.82],
            }
      }
      transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <Sparkle aria-hidden="true" />
    </motion.span>
  );
}
