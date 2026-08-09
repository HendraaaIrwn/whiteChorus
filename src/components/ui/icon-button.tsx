import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function IconButton({
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn("icon-button", className)} type={type} {...props}>
      {children}
    </button>
  );
}
