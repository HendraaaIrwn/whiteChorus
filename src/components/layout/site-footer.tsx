"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useId, useRef, type RefObject } from "react";

import { editorialEase } from "@/components/motion/motion-presets";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { MusicControl } from "@/features/audio/music-control";
import { chorusWavePath, Sparkle } from "@/features/home/home-doodles";

const footerEase = [0.22, 1, 0.36, 1] as const;

type EditorialFooterNavItem = {
  cursor?: "DRESS" | "OPEN";
  href: string;
  label: string;
};

type EditorialFooterProps = {
  navItems: ReadonlyArray<EditorialFooterNavItem>;
  sectionLabel: string;
  variant: "home" | "hall";
};

function useEditorialFooterMotion(
  footerRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const reduceMotion = useHydratedReducedMotion() || !enabled;
  const footerInView = useInView(footerRef, { once: true, amount: 0.3 });
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

  return {
    footerInView,
    reduceMotion,
    sparkVariants,
    titleDrift,
    titleGroup,
    titleLine,
  };
}

type EditorialFooterMotion = ReturnType<typeof useEditorialFooterMotion>;

function EditorialFooterTitle({
  className,
  motionState,
}: {
  className: string;
  motionState: EditorialFooterMotion;
}) {
  const { reduceMotion, titleDrift, titleGroup, titleLine } = motionState;

  return (
    <motion.div
      className={className}
      aria-label="White Chorus"
      style={reduceMotion ? undefined : { y: titleDrift }}
    >
      <motion.div
        className="home-editorial-footer__title-lines"
        data-footer-title-reveal
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
  );
}

function EditorialFooterWave({
  motionState,
}: {
  motionState: EditorialFooterMotion;
}) {
  const clipId = `footer-wave-${useId().replaceAll(":", "")}`;
  const { footerInView, reduceMotion } = motionState;

  return (
    <svg viewBox="0 0 1000 240" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <motion.rect
            data-footer-wave-reveal
            x="0"
            y="-24"
            height="288"
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: reduceMotion || footerInView ? 1000 : 0 }}
            transition={{
              duration: reduceMotion ? 0 : 2.25,
              delay: reduceMotion ? 0 : 0.18,
              ease: [0.65, 0, 0.35, 1],
            }}
          />
        </clipPath>
      </defs>
      <path
        d={chorusWavePath}
        clipPath={`url(#${clipId})`}
        stroke="currentColor"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function EditorialFooterBottom({
  motionState,
  navItems,
}: {
  motionState: EditorialFooterMotion;
  navItems: ReadonlyArray<EditorialFooterNavItem>;
}) {
  const { reduceMotion } = motionState;

  return (
    <>
      <motion.nav
        className="editorial-footer__nav"
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
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} data-cursor={item.cursor}>
            {item.label}
          </Link>
        ))}
      </motion.nav>
      <motion.div
        className="editorial-footer__meta"
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
    </>
  );
}

function EditorialFooterSpark({
  className,
  delay,
  idleDelay,
  motionState,
  rotate,
}: {
  className: string;
  delay: number;
  idleDelay: number;
  motionState: EditorialFooterMotion;
  rotate: number;
}) {
  const { reduceMotion, sparkVariants } = motionState;

  return (
    <motion.div
      className={className}
      data-footer-spark-reveal
      variants={sparkVariants(delay, rotate)}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.3 }}
      aria-hidden="true"
    >
      <SparkleIdle reduceMotion={reduceMotion} delay={idleDelay} />
    </motion.div>
  );
}

function EditorialFooter({
  navItems,
  sectionLabel,
  variant,
}: EditorialFooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const motionState = useEditorialFooterMotion(footerRef);
  const { reduceMotion } = motionState;

  return (
    <footer
      ref={footerRef}
      className={`site-footer site-footer--${variant} site-footer--editorial`}
    >
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
          {sectionLabel}
        </motion.span>
        <EditorialFooterTitle
          className="home-editorial-footer__title"
          motionState={motionState}
        />
        <EditorialFooterBottom motionState={motionState} navItems={navItems} />
        <EditorialFooterWave motionState={motionState} />
        <EditorialFooterSpark
          className="home-editorial-footer__spark home-editorial-footer__spark--one"
          delay={0.55}
          idleDelay={1.5}
          motionState={motionState}
          rotate={10}
        />
        <EditorialFooterSpark
          className="home-editorial-footer__spark home-editorial-footer__spark--two"
          delay={0.72}
          idleDelay={2.1}
          motionState={motionState}
          rotate={-8}
        />
        <EditorialFooterSpark
          className="home-editorial-footer__spark home-editorial-footer__spark--three"
          delay={0.9}
          idleDelay={2.8}
          motionState={motionState}
          rotate={14}
        />
      </div>
    </footer>
  );
}

function DailyWinnersFooter({ motionEnabled }: { motionEnabled: boolean }) {
  const footerRef = useRef<HTMLElement>(null);
  const motionState = useEditorialFooterMotion(footerRef, motionEnabled);
  const { reduceMotion } = motionState;

  return (
    <footer
      ref={footerRef}
      className="site-footer site-footer--winners site-footer--editorial"
      data-footer-motion={motionEnabled ? "enabled" : "static"}
    >
      <div className="winner-editorial-footer winner-container">
        <motion.span
          className="winner-label"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            ease: footerEase,
          }}
        >
          THE RACE CONTINUES
        </motion.span>
        <EditorialFooterTitle
          className="winner-editorial-footer__title"
          motionState={motionState}
        />
        <EditorialFooterBottom
          motionState={motionState}
          navItems={[
            { href: "/", label: "HOME", cursor: "OPEN" },
            { href: "/studio", label: "DRESS UP", cursor: "DRESS" },
            {
              href: "/hall-of-fame",
              label: "HALL OF FAME",
              cursor: "OPEN",
            },
          ]}
        />
        <EditorialFooterWave motionState={motionState} />
        <EditorialFooterSpark
          className="winner-editorial-footer__spark"
          delay={0.55}
          idleDelay={1.5}
          motionState={motionState}
          rotate={10}
        />
      </div>
    </footer>
  );
}

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

  if (pathname === "/") {
    return (
      <EditorialFooter
        sectionLabel="07 · THE LAST NOTE"
        variant="home"
        navItems={[
          { href: "/", label: "HOME" },
          { href: "/studio", label: "DRESS UP" },
          { href: "/hall-of-fame", label: "HALL OF FAME" },
          { href: "/daily-winners", label: "DAILY WINNERS" },
        ]}
      />
    );
  }

  if (pathname === "/hall-of-fame") {
    return (
      <EditorialFooter
        sectionLabel="04 · THE LAST LOOK"
        variant="hall"
        navItems={[
          { href: "/", label: "HOME" },
          { href: "/studio", label: "DRESS UP" },
          { href: "/daily-winners", label: "DAILY WINNERS" },
        ]}
      />
    );
  }

  if (pathname === "/studio") {
    return (
      <footer className="site-footer site-footer--studio">
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

  if (pathname.startsWith("/outfits/")) {
    return (
      <EditorialFooter
        sectionLabel="05 · THE LAST LOOK"
        variant="hall"
        navItems={[
          { href: "/", label: "HOME" },
          { href: "/studio", label: "DRESS UP" },
          { href: "/hall-of-fame", label: "HALL OF FAME" },
          { href: "/daily-winners", label: "DAILY WINNERS" },
        ]}
      />
    );
  }

  if (pathname.startsWith("/daily-winners")) {
    return <DailyWinnersFooter motionEnabled={pathname === "/daily-winners"} />;
  }

  return (
    <footer className="site-footer">
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
