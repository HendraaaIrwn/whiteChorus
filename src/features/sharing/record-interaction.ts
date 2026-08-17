import "server-only";

import { z } from "zod";

import { getServerEnv } from "@/config/env";
import { consumeRateLimit } from "@/features/abuse-protection/rate-limit";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";

export const shareSchema = z
  .object({
    channel: z.enum([
      "native-share",
      "copy-link",
      "whatsapp",
      "facebook",
      "x",
      "instagram",
    ]),
  })
  .strict();
const interactionType = {
  "native-share": "NATIVE_SHARE",
  "copy-link": "COPY_LINK",
  whatsapp: "WHATSAPP",
  facebook: "FACEBOOK",
  x: "X",
  instagram: "INSTAGRAM",
} as const;

export async function recordInteraction(
  outfitId: string,
  guestId: string,
  channel: keyof typeof interactionType,
) {
  await consumeRateLimit({
    scope: `guest:${guestId}`,
    action: "INTERACTION_WRITE_HOURLY",
    windowSeconds: 3600,
    limit: getServerEnv().INTERACTION_LIMIT_PER_HOUR,
  });
  const outfit = await getPrisma().outfit.findFirst({
    where: { id: outfitId, status: "PUBLISHED", expiresAt: { gt: new Date() } },
    select: { id: true },
  });
  if (!outfit)
    throw new DomainError(
      "OUTFIT_NOT_FOUND",
      "This look could not be found.",
      404,
    );
  await getPrisma().outfitInteraction.create({
    data: { outfitId, guestId, type: interactionType[channel] },
  });
}
