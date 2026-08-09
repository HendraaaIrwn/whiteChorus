import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "md" | "lg";
  loading?: boolean;
  replacementLabel?: React.ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  replacementLabel,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "button",
        `button--${variant}`,
        `button--${size}`,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="spinner" aria-hidden="true" /> : null}
      {loading ? (
        <span>CREATING YOUR LOOK…</span>
      ) : replacementLabel ? (
        <span className="button__label-stack">
          <span>{children}</span>
          <span aria-hidden="true">{replacementLabel}</span>
        </span>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}
