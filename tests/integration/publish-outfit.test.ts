import { createHash, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { defaultConfiguration } from "@/features/dress-up/model";
import { publishOutfit } from "@/features/outfits/publish-outfit";
import { getPrisma } from "@/server/database/prisma";
import {
  createMemoryGeneratedAssetStorage,
  deterministicOutfitRenderer,
  fixedClock,
  passingTurnstileVerifier,
} from "../support/test-adapters";

const runDatabaseTests = process.env.RUN_DATABASE_TESTS === "1";
const prisma = runDatabaseTests ? getPrisma() : null;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

describe.skipIf(!runDatabaseTests)("publishOutfit", () => {
  it("publishes four artifacts, rejects duplicates, and leaves failures private", async () => {
    const now = new Date();
    const guests = await Promise.all(
      ["success", "failure"].map((label) =>
        prisma!.guest.create({
          data: {
            sessionTokenHash: hash(`${label}:${randomUUID()}`),
            expiresAt: new Date(now.getTime() + 86_400_000),
          },
        }),
      ),
    );
    const storage = createMemoryGeneratedAssetStorage();
    const dependencies = {
      renderer: deterministicOutfitRenderer,
      storage,
      clock: fixedClock(now),
      turnstileVerifier: passingTurnstileVerifier,
    };
    try {
      const published = await publishOutfit(
        guests[0]!.id,
        defaultConfiguration,
        dependencies,
      );
      expect(published.status).toBe("PUBLISHED");
      expect(published.shortCode).toMatch(/^[A-Z0-9]{4,12}$/);
      expect(storage.files.size).toBe(4);
      await expect(
        publishOutfit(guests[0]!.id, defaultConfiguration, dependencies),
      ).rejects.toMatchObject({ code: "DUPLICATE_SUBMISSION" });

      await expect(
        publishOutfit(guests[1]!.id, defaultConfiguration, {
          ...dependencies,
          renderer: { render: async () => Promise.reject(new Error("boom")) },
        }),
      ).rejects.toMatchObject({ code: "RENDER_FAILED" });
      const failed = await prisma!.outfit.findFirstOrThrow({
        where: { guestId: guests[1]!.id },
      });
      expect(failed.status).toBe("FAILED");
      expect(failed.finalImagePath).toBeNull();
      expect(storage.files.size).toBe(4);
    } finally {
      await prisma!.outfit.deleteMany({
        where: { guestId: { in: guests.map((guest) => guest.id) } },
      });
      await prisma!.guest.deleteMany({
        where: { id: { in: guests.map((guest) => guest.id) } },
      });
    }
  });
});
