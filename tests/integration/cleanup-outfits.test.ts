import { createHash, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { cleanupOutfits } from "@/features/outfits/cleanup-outfits";
import { getOutfitDetail } from "@/features/outfits/get-outfit-detail";
import { getPrisma } from "@/server/database/prisma";
import { storagePaths } from "@/server/storage/generated-asset-storage";
import { createMemoryGeneratedAssetStorage } from "../support/test-adapters";

const runDatabaseTests = process.env.RUN_DATABASE_TESTS === "1";
const prisma = runDatabaseTests ? getPrisma() : null;

describe.skipIf(!runDatabaseTests)("cleanupOutfits", () => {
  it("deletes files, retains a 410 tombstone, then cascades the row", async () => {
    const now = new Date();
    const guest = await prisma!.guest.create({
      data: {
        sessionTokenHash: createHash("sha256")
          .update(randomUUID())
          .digest("hex"),
        expiresAt: new Date(now.getTime() + 86_400_000),
      },
    });
    const outfitId = randomUUID();
    const paths = storagePaths(outfitId);
    // shareImagePath is storage-only (derived from outfitId on demand); the
    // outfits table has no column for it, so persist just the four DB paths.
    const dbPaths = {
      finalImagePath: paths.finalImagePath,
      downloadImagePath: paths.downloadImagePath,
      thumbnailPath: paths.thumbnailPath,
      socialImagePath: paths.socialImagePath,
    };
    const outfit = await prisma!.outfit.create({
      data: {
        id: outfitId,
        guestId: guest.id,
        shortCode:
          `IE${outfitId.replaceAll("-", "").slice(0, 8)}`.toUpperCase(),
        backgroundId: "background-01",
        characterAConfig: {},
        characterBConfig: {},
        configurationHash: createHash("sha256").update(outfitId).digest("hex"),
        ...dbPaths,
        status: "PUBLISHED",
        publishedAt: new Date(now.getTime() - 2 * 86_400_000),
        expiresAt: new Date(now.getTime() - 3_600_000),
      },
    });
    const storage = createMemoryGeneratedAssetStorage();
    Object.values(paths).forEach((path) =>
      storage.files.set(path, Buffer.from(path)),
    );
    try {
      const first = await cleanupOutfits(now, storage);
      expect(first.filesDeleted).toBe(5);
      expect(storage.files.size).toBe(0);
      await expect(getOutfitDetail(outfit.id)).rejects.toMatchObject({
        code: "OUTFIT_EXPIRED",
        status: 410,
      });
      expect(
        (await prisma!.outfit.findUniqueOrThrow({ where: { id: outfit.id } }))
          .status,
      ).toBe("EXPIRED");

      await cleanupOutfits(new Date(now.getTime() + 25 * 3_600_000), storage);
      expect(
        await prisma!.outfit.findUnique({ where: { id: outfit.id } }),
      ).toBeNull();
    } finally {
      await prisma!.outfit.deleteMany({ where: { id: outfit.id } });
      await prisma!.guest.deleteMany({ where: { id: guest.id } });
    }
  });
});
