"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { ensureGuestSession } from "@/features/guest-session/ensure-guest-session";

export function StarRating({
  outfitId,
  initialValue,
  average,
  count,
  disabled,
}: {
  outfitId: string;
  initialValue: number | null;
  average: number;
  count: number;
  disabled: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [summary, setSummary] = useState({ average, count });
  const [message, setMessage] = useState(
    disabled ? "You cannot rate this look." : "Choose one to five stars.",
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
      setMessage(`You rated this look ${next} out of 5 stars.`);
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
    <div className="rating-panel">
      <div className="rating-summary">
        <strong>{summary.average.toFixed(1)} ★</strong>
        <span>
          {summary.count} {summary.count === 1 ? "rating" : "ratings"}
        </span>
      </div>
      <fieldset className="star-rating">
        <legend className="sr-only">Rate this look</legend>
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
          >
            <input
              type="radio"
              name={`rating-${outfitId}`}
              value={star}
              checked={value === star}
              disabled={disabled || submitting}
              onChange={() => void rate(star)}
            />
            <Star
              aria-hidden="true"
              fill={(value ?? 0) >= star ? "currentColor" : "transparent"}
            />
          </label>
        ))}
      </fieldset>
      <p aria-live="polite">{message}</p>
    </div>
  );
}
