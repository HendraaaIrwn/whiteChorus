import "server-only";

import { publicConfig } from "@/config/public-config";
import { getDailyWinnerSourceIds } from "@/features/daily-winners/daily-winner-lookup";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";
import { getGeneratedAssetStorage } from "@/server/storage/generated-asset-storage";
import type { OutfitDetailDTO } from "@/features/outfits/outfit.types";

export async function getOutfitDetail(
  id: string,
  viewerGuestId?: string,
): Promise<OutfitDetailDTO> {
  const outfit = await getPrisma().outfit.findUnique({
    where: { id },
  });
  if (!outfit)
    throw new DomainError(
      "OUTFIT_NOT_FOUND",
      "This look could not be found.",
      404,
    );
  if (
    outfit.status === "EXPIRED" ||
    (outfit.expiresAt && outfit.expiresAt <= new Date())
  )
    throw new DomainError(
      "OUTFIT_EXPIRED",
      "This look has completed its seven-day Hall of Fame run.",
      410,
    );
  if (
    outfit.status !== "PUBLISHED" ||
    !outfit.publishedAt ||
    !outfit.expiresAt ||
    !outfit.thumbnailPath ||
    !outfit.finalImagePath ||
    !outfit.downloadImagePath ||
    !outfit.socialImagePath
  ) {
    throw new DomainError(
      "OUTFIT_NOT_FOUND",
      "This look could not be found.",
      404,
    );
  }
  const storage = getGeneratedAssetStorage();
  const productionMode = publicConfig.assetMode === "production";
  const dailyWinnerIds = await getDailyWinnerSourceIds([outfit.id]);
  const isOwner = Boolean(viewerGuestId && viewerGuestId === outfit.guestId);
  const viewerRating = viewerGuestId
    ? await getPrisma().rating.findUnique({
        where: {
          outfitId_guestId: { outfitId: outfit.id, guestId: viewerGuestId },
        },
        select: { value: true },
      })
    : null;
  return {
    id: outfit.id,
    shortCode: outfit.shortCode,
    thumbnailUrl: productionMode ? storage.publicUrl(outfit.thumbnailPath) : "",
    finalImageUrl: productionMode
      ? storage.publicUrl(outfit.finalImagePath)
      : "",
    socialImageUrl: productionMode
      ? storage.publicUrl(outfit.socialImagePath)
      : "",
    downloadUrl: `/api/outfits/${outfit.id}/download`,
    ratingAverage: Number(outfit.ratingAverage),
    ratingCount: outfit.ratingCount,
    publishedAt: outfit.publishedAt.toISOString(),
    expiresAt: outfit.expiresAt.toISOString(),
    remainingDays: Math.max(
      0,
      Math.ceil((outfit.expiresAt.getTime() - Date.now()) / 86_400_000),
    ),
    isDailyWinner: dailyWinnerIds.has(outfit.id),
    isOwner,
    canRate: !isOwner,
    viewerRating: viewerRating?.value ?? null,
  };
}
