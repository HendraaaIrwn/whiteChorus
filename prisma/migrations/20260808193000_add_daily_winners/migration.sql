CREATE TABLE "daily_winners" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "source_outfit_id" UUID,
  "day_key" CHAR(10) NOT NULL,
  "day_start" TIMESTAMPTZ(3) NOT NULL,
  "day_end" TIMESTAMPTZ(3) NOT NULL,
  "short_code" VARCHAR(12) NOT NULL,
  "winner_image_path" VARCHAR(512) NOT NULL,
  "social_image_path" VARCHAR(512),
  "final_average" DECIMAL(4,3) NOT NULL,
  "final_rating_count" INTEGER NOT NULL,
  "final_weighted_score" DECIMAL(6,4) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "daily_winners_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "daily_winners_period_check" CHECK ("day_end" > "day_start"),
  CONSTRAINT "daily_winners_final_average_check" CHECK ("final_average" BETWEEN 0 AND 5),
  CONSTRAINT "daily_winners_final_rating_count_check" CHECK ("final_rating_count" >= 0),
  CONSTRAINT "daily_winners_final_weighted_score_check" CHECK ("final_weighted_score" BETWEEN 0 AND 5)
);

CREATE UNIQUE INDEX "daily_winners_source_outfit_id_key" ON "daily_winners"("source_outfit_id");
CREATE UNIQUE INDEX "daily_winners_day_key_key" ON "daily_winners"("day_key");
CREATE UNIQUE INDEX "daily_winners_day_period_key" ON "daily_winners"("day_start", "day_end");
CREATE INDEX "daily_winners_day_start_idx" ON "daily_winners"("day_start" DESC);

ALTER TABLE "daily_winners"
ADD CONSTRAINT "daily_winners_source_outfit_id_fkey"
FOREIGN KEY ("source_outfit_id") REFERENCES "outfits"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "daily_winners" ENABLE ROW LEVEL SECURITY;
