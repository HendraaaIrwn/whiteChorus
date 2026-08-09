import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function SectionHeading({
  className,
  eyebrow,
  id,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { eyebrow?: string }) {
  return (
    <div className={cn("section-heading", className)} {...props}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id}>{children}</h2>
      <svg aria-hidden="true" viewBox="0 0 180 12">
        <path d="M2 8C42 2 76 11 111 6C136 3 156 5 178 2" />
      </svg>
    </div>
  );
}
