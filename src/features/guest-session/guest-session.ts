import "server-only";

import type { Guest } from "@/generated/prisma/client";
import { getServerEnv } from "@/config/env";
import { consumeRateLimit } from "@/features/abuse-protection/rate-limit";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";
import { hmacHex, secureRandomToken } from "@/server/security/crypto";

export type GuestSessionResult = { guest: Guest; rawToken?: string };

function tokenHash(rawToken: string): string {
  return hmacHex(getServerEnv().SESSION_TOKEN_SECRET, rawToken);
}

export function requestIpHash(request: Request): string | null {
  const raw =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip");
  return raw ? hmacHex(getServerEnv().RATE_LIMIT_SECRET, raw) : null;
}

export async function findGuest(
  rawToken: string | undefined,
): Promise<Guest | null> {
  if (!rawToken) return null;
  return getPrisma().guest.findFirst({
    where: {
      sessionTokenHash: tokenHash(rawToken),
      expiresAt: { gt: new Date() },
    },
  });
}

export async function requireGuest(
  rawToken: string | undefined,
): Promise<Guest> {
  const guest = await findGuest(rawToken);
  if (!guest)
    throw new DomainError(
      "INVALID_SESSION",
      "Your session has expired. Refresh the page to continue.",
      401,
    );
  return getPrisma().guest.update({
    where: { id: guest.id },
    data: { lastSeenAt: new Date() },
  });
}

export async function createOrRestoreGuest(
  rawToken: string | undefined,
  request: Request,
): Promise<GuestSessionResult> {
  const existing = await findGuest(rawToken);
  if (existing) {
    const guest = await getPrisma().guest.update({
      where: { id: existing.id },
      data: { lastSeenAt: new Date() },
    });
    return { guest };
  }

  const ipHash = requestIpHash(request);
  if (ipHash) {
    await consumeRateLimit({
      scope: `ip:${ipHash}`,
      action: "SESSION_CREATE_HOURLY",
      windowSeconds: 3600,
      limit: getServerEnv().SESSION_CREATE_LIMIT_PER_HOUR,
    });
  }

  const nextToken = secureRandomToken();
  const now = new Date();
  const guest = await getPrisma().guest.create({
    data: {
      sessionTokenHash: tokenHash(nextToken),
      ipHash,
      userAgentHash: request.headers.get("user-agent")
        ? hmacHex(
            getServerEnv().RATE_LIMIT_SECRET,
            request.headers.get("user-agent")!,
          )
        : null,
      expiresAt: new Date(
        now.getTime() + getServerEnv().SESSION_MAX_AGE_SECONDS * 1000,
      ),
    },
  });
  return { guest, rawToken: nextToken };
}
