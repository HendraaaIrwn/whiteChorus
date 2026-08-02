import { NextRequest } from "next/server";

import { getServerEnv } from "@/config/env";
import { consumeRateLimit } from "@/features/abuse-protection/rate-limit";
import { requireGuest } from "@/features/guest-session/guest-session";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";
import { errorResponse, requestId } from "@/server/http/route-response";
import { getGeneratedAssetStorage } from "@/server/storage/generated-asset-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestIdentifier = requestId(request);
  try {
    const guest = await requireGuest(
      request.cookies.get(getServerEnv().SESSION_COOKIE_NAME)?.value,
    );
    await consumeRateLimit({
      scope: `guest:${guest.id}`,
      action: "DOWNLOAD_HOURLY",
      windowSeconds: 3600,
      limit: getServerEnv().DOWNLOAD_LIMIT_PER_HOUR,
    });
    const outfit = await getPrisma().outfit.findFirst({
      where: {
        id: (await params).id,
        status: "PUBLISHED",
        expiresAt: { gt: new Date() },
      },
      select: { id: true, shortCode: true, downloadImagePath: true },
    });
    if (!outfit?.downloadImagePath)
      throw new DomainError(
        "OUTFIT_NOT_FOUND",
        "This look could not be found.",
        404,
      );
    await getPrisma().outfitInteraction.create({
      data: { outfitId: outfit.id, guestId: guest.id, type: "DOWNLOAD" },
    });
    const image = await fetch(
      getGeneratedAssetStorage().publicUrl(outfit.downloadImagePath),
    );
    if (!image.ok)
      throw new DomainError(
        "DOWNLOAD_UNAVAILABLE",
        "The image is temporarily unavailable.",
        503,
      );
    return new Response(await image.arrayBuffer(), {
      headers: {
        "content-type": "image/png",
        "content-disposition": `attachment; filename="white-chorus-${outfit.shortCode}.png"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    return errorResponse(error, requestIdentifier, "outfit.download");
  }
}
