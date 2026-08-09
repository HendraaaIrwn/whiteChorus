"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { cn } from "@/lib/cn";

const editorialEase = [0.22, 1, 0.36, 1] as const;

export function MaskedHeading({
  id,
  lines,
  className,
  level = "h2",
  intro = false,
  skipAnimation = false,
}: {
  id?: string;
  lines: string[];
  className?: string;
  level?: "h1" | "h2";
  intro?: boolean;
  skipAnimation?: boolean;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const Tag = level === "h1" ? motion.h1 : motion.h2;
  const group: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { duration: 0 }
        : { delayChildren: intro ? 0.18 : 0.04, staggerChildren: 0.09 },
    },
  };
  const line: Variants = {
    hidden: { y: "110%" },
    visible: {
      y: "0%",
      transition: {
        duration: reduceMotion ? 0 : intro ? 0.74 : 0.62,
        ease: editorialEase,
      },
    },
  };

  return (
    <Tag
      id={id}
      className={className}
      variants={group}
      initial={reduceMotion || skipAnimation ? false : "hidden"}
      animate={intro && !skipAnimation ? "visible" : undefined}
      whileInView={intro || skipAnimation ? undefined : "visible"}
      viewport={intro ? undefined : { once: true, amount: 0.45 }}
    >
      {lines.map((text) => (
        <span className="home-mask-line" key={text}>
          <motion.span variants={line}>{text}</motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function HomeReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useHydratedReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? 0 : 0.68,
        delay: reduceMotion ? 0 : delay,
        ease: editorialEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useHydratedReducedMotion();
  return (
    <motion.div
      className={className}
      initial={
        reduceMotion
          ? false
          : { clipPath: "inset(12% 0 0 0 round 32px)", scale: 1.045 }
      }
      whileInView={{ clipPath: "inset(0% 0 0 0 round 32px)", scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduceMotion ? 0 : 0.78,
        delay: reduceMotion ? 0 : delay,
        ease: editorialEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function Magnetic({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 280, damping: 24, mass: 0.5 });
  const smoothY = useSpring(y, { stiffness: 280, damping: 24, mass: 0.5 });

  return (
    <motion.span
      className={cn("home-magnetic", className)}
      style={{ x: smoothX, y: smoothY }}
      onPointerMove={(event) => {
        if (
          reduceMotion ||
          !window.matchMedia("(hover: hover) and (pointer: fine)").matches
        )
          return;
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set(
          Math.max(
            -8,
            Math.min(
              8,
              (event.clientX - bounds.left - bounds.width / 2) * 0.18,
            ),
          ),
        );
        y.set(
          Math.max(
            -8,
            Math.min(
              8,
              (event.clientY - bounds.top - bounds.height / 2) * 0.18,
            ),
          ),
        );
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

export function CustomCursor({
  scope = "home",
}: {
  scope?: "home" | "studio" | "hall" | "winner";
}) {
  const reduceMotion = useHydratedReducedMotion();
  const x = useMotionValue(-80);
  const y = useMotionValue(-80);
  const smoothX = useSpring(x, { stiffness: 620, damping: 42, mass: 0.28 });
  const smoothY = useSpring(y, { stiffness: 620, damping: 42, mass: 0.28 });
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduceMotion || !query.matches || window.innerWidth < 768) return;

    const readyClassName = `${scope}-custom-cursor-ready`;
    document.documentElement.classList.add(readyClassName);

    const cursorIsEnabled = () => query.matches && window.innerWidth >= 768;

    const move = (event: PointerEvent) => {
      if (!cursorIsEnabled()) return;
      x.set(event.clientX);
      y.set(event.clientY);
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };
    const over = (event: PointerEvent) => {
      if (!cursorIsEnabled()) return;
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-cursor]")
          : null;
      setLabel(target?.dataset.cursor ?? "");
    };
    const leave = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    const syncReadiness = () => {
      const enabled = cursorIsEnabled();
      document.documentElement.classList.toggle(readyClassName, enabled);
      if (!enabled && visibleRef.current) leave();
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", syncReadiness, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    query.addEventListener("change", syncReadiness);
    return () => {
      document.documentElement.classList.remove(readyClassName);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", syncReadiness);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
      query.removeEventListener("change", syncReadiness);
    };
  }, [reduceMotion, scope, x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "home-cursor",
        scope === "studio" && "studio-cursor",
        scope === "hall" && "hall-cursor",
        scope === "winner" && "winner-cursor",
      )}
      data-label={label || undefined}
      style={{ x: smoothX, y: smoothY }}
      animate={{ opacity: visible ? 1 : 0, scale: label ? 1 : 0.72 }}
      transition={{ duration: 0.18 }}
    >
      <span>{label}</span>
    </motion.div>
  );
}
