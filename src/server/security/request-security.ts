import "server-only";

import { timingSafeEqual } from "node:crypto";

import { getServerEnv } from "@/config/env";

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  try {
    if (
      !origin ||
      new URL(origin).origin !== new URL(getServerEnv().APP_URL).origin
    )
      throw new Error("INVALID_ORIGIN");
  } catch {
    throw new Error("INVALID_ORIGIN");
  }
}

export function assertJson(request: Request): void {
  if (
    request.headers.get("content-type")?.split(";", 1)[0]?.trim() !==
    "application/json"
  ) {
    throw new Error("INVALID_CONTENT_TYPE");
  }
}

export function secretsMatch(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
