import "server-only";

import { getServerEnv } from "@/config/env";
import { getPrisma } from "@/server/database/prisma";
import {
  getGeneratedAssetStorage,
  storagePaths,
  type GeneratedAssetStorage,
} from "@/server/storage/generated-asset-storage";

export async function cleanupOutfits(
  now = new Date(),
  storage: GeneratedAssetStorage = getGeneratedAssetStorage(),
) {
  const env = getServerEnv();
  const expired = await getPrisma().outfit.findMany({
    where: { status: { in: ["PUBLISHED", "HIDDEN"] }, expiresAt: { lte: now } },
    take: 100,
    select: {
      id: true,
      finalImagePath: true,
      downloadImagePath: true,
      thumbnailPath: true,
      socialImagePath: true,
    },
  });
  let filesDeleted = 0;
  let failedDeletes = 0;
  for (const outfit of expired) {
    const paths = [
      outfit.finalImagePath,
      outfit.downloadImagePath,
      outfit.thumbnailPath,
      outfit.socialImagePath,
    ].filter(Boolean) as string[];
    try {
      await storage.delete(paths);
      filesDeleted += paths.length;
      await getPrisma().outfit.update({
        where: { id: outfit.id },
        data: { status: "EXPIRED" },
      });
    } catch {
      failedDeletes += 1;
    }
  }
  const tombstoneBefore = new Date(
    now.getTime() - env.EXPIRED_TOMBSTONE_HOURS * 3600_000,
  );
  const hardDeleted = await getPrisma().outfit.deleteMany({
    where: { status: "EXPIRED", expiresAt: { lte: tombstoneBefore } },
  });
  const stuckBefore = new Date(
    now.getTime() - env.STUCK_PROCESSING_MINUTES * 60_000,
  );
  const stuck = await getPrisma().outfit.updateMany({
    where: { status: "PROCESSING", createdAt: { lte: stuckBefore } },
    data: { status: "FAILED", failureReason: "PROCESSING_TIMEOUT" },
  });
  const failedBefore = new Date(
    now.getTime() - env.FAILED_OUTFIT_RETENTION_DAYS * 86_400_000,
  );
  const failed = await getPrisma().outfit.deleteMany({
    where: { status: "FAILED", createdAt: { lte: failedBefore } },
  });
  const counters = await getPrisma().rateLimitCounter.deleteMany({
    where: { windowEndsAt: { lt: new Date(now.getTime() - 86_400_000) } },
  });
  const guests = await getPrisma().guest.deleteMany({
    where: {
      lastSeenAt: {
        lt: new Date(now.getTime() - env.GUEST_RETENTION_DAYS * 86_400_000),
      },
      outfits: { none: {} },
      ratings: { none: {} },
      interactions: { none: {} },
    },
  });
  let orphanFoldersDeleted = 0;
  let orphanDeleteFailures = 0;
  try {
    const storedIds = await storage.listOutfitIds();
    const existing = await getPrisma().outfit.findMany({
      where: { id: { in: storedIds } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((outfit) => outfit.id));
    for (const outfitId of storedIds.filter((id) => !existingIds.has(id))) {
      try {
        await storage.delete(Object.values(storagePaths(outfitId)));
        orphanFoldersDeleted += 1;
      } catch {
        orphanDeleteFailures += 1;
      }
    }
  } catch {
    orphanDeleteFailures += 1;
  }
  return {
    expiredFound: expired.length,
    filesDeleted,
    failedDeletes,
    recordsDeleted: hardDeleted.count,
    stuckMarkedFailed: stuck.count,
    failedRecordsDeleted: failed.count,
    countersDeleted: counters.count,
    guestsDeleted: guests.count,
    orphanFoldersDeleted,
    orphanDeleteFailures,
  };
}
