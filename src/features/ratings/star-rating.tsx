"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { ensureGuestSession } from "@/features/guest-session/ensure-guest-session";

export function StarRating({
  outfitId,
  initialValue,
  average,
  count,
  disabled,
  variant = "detail",
}: {
  outfitId: string;
  initialValue: number | null;
  average: number;
  count: number;
  disabled: boolean;
  variant?: "detail" | "compact";
}) {
  const feedbackId = useId();
  const reduceMotion = useHydratedReducedMotion();
  const [value, setValue] = useState(initialValue);
  const [previewValue, setPreviewValue] = useState<number | null>(null);
  const [summary, setSummary] = useState({ average, count });
  const [message, setMessage] = useState(
    disabled
      ? "This one is yours."
      : initialValue
        ? variant === "compact"
          ? ""
          : `Your rating is ${initialValue} out of 5. Choose another star to update it.`
        : variant === "compact"
          ? ""
          : "Choose one to five stars.",
  );
  const [submitting, setSubmitting] = useState(false);

  async function rate(next: number) {
    const previous = value;
    setValue(next);
    setSubmitting(true);
    try {
      await ensureGuestSession();
      const response = await fetch(`/api/outfits/${outfitId}/rating`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value: next }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { aggregate: { average: number; count: number } };
        error?: { message: string };
      };
      if (!response.ok || !payload.data)
        throw new Error(payload.error?.message ?? "Rating could not be saved.");
      setSummary(payload.data.aggregate);
      setMessage(
        variant === "compact"
          ? "Thanks ♡"
          : `Thanks ♡ Your rating is ${next} out of 5.`,
      );
    } catch (error) {
      setValue(previous);
      setMessage(
        error instanceof Error ? error.message : "Rating could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`rating-panel rating-panel--${variant}`}>
      <div className="rating-summary">
        <AnimatePresence initial={false} mode="wait">
          <motion.strong
            key={`${summary.average}:${summary.count}`}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0.08 : 0.18 }}
          >
            {summary.average.toFixed(1)} ★
          </motion.strong>
        </AnimatePresence>
        <span>
          {summary.count} {summary.count === 1 ? "rating" : "ratings"}
        </span>
      </div>
      <fieldset
        className="star-rating"
        data-cursor={disabled ? undefined : "RATE"}
        aria-describedby={feedbackId}
        onPointerLeave={() => setPreviewValue(null)}
      >
        <legend className="sr-only">Rate this look</legend>
        {[1, 2, 3, 4, 5].map((star) => {
          const selected = (previewValue ?? value ?? 0) >= star;
          const chosen = value === star;
          return (
            <label
              key={star}
              onPointerEnter={() => {
                if (!disabled && !submitting) setPreviewValue(star);
              }}
            >
              <input
                type="radio"
                name={`rating-${outfitId}`}
                value={star}
                checked={chosen}
                disabled={disabled || submitting}
                aria-label={`Rate ${star} out of 5 stars`}
                onFocus={() => {
                  if (!disabled && !submitting) setPreviewValue(star);
                }}
                onBlur={() => setPreviewValue(null)}
                onChange={() => void rate(star)}
              />
              <motion.span
                className="star-rating__icon"
                animate={
                  reduceMotion
                    ? { scale: 1, rotate: 0 }
                    : previewValue !== null && selected
                      ? {
                          scale: previewValue === star ? 1.13 : 1.05,
                          rotate: previewValue === star ? -5 : 0,
                        }
                      : chosen
                        ? {
                            scale: [0.85, 1.16, 1],
                            rotate: [0, -5, 0],
                          }
                        : { scale: 1, rotate: 0 }
                }
                transition={{
                  duration: reduceMotion ? 0.08 : 0.24,
                  delay:
                    !reduceMotion && previewValue !== null ? star * 0.025 : 0,
                }}
              >
                <Star
                  aria-hidden="true"
                  fill={selected ? "currentColor" : "transparent"}
                />
              </motion.span>
            </label>
          );
        })}
      </fieldset>
      <div
        id={feedbackId}
        className="rating-feedback"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            key={message}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0.08 : 0.18 }}
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
