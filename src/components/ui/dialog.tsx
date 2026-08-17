"use client";

import { useEffect, useId, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import {
  motionDurations,
  motionEase,
} from "@/components/motion/motion-presets";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  returnFocusSelector,
  className,
  panelClassName,
  lockScroll = false,
  children,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description?: string;
  returnFocusSelector?: string;
  className?: string;
  panelClassName?: string;
  lockScroll?: boolean;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useHydratedReducedMotion();

  useEffect(() => {
    if (!open || !lockScroll) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lockScroll, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current =
        (returnFocusSelector
          ? document.querySelector<HTMLElement>(returnFocusSelector)
          : null) ??
        (document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null);
      dialog.showModal();
      return;
    }
    if (!open && dialog.open) {
      const returnFocus = returnFocusRef.current;
      dialog.close();
      window.requestAnimationFrame(() => {
        if (returnFocus?.isConnected) returnFocus.focus();
      });
    }
  }, [open, returnFocusSelector]);

  return (
    <dialog
      ref={dialogRef}
      className={cn("dialog", className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      {open ? (
        <motion.div
          className={cn("dialog__panel", panelClassName)}
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: reduceMotion
              ? motionDurations.instant
              : motionDurations.base,
            ease: motionEase,
          }}
        >
          <IconButton
            className="dialog__close"
            aria-label="Close dialog"
            onClick={() => onOpenChange(false)}
          >
            <X aria-hidden="true" />
          </IconButton>
          <div className="dialog__copy">
            <p className="eyebrow">White Chorus</p>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          {children}
        </motion.div>
      ) : null}
    </dialog>
  );
}
