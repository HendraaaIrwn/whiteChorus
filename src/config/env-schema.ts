import { z } from "zod";

export const serverEnvSchema = z
  .object({
    APP_URL: z.url().default("http://localhost:3000"),
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1),
    SESSION_COOKIE_NAME: z.string().min(1).default("wc_guest"),
    SESSION_TOKEN_SECRET: z.string().min(32),
    SESSION_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(604800),
    RATE_LIMIT_SECRET: z.string().min(32),
    SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET: z
      .string()
      .min(1)
      .default("white-chorus-generated"),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().default(""),
    TURNSTILE_SECRET_KEY: z.string().default(""),
    TURNSTILE_MODE: z.enum(["off", "adaptive", "always"]).default("adaptive"),
    SESSION_CREATE_LIMIT_PER_HOUR: z.coerce
      .number()
      .int()
      .positive()
      .default(5),
    PUBLISH_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(5),
    PUBLISH_LIMIT_PER_DAY: z.coerce.number().int().positive().default(15),
    PUBLISH_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(10),
    DUPLICATE_WINDOW_HOURS: z.coerce.number().int().positive().default(24),
    RATING_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(30),
    INTERACTION_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(30),
    DOWNLOAD_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(60),
    SUBMISSION_RETENTION_DAYS: z.coerce.number().int().positive().default(7),
    EXPIRED_TOMBSTONE_HOURS: z.coerce.number().int().nonnegative().default(24),
    GUEST_RETENTION_DAYS: z.coerce.number().int().positive().default(14),
    STUCK_PROCESSING_MINUTES: z.coerce.number().int().positive().default(15),
    FAILED_OUTFIT_RETENTION_DAYS: z.coerce.number().int().positive().default(2),
    WEEKLY_TIMEZONE: z
      .string()
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      }, "WEEKLY_TIMEZONE must be a valid IANA time zone")
      .default("Asia/Jakarta"),
    WEEKLY_MIN_RATINGS: z.coerce.number().int().positive().default(5),
    WEEKLY_WINNER_ENABLED: z.enum(["true", "false"]).default("true"),
    NEXT_PUBLIC_ASSET_MODE: z
      .enum(["fixture", "production"])
      .default("fixture"),
    CRON_SECRET: z.string().min(32),
    INTERNAL_ADMIN_SECRET: z.string().min(32),
  })
  .superRefine((env, context) => {
    if (
      env.TURNSTILE_MODE !== "off" &&
      (!env.TURNSTILE_SECRET_KEY || !env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
    )
      context.addIssue({
        code: "custom",
        path: ["TURNSTILE_MODE"],
        message: "Turnstile site and secret keys are required when enabled.",
      });
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;
