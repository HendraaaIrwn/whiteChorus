"use client";

import { useReducedMotion } from "framer-motion";

import { useHydrated } from "@/lib/use-hydrated";

export function useHydratedReducedMotion(): boolean {
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  return hydrated && Boolean(reduceMotion);
}
