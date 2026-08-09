import { createHash, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { getServerEnv } from "@/config/env";
import { consumeRateLimit } from "@/features/abuse-protection/rate-limit";
import { upsertRating } from "@/features/ratings/upsert-rating";
import { getCompletedDayPeriod } from "@/features/daily-winners/day-period";
import { selectDailyWinner } from "@/features/daily-winners/daily-winners";
import { getPrisma } from "@/server/database/prisma";
import { hmacHex } from "@/server/security/crypto";
import { createMemoryGeneratedAssetStorage } from "../support/test-adapters";

const runDatabaseTests = process.env.RUN_DATABASE_TESTS === "1";
const prisma = runDatabaseTests ? getPrisma() : null;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

describe.skipIf(!runDatabaseTests)("PostgreSQL concurrency", () => {
  it("increments one rate-limit counter without lost writes", async () => {
    const scope = `integration:${randomUUID()}`;
    const now = new Date("2026-08-02T00:00:00.000Z");
    await Promise.all(
      Array.from({ length: 20 }, () =>
        consumeRateLimit({
          scope,
          action: "INTERACTION_WRITE_HOURLY",
          windowSeconds: 3600,
          limit: 50,
          now,
        }),
      ),
    );
    const keyHash = hmacHex(getServerEnv().RATE_LIMIT_SECRET, scope);
    const counter = await prisma!.rateLimitCounter.findUnique({
      where: {
        keyHash_action: { keyHash, action: "INTERACTION_WRITE_HOURLY" },
      },
    });
    expect(counter?.count).toBe(20);
    await prisma!.rateLimitCounter.delete({
      where: {
        keyHash_action: { keyHash, action: "INTERACTION_WRITE_HOURLY" },
      },
    });
  });

  it("keeps rating rows and aggregates exact under concurrent writes", async () => {
    const guests = await Promise.all(
      Array.from({ length: 11 }, (_, index) =>
        prisma!.guest.create({
          data: {
            sessionTokenHash: hash(`${randomUUID()}:${index}`),
            expiresAt: new Date(Date.now() + 86_400_000),
          },
        }),
      ),
    );
    const code =
      `IT${randomUUID().replaceAll("-", "").slice(0, 8)}`.toUpperCase();
    const outfit = await prisma!.outfit.create({
      data: {
        guestId: guests[0]!.id,
        shortCode: code,
        backgroundId: "background-01",
        characterAConfig: {},
        characterBConfig: {},
        configurationHash: hash(code),
        finalImagePath: `integration/${code}/final.webp`,
        downloadImagePath: `integration/${code}/download.png`,
        thumbnailPath: `integration/${code}/thumbnail.webp`,
        socialImagePath: `integration/${code}/social.jpg`,
        status: "PUBLISHED",
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    });
    try {
      const values = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5];
      await Promise.all(
        values.map((value, index) =>
          upsertRating(outfit.id, guests[index + 1]!.id, value),
        ),
      );
      await upsertRating(outfit.id, guests[1]!.id, 5);
      const [stored, ratingCount] = await Promise.all([
        prisma!.outfit.findUniqueOrThrow({ where: { id: outfit.id } }),
        prisma!.rating.count({ where: { outfitId: outfit.id } }),
      ]);
      expect(ratingCount).toBe(10);
      expect(stored.ratingCount).toBe(10);
      expect(Number(stored.ratingAverage)).toBe(3.4);
    } finally {
      await prisma!.outfit.delete({ where: { id: outfit.id } });
      await prisma!.guest.deleteMany({
        where: { id: { in: guests.map((guest) => guest.id) } },
      });
      await prisma!.rateLimitCounter.deleteMany({
        where: { action: "RATING_WRITE_HOURLY" },
      });
    }
  });

  it("snapshots the completed daily period idempotently", async () => {
    const now = new Date();
    const period = getCompletedDayPeriod(now);
    const owner = await prisma!.guest.create({
      data: {
        sessionTokenHash: hash(randomUUID()),
        expiresAt: new Date(now.getTime() + 86_400_000),
      },
    });
    const code =
      `IW${randomUUID().replaceAll("-", "").slice(0, 8)}`.toUpperCase();
    const publishedAt = new Date(period.end.getTime() - 1);
    const finalImagePath = `outfits/${randomUUID()}/final.webp`;
    const socialImagePath = finalImagePath.replace("final.webp", "social.jpg");
    const outfit = await prisma!.outfit.create({
      data: {
        guestId: owner.id,
        shortCode: code,
        backgroundId: "background-01",
        characterAConfig: {},
        characterBConfig: {},
        configurationHash: hash(code),
        finalImagePath,
        downloadImagePath: finalImagePath.replace("final.webp", "download.png"),
        thumbnailPath: finalImagePath.replace("final.webp", "thumbnail.webp"),
        socialImagePath,
        status: "PUBLISHED",
        ratingAverage: 4.6,
        ratingCount: 5,
        publishedAt,
        expiresAt: new Date(publishedAt.getTime() + 7 * 86_400_000),
      },
    });
    const storage = createMemoryGeneratedAssetStorage();
    storage.files.set(finalImagePath, Buffer.from("winner"));
    storage.files.set(socialImagePath, Buffer.from("social"));
    try {
      const first = await selectDailyWinner(now, storage);
      const second = await selectDailyWinner(now, storage);
      expect(first.status).toBe("selected");
      expect(second.status).toBe("already-selected");
      const winner = await prisma!.dailyWinner.findUniqueOrThrow({
        where: { dayKey: period.key },
      });
      expect(winner.sourceOutfitId).toBe(outfit.id);
      expect(storage.files.has(winner.winnerImagePath)).toBe(true);
    } finally {
      await prisma!.dailyWinner.deleteMany({ where: { dayKey: period.key } });
      await prisma!.outfit.delete({ where: { id: outfit.id } });
      await prisma!.guest.delete({ where: { id: owner.id } });
    }
  });
});
