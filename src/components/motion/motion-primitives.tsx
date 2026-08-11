"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

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
}: Omit<HTMLMotionProps<"div">, ManagedMotionProps> & RevealOptions) {
  const reveal = useRevealOptions({ delay, distance, inView });
  return (
    <motion.div {...props} {...reveal}>
      {children}
    </motion.div>
  );
}

export function RevealAside({
  children,
  delay,
  distance,
  inView,
  ...props
}: Omit<HTMLMotionProps<"aside">, ManagedMotionProps> & RevealOptions) {
  const reveal = useRevealOptions({ delay, distance, inView });
  return (
    <motion.aside {...props} {...reveal}>
      {children}
    </motion.aside>
  );
}
