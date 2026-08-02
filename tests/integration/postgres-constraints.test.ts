import { createHash, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { getPrisma } from "@/server/database/prisma";

const runDatabaseTests = process.env.RUN_DATABASE_TESTS === "1";
const prisma = runDatabaseTests ? getPrisma() : null;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

describe.skipIf(!runDatabaseTests)("PostgreSQL constraints", () => {
  it("rejects visible outfits without artifacts and ratings outside 1-5", async () => {
    const owner = await prisma!.guest.create({
      data: {
        sessionTokenHash: hash(randomUUID()),
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    });
    const rater = await prisma!.guest.create({
      data: {
        sessionTokenHash: hash(randomUUID()),
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    });
    const code =
      `IC${randomUUID().replaceAll("-", "").slice(0, 8)}`.toUpperCase();
    try {
      await expect(
        prisma!.outfit.create({
          data: {
            guestId: owner.id,
            shortCode: code,
            backgroundId: "background-01",
            characterAConfig: {},
            characterBConfig: {},
            configurationHash: hash(code),
            status: "PUBLISHED",
            publishedAt: new Date(),
            expiresAt: new Date(Date.now() + 86_400_000),
          },
        }),
      ).rejects.toBeTruthy();

      const outfit = await prisma!.outfit.create({
        data: {
          guestId: owner.id,
          shortCode: code,
          backgroundId: "background-01",
          characterAConfig: {},
          characterBConfig: {},
          configurationHash: hash(code),
        },
      });
      await expect(
        prisma!.rating.create({
          data: { outfitId: outfit.id, guestId: rater.id, value: 6 },
        }),
      ).rejects.toBeTruthy();
    } finally {
      await prisma!.guest.deleteMany({
        where: { id: { in: [owner.id, rater.id] } },
      });
    }
  });
});
