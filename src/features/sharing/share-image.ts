import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { publicConfig } from "@/config/public-config";
import { productionAssets } from "@/features/dress-up/catalog";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";
import { composeShareImage } from "@/server/rendering/share-image-renderer";
import {
  getGeneratedAssetStorage,
  storagePaths,
  type GeneratedAssetStorage,
} from "@/server/storage/generated-asset-storage";

function publicFile(urlPath: string): string {
  return path.join(process.cwd(), "public", urlPath.replace(/^\//, ""));
}

export async function ensureShareImage(
  outfitId: string,
  finalImagePath: string,
  storage: GeneratedAssetStorage,
): Promise<Buffer> {
  const shareImagePath = storagePaths(outfitId).shareImagePath;
  const cached = await storage.read(shareImagePath);
  if (cached) return cached;

  const finalImage = await storage.read(finalImagePath);
  if (!finalImage)
    throw new DomainError(
      "SHARE_IMAGE_UNAVAILABLE",
      "The framed image is temporarily unavailable.",
      503,
    );

  const shareImage = await composeShareImage(finalImage);
  await storage
    .upsert(shareImagePath, shareImage, "image/png")
    .catch(() => undefined);
  return shareImage;
}

export async function getShareImage(
  outfitId: string,
  storage: GeneratedAssetStorage = getGeneratedAssetStorage(),
) {
  const outfit = await getPrisma().outfit.findUnique({
    where: { id: outfitId },
    select: {
      id: true,
      shortCode: true,
      status: true,
      expiresAt: true,
      finalImagePath: true,
    },
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
    !outfit.expiresAt ||
    !outfit.finalImagePath
  )
    throw new DomainError(
      "OUTFIT_NOT_FOUND",
      "This look could not be found.",
      404,
    );

  try {
    const image =
      publicConfig.assetMode === "production"
        ? await ensureShareImage(outfit.id, outfit.finalImagePath, storage)
        : await readFile(publicFile(productionAssets.defaultSharePath));
    return {
      image,
      shortCode: outfit.shortCode,
      expiresAt: outfit.expiresAt,
    };
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError(
      "SHARE_IMAGE_UNAVAILABLE",
      "The framed image is temporarily unavailable.",
      503,
    );
  }
}
