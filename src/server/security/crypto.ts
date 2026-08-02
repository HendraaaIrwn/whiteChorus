import "server-only";

import { createHmac, randomBytes } from "node:crypto";

export function secureRandomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hmacHex(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}
