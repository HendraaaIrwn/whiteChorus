import "server-only";

import { getServerEnv } from "@/config/env";
import { DomainError } from "@/server/http/domain-error";

export type TurnstileVerifier = {
  verify(token: string | null, remoteIp?: string): Promise<void>;
};

export const cloudflareTurnstileVerifier: TurnstileVerifier = {
  async verify(token, remoteIp) {
    const env = getServerEnv();
    if (env.TURNSTILE_MODE === "off") return;
    if (!token)
      throw new DomainError(
        "TURNSTILE_REQUIRED",
        "Please complete the security check and try again.",
        403,
      );
    const body = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
    });
    if (remoteIp) body.set("remoteip", remoteIp);
    let success = false;
    try {
      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        { method: "POST", body, cache: "no-store" },
      );
      success =
        response.ok &&
        Boolean(((await response.json()) as { success?: boolean }).success);
    } catch {
      throw new DomainError(
        "TURNSTILE_UNAVAILABLE",
        "The security check is temporarily unavailable. Please try again.",
        503,
      );
    }
    if (!success)
      throw new DomainError(
        "TURNSTILE_FAILED",
        "The security check failed. Please try again.",
        403,
      );
  },
};
