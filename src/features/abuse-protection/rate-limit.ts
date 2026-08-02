import "server-only";

import type { RateLimitAction } from "@/generated/prisma/enums";
import { getServerEnv } from "@/config/env";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";
import { hmacHex } from "@/server/security/crypto";

type CounterRow = { count: number; window_ends_at: Date };

export async function consumeRateLimit({
  scope,
  action,
  windowSeconds,
  limit,
  now = new Date(),
}: {
  scope: string;
  action: RateLimitAction;
  windowSeconds: number;
  limit: number;
  now?: Date;
}): Promise<void> {
  const keyHash = hmacHex(getServerEnv().RATE_LIMIT_SECRET, scope);
  const windowEnd = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await getPrisma().$queryRawUnsafe<CounterRow[]>(
    `INSERT INTO "rate_limit_counters" ("key_hash", "action", "window_started_at", "window_ends_at", "count", "created_at", "updated_at")
     VALUES ($1, $2::"rate_limit_action", $3, $4, 1, now(), now())
     ON CONFLICT ("key_hash", "action") DO UPDATE SET
       "window_started_at" = CASE WHEN "rate_limit_counters"."window_ends_at" <= $3 THEN $3 ELSE "rate_limit_counters"."window_started_at" END,
       "window_ends_at" = CASE WHEN "rate_limit_counters"."window_ends_at" <= $3 THEN $4 ELSE "rate_limit_counters"."window_ends_at" END,
       "count" = CASE WHEN "rate_limit_counters"."window_ends_at" <= $3 THEN 1 ELSE LEAST("rate_limit_counters"."count" + 1, $5 + 1) END,
       "updated_at" = now()
     RETURNING "count", "window_ends_at"`,
    keyHash,
    action,
    now,
    windowEnd,
    limit,
  );
  if ((rows[0]?.count ?? limit + 1) > limit) {
    throw new DomainError(
      "RATE_LIMITED",
      "You have reached the limit for now. Please try again later.",
      429,
    );
  }
}
