import "server-only";

import { z } from "zod";

import { getServerEnv } from "@/config/env";
import { consumeRateLimit } from "@/features/abuse-protection/rate-limit";
import { recalculateActiveWeightedScores } from "@/features/ratings/recalculate-weighted-scores";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";

export const ratingSchema = z
  .object({
    value: z.number().int().min(1).max(5),
  })
  .strict();

export async function upsertRating(
  outfitId: string,
  guestId: string,
  value: number,
) {
  await consumeRateLimit({
    scope: `guest:${guestId}`,
    action: "RATING_WRITE_HOURLY",
    windowSeconds: 3600,
    limit: getServerEnv().RATING_LIMIT_PER_HOUR,
  });
  return getPrisma().$transaction(
    async (tx) => {
      // ponytail: serialize MVP rating writes because each write recalculates the global mean.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"white-chorus:rating-write"}))`;
      const outfit = await tx.outfit.findUnique({
        where: { id: outfitId },
        select: { id: true, guestId: true, status: true, expiresAt: true },
      });
      if (!outfit)
        throw new DomainError(
          "OUTFIT_NOT_FOUND",
          "This look could not be found.",
          404,
        );
      if (outfit.guestId === guestId)
        throw new DomainError(
          "SELF_RATING_NOT_ALLOWED",
          "You cannot rate your own look.",
          403,
        );
      if (
        outfit.status !== "PUBLISHED" ||
        !outfit.expiresAt ||
        outfit.expiresAt <= new Date()
      )
        throw new DomainError(
          "OUTFIT_EXPIRED",
          "This look can no longer be rated.",
          410,
        );

      const rating = await tx.rating.upsert({
        where: { outfitId_guestId: { outfitId, guestId } },
        create: { outfitId, guestId, value },
        update: { value },
      });
      const aggregate = await tx.rating.aggregate({
        where: { outfitId },
        _avg: { value: true },
        _count: { value: true },
      });
      const average = aggregate._avg.value ?? 0;
      const count = aggregate._count.value;
      await tx.outfit.update({
        where: { id: outfitId },
        data: { ratingAverage: average, ratingCount: count },
      });

      // ponytail: one SQL pass is exact at MVP scale; move to scheduled reconciliation only after measured write contention.
      await recalculateActiveWeightedScores(
        tx as unknown as Parameters<typeof recalculateActiveWeightedScores>[0],
      );
      return {
        rating: { value: rating.value },
        aggregate: { average: Number(average), count },
      };
    },
    {
      maxWait: 5_000,
      timeout: 15_000,
    },
  );
}
