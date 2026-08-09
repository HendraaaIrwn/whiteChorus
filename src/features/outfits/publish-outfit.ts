import "server-only";

import { randomBytes } from "node:crypto";
import { TZDate } from "@date-fns/tz";
import { z } from "zod";

import { getServerEnv } from "@/config/env";
import {
  cloudflareTurnstileVerifier,
  type TurnstileVerifier,
} from "@/features/abuse-protection/turnstile";
import { validateCatalogConfiguration } from "@/features/dress-up/catalog";
import {
  dressUpConfigurationSchema,
  isPublishReady,
  normalizeConfiguration,
  type DressUpConfiguration,
} from "@/features/dress-up/model";
import { configurationHash } from "@/features/outfits/configuration-hash";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";
import {
  sharpOutfitRenderer,
  type OutfitRenderer,
} from "@/server/rendering/outfit-renderer";
import {
  getGeneratedAssetStorage,
  type GeneratedAssetStorage,
} from "@/server/storage/generated-asset-storage";
import { systemClock, type Clock } from "@/server/time/clock";

export const publishOutfitSchema = dressUpConfigurationSchema
  .extend({ turnstileToken: z.string().nullable().optional() })
  .strict();
export type PublishOutfitInput = z.infer<typeof publishOutfitSchema>;

type Dependencies = {
  renderer: OutfitRenderer;
  storage: GeneratedAssetStorage;
  clock: Clock;
  turnstileVerifier: TurnstileVerifier;
};

function shortCode(): string {
  return randomBytes(5).toString("hex").slice(0, 8).toUpperCase();
}

function startOfDay(now: Date, timezone: string): Date {
  const zoned = new TZDate(now, timezone);
  return new TZDate(
    zoned.getFullYear(),
    zoned.getMonth(),
    zoned.getDate(),
    timezone,
  );
}

async function createProcessing(
  guestId: string,
  configuration: DressUpConfiguration,
  now: Date,
) {
  const env = getServerEnv();
  const hash = configurationHash(configuration);
  return getPrisma().$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${guestId}))`;
    const [duplicate, activeProcess, cooldown, hourlyCount, dailyCount] =
      await Promise.all([
        tx.outfit.findFirst({
          where: {
            guestId,
            configurationHash: hash,
            status: { in: ["PROCESSING", "PUBLISHED"] },
            createdAt: {
              gte: new Date(
                now.getTime() - env.DUPLICATE_WINDOW_HOURS * 3600_000,
              ),
            },
          },
          select: { id: true },
        }),
        tx.outfit.findFirst({
          where: {
            guestId,
            status: "PROCESSING",
            createdAt: {
              gte: new Date(
                now.getTime() - env.STUCK_PROCESSING_MINUTES * 60_000,
              ),
            },
          },
          select: { id: true },
        }),
        tx.outfit.findFirst({
          where: {
            guestId,
            createdAt: {
              gte: new Date(
                now.getTime() - env.PUBLISH_COOLDOWN_SECONDS * 1000,
              ),
            },
          },
          select: { id: true },
        }),
        tx.outfit.count({
          where: {
            guestId,
            status: "PUBLISHED",
            publishedAt: { gte: new Date(now.getTime() - 3600_000) },
          },
        }),
        tx.outfit.count({
          where: {
            guestId,
            status: "PUBLISHED",
            publishedAt: { gte: startOfDay(now, env.DAILY_TIMEZONE) },
          },
        }),
      ]);
    if (duplicate)
      throw new DomainError(
        "DUPLICATE_SUBMISSION",
        "You already published this exact look. Change an item and try again.",
        409,
      );
    if (activeProcess)
      throw new DomainError(
        "PUBLISH_ALREADY_PROCESSING",
        "Your previous look is still being created.",
        409,
      );
    if (cooldown)
      throw new DomainError(
        "PUBLISH_COOLDOWN",
        "Please wait a few seconds before publishing another look.",
        429,
      );
    if (
      hourlyCount >= env.PUBLISH_LIMIT_PER_HOUR ||
      dailyCount >= env.PUBLISH_LIMIT_PER_DAY
    )
      throw new DomainError(
        "PUBLISH_RATE_LIMITED",
        "You have reached the publishing limit for now.",
        429,
      );
    return tx.outfit.create({
      data: {
        guestId,
        shortCode: shortCode(),
        backgroundId: configuration.backgroundId,
        characterAConfig: configuration.characterA,
        characterBConfig: configuration.characterB,
        configurationHash: hash,
      },
    });
  });
}

export async function publishOutfit(
  guestId: string,
  input: PublishOutfitInput,
  suppliedDependencies?: Dependencies,
) {
  const dependencies = suppliedDependencies ?? {
    renderer: sharpOutfitRenderer,
    storage: getGeneratedAssetStorage(),
    clock: systemClock,
    turnstileVerifier: cloudflareTurnstileVerifier,
  };
  const configuration = normalizeConfiguration(input);
  if (
    !isPublishReady(configuration) ||
    validateCatalogConfiguration(configuration).length
  ) {
    throw new DomainError(
      "INVALID_CONFIGURATION",
      "This look could not be published because one or more items are no longer available.",
      400,
    );
  }
  const env = getServerEnv();
  if (env.TURNSTILE_MODE === "always")
    await dependencies.turnstileVerifier.verify(input.turnstileToken ?? null);
  if (env.TURNSTILE_MODE === "adaptive") {
    const recent = await getPrisma().outfit.count({
      where: {
        guestId,
        createdAt: {
          gte: new Date(dependencies.clock.now().getTime() - 3600_000),
        },
      },
    });
    if (recent >= Math.max(2, env.PUBLISH_LIMIT_PER_HOUR - 1))
      await dependencies.turnstileVerifier.verify(input.turnstileToken ?? null);
  }
  const processing = await createProcessing(
    guestId,
    configuration,
    dependencies.clock.now(),
  );
  let paths:
    Awaited<ReturnType<GeneratedAssetStorage["uploadOutfit"]>> | undefined;
  let failureReason = "RENDER_FAILED";
  try {
    const bundle = await dependencies.renderer.render(configuration);
    failureReason = "STORAGE_UPLOAD_FAILED";
    paths = await dependencies.storage.uploadOutfit(processing.id, bundle);
    failureReason = "FINALIZE_FAILED";
    const publishedAt = dependencies.clock.now();
    const outfit = await getPrisma().outfit.update({
      where: { id: processing.id },
      data: {
        ...paths,
        status: "PUBLISHED",
        publishedAt,
        expiresAt: new Date(
          publishedAt.getTime() +
            getServerEnv().SUBMISSION_RETENTION_DAYS * 86_400_000,
        ),
        failureReason: null,
      },
    });
    return {
      id: outfit.id,
      shortCode: outfit.shortCode,
      status: outfit.status,
      url: `/outfits/${outfit.id}`,
      publishedAt: outfit.publishedAt!.toISOString(),
      expiresAt: outfit.expiresAt!.toISOString(),
    };
  } catch (error) {
    if (paths)
      await dependencies.storage
        .delete(Object.values(paths))
        .catch(() => undefined);
    await getPrisma()
      .outfit.update({
        where: { id: processing.id },
        data: {
          status: "FAILED",
          failureReason,
        },
      })
      .catch(() => undefined);
    if (error instanceof DomainError) throw error;
    throw new DomainError(
      "RENDER_FAILED",
      "We could not create your final image. Your publication limit was not used. Please try again.",
      503,
    );
  }
}
