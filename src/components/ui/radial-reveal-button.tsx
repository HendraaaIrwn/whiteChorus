"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  type AnimationPlaybackControls,
} from "framer-motion";
import Link, { type LinkProps } from "next/link";
import * as React from "react";

import { editorialEase } from "@/components/motion/motion-presets";
import { cn } from "@/lib/cn";

import styles from "./radial-reveal-button.module.css";

type RadialRevealButtonVariant = "navy" | "apricot" | "mint";
type RadialRevealOrigin = "pointer" | "marked-element";

export type RadialRevealButtonProps = React.AriaAttributes & {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  download?: React.AnchorHTMLAttributes<HTMLAnchorElement>["download"];
  form?: string;
  href?: LinkProps["href"];
  id?: string;
  name?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  revealOrigin?: RadialRevealOrigin;
  rel?: string;
  role?: React.AriaRole;
  target?: React.HTMLAttributeAnchorTarget;
  title?: string;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  value?: React.ButtonHTMLAttributes<HTMLButtonElement>["value"];
  variant?: RadialRevealButtonVariant;
};

const radialDuration = 0.65;
const minimumInterruptedDuration = 0.12;
const hoverMedia = "(hover: hover) and (pointer: fine)";
const reducedMotionMedia = "(prefers-reduced-motion: reduce)";

function revealPosition(
  event: React.PointerEvent<HTMLAnchorElement | HTMLButtonElement>,
  revealOrigin: RadialRevealOrigin,
) {
  const rect = event.currentTarget.getBoundingClientRect();

  if (revealOrigin === "marked-element") {
    const marker = event.currentTarget.querySelector<HTMLElement>(
      "[data-radial-reveal-origin]",
    );

    if (marker) {
      const markerRect = marker.getBoundingClientRect();

      return {
        rect,
        x: Math.min(
          Math.max(markerRect.left + markerRect.width / 2 - rect.left, 0),
          rect.width,
        ),
        y: Math.min(
          Math.max(markerRect.top + markerRect.height / 2 - rect.top, 0),
          rect.height,
        ),
      };
    }
  }

  return {
    rect,
    x: Math.min(Math.max(event.clientX - rect.left, 0), rect.width),
    y: Math.min(Math.max(event.clientY - rect.top, 0), rect.height),
  };
}

function coverRadius(rect: DOMRect, x: number, y: number) {
  const horizontal = Math.max(x, rect.width - x);
  const vertical = Math.max(y, rect.height - y);

  return Math.hypot(horizontal, vertical) + 2;
}

export function RadialRevealButton({
  children,
  className,
  disabled = false,
  download,
  form,
  href,
  onClick,
  revealOrigin = "pointer",
  rel,
  target,
  type = "button",
  value,
  variant = "navy",
  ...ariaProps
}: RadialRevealButtonProps) {
  const radius = useMotionValue(0);
  const originX = useMotionValue(0);
  const originY = useMotionValue(0);
  const clipPath = useMotionTemplate`circle(${radius}px at ${originX}px ${originY}px)`;
  const animations = React.useRef<AnimationPlaybackControls[]>([]);
  const [pointerHovered, setPointerHovered] = React.useState(false);

  const stopAnimations = React.useCallback(() => {
    animations.current.forEach((animation) => animation.stop());
    animations.current = [];
  }, []);

  React.useEffect(() => stopAnimations, [stopAnimations]);

  const canAnimateRadially = React.useCallback(() => {
    return (
      !disabled &&
      window.matchMedia(hoverMedia).matches &&
      !window.matchMedia(reducedMotionMedia).matches
    );
  }, [disabled]);

  const handlePointerEnter = (
    event: React.PointerEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (disabled || !window.matchMedia(hoverMedia).matches) return;

    setPointerHovered(true);
    if (!canAnimateRadially()) return;

    const { rect, x, y } = revealPosition(event, revealOrigin);
    const targetRadius = coverRadius(rect, x, y);
    const currentRadius = radius.get();
    const progress = Math.min(currentRadius / targetRadius, 1);
    const duration = Math.max(
      minimumInterruptedDuration,
      radialDuration * (1 - progress),
    );

    stopAnimations();

    if (currentRadius <= 0.5) {
      originX.set(x);
      originY.set(y);
      animations.current = [
        animate(radius, targetRadius, {
          duration,
          ease: editorialEase,
        }),
      ];
      return;
    }

    animations.current = [
      animate(originX, x, { duration, ease: editorialEase }),
      animate(originY, y, { duration, ease: editorialEase }),
      animate(radius, targetRadius, { duration, ease: editorialEase }),
    ];
  };

  const handlePointerLeave = (
    event: React.PointerEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (disabled || !window.matchMedia(hoverMedia).matches) return;

    setPointerHovered(false);
    if (!canAnimateRadially()) return;

    const { rect, x, y } = revealPosition(event, revealOrigin);
    const currentRadius = radius.get();
    const progress = Math.min(currentRadius / coverRadius(rect, x, y), 1);
    const duration = Math.max(
      minimumInterruptedDuration,
      radialDuration * progress,
    );

    stopAnimations();
    animations.current = [
      animate(originX, x, { duration, ease: editorialEase }),
      animate(originY, y, { duration, ease: editorialEase }),
      animate(radius, 0, { duration, ease: editorialEase }),
    ];
  };

  const content = (
    <>
      <span className={styles.label}>{children}</span>
      <motion.span
        aria-hidden="true"
        className={styles.reveal}
        style={{ clipPath }}
      >
        {children}
      </motion.span>
    </>
  );
  const sharedProps = {
    ...ariaProps,
    className: cn(styles.root, styles[variant], className),
    "data-pointer-hovered": pointerHovered,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
  };

  if (href !== undefined && !disabled) {
    return (
      <Link
        {...sharedProps}
        download={download}
        href={href}
        onClick={onClick}
        rel={rel}
        target={target}
      >
        {content}
      </Link>
    );
  }

  if (href !== undefined) {
    return (
      <a
        {...sharedProps}
        aria-disabled="true"
        onClick={(event) => event.preventDefault()}
        role="link"
        tabIndex={-1}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...sharedProps}
      disabled={disabled}
      form={form}
      onClick={onClick}
      type={type}
      value={value}
    >
      {content}
    </button>
  );
}
