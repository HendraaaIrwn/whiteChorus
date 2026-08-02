CREATE TYPE "outfit_status" AS ENUM ('PROCESSING', 'PUBLISHED', 'FAILED', 'HIDDEN', 'EXPIRED');
CREATE TYPE "outfit_interaction_type" AS ENUM ('NATIVE_SHARE', 'COPY_LINK', 'WHATSAPP', 'FACEBOOK', 'X', 'TELEGRAM', 'DOWNLOAD');
CREATE TYPE "rate_limit_action" AS ENUM ('SESSION_CREATE_HOURLY', 'OUTFIT_PUBLISH_HOURLY', 'OUTFIT_PUBLISH_DAILY', 'OUTFIT_PUBLISH_COOLDOWN', 'RATING_WRITE_HOURLY', 'INTERACTION_WRITE_HOURLY', 'DOWNLOAD_HOURLY');

CREATE TABLE "guests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_token_hash" CHAR(64) NOT NULL,
  "ip_hash" CHAR(64),
  "user_agent_hash" CHAR(64),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "guests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "guests_expiry_check" CHECK ("expires_at" > "created_at")
);

CREATE TABLE "outfits" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guest_id" UUID NOT NULL,
  "short_code" VARCHAR(12) NOT NULL,
  "background_id" VARCHAR(64) NOT NULL,
  "character_a_config" JSONB NOT NULL,
  "character_b_config" JSONB NOT NULL,
  "configuration_hash" CHAR(64) NOT NULL,
  "final_image_path" VARCHAR(512),
  "download_image_path" VARCHAR(512),
  "thumbnail_path" VARCHAR(512),
  "social_image_path" VARCHAR(512),
  "status" "outfit_status" NOT NULL DEFAULT 'PROCESSING',
  "rating_average" DECIMAL(4,3) NOT NULL DEFAULT 0,
  "rating_count" INTEGER NOT NULL DEFAULT 0,
  "weighted_score" DECIMAL(6,4) NOT NULL DEFAULT 0,
  "is_competition_eligible" BOOLEAN NOT NULL DEFAULT true,
  "published_at" TIMESTAMPTZ(3),
  "expires_at" TIMESTAMPTZ(3),
  "hidden_at" TIMESTAMPTZ(3),
  "hidden_reason" VARCHAR(128),
  "failure_reason" VARCHAR(128),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "outfits_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "outfits_short_code_format_check" CHECK ("short_code" ~ '^[A-Z0-9]{4,12}$'),
  CONSTRAINT "outfits_rating_average_check" CHECK ("rating_average" BETWEEN 0 AND 5),
  CONSTRAINT "outfits_rating_count_check" CHECK ("rating_count" >= 0),
  CONSTRAINT "outfits_weighted_score_check" CHECK ("weighted_score" BETWEEN 0 AND 5),
  CONSTRAINT "outfits_expiry_after_publish_check" CHECK ("published_at" IS NULL OR "expires_at" IS NULL OR "expires_at" > "published_at"),
  CONSTRAINT "outfits_published_artifacts_check" CHECK (
    "status" NOT IN ('PUBLISHED', 'HIDDEN', 'EXPIRED') OR (
      "published_at" IS NOT NULL AND "expires_at" IS NOT NULL AND
      "final_image_path" IS NOT NULL AND "download_image_path" IS NOT NULL AND
      "thumbnail_path" IS NOT NULL AND "social_image_path" IS NOT NULL
    )
  )
);

CREATE TABLE "ratings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "outfit_id" UUID NOT NULL,
  "guest_id" UUID NOT NULL,
  "value" SMALLINT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "ratings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ratings_value_check" CHECK ("value" BETWEEN 1 AND 5)
);

