"use client";

import * as React from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { cn } from "@/lib/cn";

type ButtonProps = Omit<
  HTMLMotionProps<"button">,
  "children" | "whileHover" | "whileTap"
> & {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children?: React.ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const reduceMotion = useHydratedReducedMotion();
  const inactive = disabled || loading;

  return (
    <motion.button
      className={cn(
        "button",
        `button--${variant}`,
        `button--${size}`,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      whileHover={reduceMotion || inactive ? undefined : { y: -2 }}
      whileTap={reduceMotion || inactive ? undefined : { y: 3, scale: 0.99 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      {...props}
    >
      <AnimatePresence initial={false}>
        {loading ? (
          <motion.span
            key="loading-spinner"
            className="spinner"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        ) : null}
      </AnimatePresence>
      <span>{loading ? "CREATING YOUR LOOK…" : children}</span>
    </motion.button>
  );
}
