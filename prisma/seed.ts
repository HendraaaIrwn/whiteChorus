import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { getDayPeriod } from "../src/features/daily-winners/day-period";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for seed");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    const outfitCount = Number(process.env.SEED_OUTFIT_COUNT ?? 100);
    if (!Number.isInteger(outfitCount) || outfitCount < 1 || outfitCount > 500)
      throw new Error("SEED_OUTFIT_COUNT must be an integer from 1 to 500");

    const guest = await prisma.guest.upsert({
      where: { sessionTokenHash: "0".repeat(64) },
      update: {},
      create: {
        sessionTokenHash: "0".repeat(64),
        expiresAt: new Date(Date.now() + 14 * 86_400_000),
      },
    });
    for (let index = 1; index <= outfitCount; index += 1) {
      const id = String(index).padStart(2, "0");
      const publishedAt = new Date(Date.now() - index * 600_000);
      await prisma.outfit.upsert({
        where: { shortCode: `DEMO${id}` },
        update: {},
        create: {
          guestId: guest.id,
          shortCode: `DEMO${id}`,
          backgroundId: `background-${String((index % 5) + 1).padStart(2, "0")}`,
          characterAConfig: {
            hairId: "a-hair-01",
            topId: "a-top-01",
            bottomId: "a-bottom-01",
            onePieceId: null,
            shoesId: "a-shoes-01",
            accessoryIds: [],
          },
          characterBConfig: {
            hairId: "b-hair-01",
            topId: "b-top-01",
            bottomId: "b-bottom-01",
            onePieceId: null,
            shoesId: "b-shoes-01",
            accessoryIds: [],
          },
          configurationHash: String(index).padStart(64, "0"),
          finalImagePath: `fixtures/demo-${id}.webp`,
          downloadImagePath: `fixtures/demo-${id}.png`,
          thumbnailPath: `fixtures/demo-${id}-thumb.webp`,
          socialImagePath: `fixtures/demo-${id}-social.jpg`,
          status: "PUBLISHED",
          publishedAt,
          expiresAt: new Date(publishedAt.getTime() + 7 * 86_400_000),
        },
      });
    }

    const featured = await prisma.outfit.findUniqueOrThrow({
      where: { shortCode: "DEMO01" },
    });
    for (let value = 1; value <= 5; value += 1) {
      const ratingGuest = await prisma.guest.upsert({
        where: { sessionTokenHash: String(value).repeat(64) },
        update: {},
        create: {
          sessionTokenHash: String(value).repeat(64),
          expiresAt: new Date(Date.now() + 14 * 86_400_000),
        },
      });
      await prisma.rating.upsert({
        where: {
          outfitId_guestId: { outfitId: featured.id, guestId: ratingGuest.id },
        },
        update: { value },
        create: { outfitId: featured.id, guestId: ratingGuest.id, value },
      });
    }
    await prisma.outfit.update({
      where: { id: featured.id },
      data: { ratingAverage: 3, ratingCount: 5, weightedScore: 3 },
    });
    const period = getDayPeriod(new Date());
    await prisma.dailyWinner.upsert({
      where: { sourceOutfitId: featured.id },
      update: {
        dayKey: period.key,
        dayStart: period.start,
        dayEnd: period.end,
      },
      create: {
        sourceOutfitId: featured.id,
        dayKey: period.key,
        dayStart: period.start,
        dayEnd: period.end,
        shortCode: featured.shortCode,
        winnerImagePath: featured.finalImagePath!,
        socialImagePath: featured.socialImagePath,
        finalAverage: 3,
        finalRatingCount: 5,
        finalWeightedScore: 3,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

void main();
