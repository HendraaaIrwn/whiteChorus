import { createHash, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { recordInteraction } from "@/features/sharing/record-interaction";
import { getPrisma } from "@/server/database/prisma";

const runDatabaseTests = process.env.RUN_DATABASE_TESTS === "1";
const prisma = runDatabaseTests ? getPrisma() : null;

describe.skipIf(!runDatabaseTests)("share interaction tracking", () => {
  it("records one Instagram interaction while retaining historical Telegram rows", async () => {
    const now = new Date();
    const guest = await prisma!.guest.create({
      data: {
        sessionTokenHash: createHash("sha256")
          .update(randomUUID())
          .digest("hex"),
        expiresAt: new Date(now.getTime() + 86_400_000),
      },
    });
    const outfit = await prisma!.outfit.create({
      data: {
        guestId: guest.id,
        shortCode:
          `SI${randomUUID().replaceAll("-", "").slice(0, 8)}`.toUpperCase(),
        backgroundId: "background-01",
        characterAConfig: {},
        characterBConfig: {},
        configurationHash: createHash("sha256")
          .update(randomUUID())
          .digest("hex"),
        finalImagePath: `outfits/${randomUUID()}/final.webp`,
        downloadImagePath: `outfits/${randomUUID()}/download.png`,
        thumbnailPath: `outfits/${randomUUID()}/thumbnail.webp`,
        socialImagePath: `outfits/${randomUUID()}/social.jpg`,
        status: "PUBLISHED",
        publishedAt: now,
        expiresAt: new Date(now.getTime() + 86_400_000),
      },
    });

    try {
      await recordInteraction(outfit.id, guest.id, "instagram");
      await prisma!.outfitInteraction.create({
        data: { outfitId: outfit.id, guestId: guest.id, type: "TELEGRAM" },
      });

      const interactions = await prisma!.outfitInteraction.findMany({
        where: { outfitId: outfit.id },
        orderBy: { createdAt: "asc" },
        select: { type: true },
      });
      expect(interactions).toEqual([
        { type: "INSTAGRAM" },
        { type: "TELEGRAM" },
      ]);
      expect(interactions).not.toContainEqual({ type: "NATIVE_SHARE" });
    } finally {
      await prisma!.outfit.delete({ where: { id: outfit.id } });
      await prisma!.guest.delete({ where: { id: guest.id } });
    }
  });
});