CREATE TABLE "outfit_interactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "outfit_id" UUID NOT NULL,
  "guest_id" UUID NOT NULL,
  "type" "outfit_interaction_type" NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "outfit_interactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "weekly_winners" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "source_outfit_id" UUID,
  "week_key" CHAR(10) NOT NULL,
  "week_start" TIMESTAMPTZ(3) NOT NULL,
  "week_end" TIMESTAMPTZ(3) NOT NULL,
  "short_code" VARCHAR(12) NOT NULL,
  "winner_image_path" VARCHAR(512) NOT NULL,
  "social_image_path" VARCHAR(512),
  "final_average" DECIMAL(4,3) NOT NULL,
  "final_rating_count" INTEGER NOT NULL,
  "final_weighted_score" DECIMAL(6,4) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "weekly_winners_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "weekly_winners_period_check" CHECK ("week_end" > "week_start"),
  CONSTRAINT "weekly_winners_final_average_check" CHECK ("final_average" BETWEEN 0 AND 5),
  CONSTRAINT "weekly_winners_final_rating_count_check" CHECK ("final_rating_count" >= 0),
  CONSTRAINT "weekly_winners_final_weighted_score_check" CHECK ("final_weighted_score" BETWEEN 0 AND 5)
);

CREATE TABLE "rate_limit_counters" (
  "key_hash" CHAR(64) NOT NULL,
  "action" "rate_limit_action" NOT NULL,
  "window_started_at" TIMESTAMPTZ(3) NOT NULL,
  "window_ends_at" TIMESTAMPTZ(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "rate_limit_counters_pkey" PRIMARY KEY ("key_hash", "action"),
  CONSTRAINT "rate_limit_counters_window_check" CHECK ("window_ends_at" > "window_started_at"),
  CONSTRAINT "rate_limit_counters_count_check" CHECK ("count" >= 0)
);

CREATE UNIQUE INDEX "guests_session_token_hash_key" ON "guests"("session_token_hash");
CREATE INDEX "guests_expires_at_idx" ON "guests"("expires_at");
CREATE INDEX "guests_ip_hash_created_at_idx" ON "guests"("ip_hash", "created_at" DESC);
CREATE UNIQUE INDEX "outfits_short_code_key" ON "outfits"("short_code");
CREATE INDEX "outfits_status_expires_at_idx" ON "outfits"("status", "expires_at");
CREATE INDEX "outfits_status_published_at_idx" ON "outfits"("status", "published_at" DESC);
CREATE INDEX "outfits_top_rated_idx" ON "outfits"("status", "weighted_score" DESC, "rating_count" DESC, "published_at" ASC);
CREATE INDEX "outfits_guest_created_at_idx" ON "outfits"("guest_id", "created_at" DESC);
CREATE INDEX "outfits_duplicate_lookup_idx" ON "outfits"("guest_id", "configuration_hash", "created_at" DESC);
CREATE INDEX "outfits_competition_lookup_idx" ON "outfits"("is_competition_eligible", "published_at" DESC);
CREATE UNIQUE INDEX "ratings_outfit_id_guest_id_key" ON "ratings"("outfit_id", "guest_id");
CREATE INDEX "ratings_guest_updated_at_idx" ON "ratings"("guest_id", "updated_at" DESC);
CREATE INDEX "outfit_interactions_outfit_created_at_idx" ON "outfit_interactions"("outfit_id", "created_at" DESC);
CREATE INDEX "outfit_interactions_guest_created_at_idx" ON "outfit_interactions"("guest_id", "created_at" DESC);
CREATE INDEX "outfit_interactions_type_created_at_idx" ON "outfit_interactions"("type", "created_at" DESC);
CREATE UNIQUE INDEX "weekly_winners_source_outfit_id_key" ON "weekly_winners"("source_outfit_id");
CREATE UNIQUE INDEX "weekly_winners_week_key_key" ON "weekly_winners"("week_key");
CREATE UNIQUE INDEX "weekly_winners_week_period_key" ON "weekly_winners"("week_start", "week_end");
CREATE INDEX "weekly_winners_week_start_idx" ON "weekly_winners"("week_start" DESC);
CREATE INDEX "rate_limit_counters_window_ends_at_idx" ON "rate_limit_counters"("window_ends_at");

ALTER TABLE "outfits" ADD CONSTRAINT "outfits_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outfit_interactions" ADD CONSTRAINT "outfit_interactions_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outfit_interactions" ADD CONSTRAINT "outfit_interactions_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "weekly_winners" ADD CONSTRAINT "weekly_winners_source_outfit_id_fkey" FOREIGN KEY ("source_outfit_id") REFERENCES "outfits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
