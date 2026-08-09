import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

import { serverEnvSchema } from "../src/config/env-schema";

const expectedTables = [
  "guests",
  "outfit_interactions",
  "outfits",
  "rate_limit_counters",
  "ratings",
  "daily_winners",
];

function parsePostgresUrl(name: string, value: string): URL {
  const url = new URL(value);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error(`${name} must use the postgresql protocol.`);
  if (url.searchParams.get("sslmode") !== "require")
    throw new Error(`${name} must include sslmode=require.`);
  if (url.searchParams.get("uselibpqcompat") !== "true")
    throw new Error(
      `${name} must include uselibpqcompat=true for pg SSL compatibility.`,
    );
  return url;
}

function rejectPlaceholders(env: Record<string, string | undefined>): void {
  const names = [
    "SESSION_TOKEN_SECRET",
    "RATE_LIMIT_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "TURNSTILE_SECRET_KEY",
    "CRON_SECRET",
    "INTERNAL_ADMIN_SECRET",
  ];
  for (const name of names) {
    const value = env[name] ?? "";
    if (/replace-with|placeholder|example|server-only-key/i.test(value))
      throw new Error(`${name} still contains a placeholder value.`);
  }
}

async function verifyDatabase(
  name: string,
  connectionString: string,
  requireTables = false,
): Promise<void> {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query("SELECT 1");
    if (requireTables) {
      const result = await client.query<{ table_name: string }>(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      const actual = new Set(result.rows.map((row) => row.table_name));
      const missing = expectedTables.filter((table) => !actual.has(table));
      if (missing.length)
        throw new Error(`Missing migrated tables: ${missing.join(", ")}`);
    }
    console.log(`${name} connection verified.`);
  } finally {
    await client.end();
  }
}

async function verifyStorage(
  supabaseUrl: string,
  serviceRoleKey: string,
  bucketName: string,
): Promise<void> {
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: buckets, error: bucketsError } =
    await client.storage.listBuckets();
  if (bucketsError) throw bucketsError;
  const configuredBucket = buckets.find((bucket) => bucket.name === bucketName);
  if (!configuredBucket)
    throw new Error(`Storage bucket ${bucketName} does not exist.`);
  if (!configuredBucket.public)
    throw new Error(
      `Storage bucket ${bucketName} must be public for generated URLs.`,
    );

  const path = `staging-probes/${randomUUID()}.txt`;
  const payload = `white-chorus-staging-probe:${randomUUID()}`;
  const bucket = client.storage.from(bucketName);
  try {
    const { error: uploadError } = await bucket.upload(path, payload, {
      contentType: "text/plain",
      upsert: false,
    });
    if (uploadError) throw uploadError;
    const publicUrl = bucket.getPublicUrl(path).data.publicUrl;
    const response = await fetch(publicUrl, { cache: "no-store" });
    if (!response.ok || (await response.text()) !== payload)
      throw new Error("Storage probe was not readable from its public URL.");
  } finally {
    const { error } = await bucket.remove([path]);
    if (error) throw error;
  }
  console.log("Supabase Storage write/read/delete probe verified.");
}

async function verifyTurnstile(secret: string): Promise<void> {
  const body = new URLSearchParams({
    secret,
    response: `white-chorus-invalid-probe-${randomUUID()}`,
  });
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body, cache: "no-store" },
  );
  if (!response.ok)
    throw new Error(`Turnstile returned HTTP ${response.status}.`);
  const result = (await response.json()) as {
    success?: boolean;
    "error-codes"?: string[];
  };
  if (result["error-codes"]?.includes("invalid-input-secret"))
    throw new Error("Turnstile rejected TURNSTILE_SECRET_KEY.");
  console.log("Turnstile secret accepted by Siteverify.");
}

async function main(): Promise<void> {
  const env = serverEnvSchema.parse(process.env);
  rejectPlaceholders(process.env);

  const pooled = parsePostgresUrl("DATABASE_URL", env.DATABASE_URL);
  const direct = parsePostgresUrl("DIRECT_URL", env.DIRECT_URL);
  if (pooled.toString() === direct.toString())
    throw new Error(
      "DATABASE_URL and DIRECT_URL must use distinct endpoints/modes.",
    );
  if (pooled.port !== "6543")
    throw new Error(
      "DATABASE_URL must use the Supavisor transaction pooler on port 6543.",
    );
  if (direct.port !== "5432")
    throw new Error(
      "DIRECT_URL must use a direct or session-mode endpoint on port 5432.",
    );
  if (pooled.searchParams.get("pgbouncer") !== "true")
    throw new Error(
      "DATABASE_URL must include pgbouncer=true for transaction mode.",
    );

  await verifyDatabase("Pooled PostgreSQL", env.DATABASE_URL, true);
  await verifyDatabase("Direct PostgreSQL", env.DIRECT_URL);
  await verifyStorage(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    env.SUPABASE_STORAGE_BUCKET,
  );
  await verifyTurnstile(env.TURNSTILE_SECRET_KEY);

  console.log(
    `Daily competition verified: enabled=${env.DAILY_WINNER_ENABLED}, timezone=${env.DAILY_TIMEZONE}, minimumRatings=${env.DAILY_MIN_RATINGS}.`,
  );
  console.log("Staging service verification passed.");
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Staging verification failed.",
  );
  process.exitCode = 1;
});
