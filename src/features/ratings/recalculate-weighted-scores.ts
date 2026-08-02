import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { WEIGHTED_SCORE_PRIOR_WEIGHT } from "@/features/ratings/weighted-score";
import { getPrisma } from "@/server/database/prisma";

type Queryable = Pick<PrismaClient, "$executeRawUnsafe">;

export async function recalculateActiveWeightedScores(
  database: Queryable = getPrisma(),
): Promise<void> {
  await database.$executeRawUnsafe(
    `WITH global_mean AS (
       SELECT COALESCE(AVG(r."value"::numeric), 0) AS c
       FROM "ratings" r
       JOIN "outfits" active ON active."id" = r."outfit_id"
       WHERE active."status" = 'PUBLISHED' AND active."expires_at" > now()
     )
     UPDATE "outfits" o SET "weighted_score" =
       ((o."rating_count"::numeric / (o."rating_count" + $1)) * o."rating_average") +
       (($1::numeric / (o."rating_count" + $1)) * global_mean.c), "updated_at" = now()
     FROM global_mean WHERE o."status" = 'PUBLISHED' AND o."expires_at" > now()`,
    WEIGHTED_SCORE_PRIOR_WEIGHT,
  );
}
