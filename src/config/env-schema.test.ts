import { describe, expect, it } from "vitest";

import { serverEnvSchema } from "@/config/env-schema";

const required = {
  DATABASE_URL: "postgresql://localhost/runtime",
  DIRECT_URL: "postgresql://localhost/direct",
  SESSION_TOKEN_SECRET: "s".repeat(32),
  RATE_LIMIT_SECRET: "r".repeat(32),
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-key",
  CRON_SECRET: "c".repeat(32),
  INTERNAL_ADMIN_SECRET: "a".repeat(32),
};

describe("serverEnvSchema", () => {
  it("requires both Turnstile keys whenever protection is enabled", () => {
    expect(
      serverEnvSchema.safeParse({ ...required, TURNSTILE_MODE: "off" }).success,
    ).toBe(true);
    expect(
      serverEnvSchema.safeParse({
        ...required,
        TURNSTILE_MODE: "adaptive",
      }).success,
    ).toBe(false);
  });
});
