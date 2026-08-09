"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import {
  motionDurations,
  motionEase,
} from "@/components/motion/motion-presets";

type ManagedMotionProps =
  | "initial"
  | "animate"
  | "whileInView"
  | "viewport"
  | "transition"
  | "variants";

type RevealOptions = {
  delay?: number;
  distance?: number;
  inView?: boolean;
};

type RevealProps<
  Tag extends "div" | "section" | "article" | "aside" | "header",
> = Omit<HTMLMotionProps<Tag>, ManagedMotionProps> & RevealOptions;

function useRevealOptions({
  delay = 0,
  distance = 18,
  inView = true,
}: RevealOptions) {
  const reduceMotion = useHydratedReducedMotion();
  const visible = { opacity: 1, y: 0 };

  return {
    initial: reduceMotion ? false : { opacity: inView ? 1 : 0, y: distance },
    animate: inView ? undefined : visible,
    whileInView: inView ? visible : undefined,
    viewport: inView ? { once: true, amount: 0.2 } : undefined,
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: motionDurations.slow, delay, ease: motionEase },
  };
}

export function MotionPage({
  children,
  ...props
}: Omit<HTMLMotionProps<"div">, ManagedMotionProps>) {
  const reveal = useRevealOptions({ distance: 10, inView: false });
  return (
    <motion.div {...props} {...reveal}>
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  delay,
  distance,
  inView,
  ...props
}: RevealProps<"div">) {
  const reveal = useRevealOptions({ delay, distance, inView });
  return (
    <motion.div {...props} {...reveal}>
      {children}
    </motion.div>
  );
}

export function RevealSection({
  children,
  delay,
  distance,
  inView,
  ...props
}: RevealProps<"section">) {
  const reveal = useRevealOptions({ delay, distance, inView });
  return (
    <motion.section {...props} {...reveal}>
      {children}
    </motion.section>
  );
}

export function RevealArticle({
  children,
  delay,
  distance,
  inView,
  ...props
}: RevealProps<"article">) {
  const reveal = useRevealOptions({ delay, distance, inView });
  return (
    <motion.article {...props} {...reveal}>
      {children}
    </motion.article>
  );
}

export function RevealAside({
  children,
  delay,
  distance,
  inView,
  ...props
}: RevealProps<"aside">) {
  const reveal = useRevealOptions({ delay, distance, inView });
  return (
    <motion.aside {...props} {...reveal}>
      {children}
    </motion.aside>
  );
}

export function RevealHeader({
  children,
  delay,
  distance,
  inView,
  ...props
}: RevealProps<"header">) {
  const reveal = useRevealOptions({ delay, distance, inView });
  return (
    <motion.header {...props} {...reveal}>
      {children}
    </motion.header>
  );
}

type StaggerGroupProps = Omit<HTMLMotionProps<"div">, ManagedMotionProps> & {
  delay?: number;
  inView?: boolean;
};

export function StaggerGroup({
  children,
  delay = 0,
  inView = true,
  ...props
}: StaggerGroupProps) {
  const reduceMotion = useHydratedReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0 },
    resting: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : { delayChildren: delay, staggerChildren: 0.07 },
    },
  };

  return (
    <motion.div
      {...props}
      variants={variants}
      initial={reduceMotion ? false : inView ? "resting" : "hidden"}
      animate={inView ? undefined : "visible"}
      whileInView={inView ? "visible" : undefined}
      viewport={inView ? { once: true, amount: 0.18 } : undefined}
    >
      {children}
    </motion.div>
  );
}

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  resting: { opacity: 1, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.base, ease: motionEase },
  },
};

export function StaggerItem({
  children,
  ...props
}: Omit<HTMLMotionProps<"div">, ManagedMotionProps>) {
  return (
    <motion.div {...props} variants={staggerItemVariants}>
      {children}
    </motion.div>
  );
}

export function StaggerArticle({
  children,
  ...props
}: Omit<HTMLMotionProps<"article">, ManagedMotionProps>) {
  return (
    <motion.article {...props} variants={staggerItemVariants}>
      {children}
    </motion.article>
  );
}
