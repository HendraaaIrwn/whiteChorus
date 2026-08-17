import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

import { ensureShareImage } from "@/features/sharing/share-image";
import {
  storagePaths,
  type GeneratedAssetStorage,
} from "@/server/storage/generated-asset-storage";

function memoryStorage(files = new Map<string, Buffer>()) {
  const storage: GeneratedAssetStorage = {
    uploadOutfit: vi.fn(),
    read: vi.fn(async (path: string) => files.get(path) ?? null),
    upsert: vi.fn(async (path: string, body: Buffer) => {
      files.set(path, body);
    }),
    delete: vi.fn(),
    copy: vi.fn(),
    listOutfitIds: vi.fn(),
    publicUrl: vi.fn((path: string) => `https://assets.test/${path}`),
  };
  return { files, storage };
}

describe("ensureShareImage", () => {
  it("returns a cached framed image without reading the final image", async () => {
    const outfitId = "outfit-cached";
    const paths = storagePaths(outfitId);
    const cached = Buffer.from("cached-share");
    const { storage } = memoryStorage(
      new Map([[paths.shareImagePath, cached]]),
    );

    await expect(
      ensureShareImage(outfitId, paths.finalImagePath, storage),
    ).resolves.toBe(cached);
    expect(storage.read).toHaveBeenCalledTimes(1);
    expect(storage.upsert).not.toHaveBeenCalled();
  });

  it("creates and caches a missing legacy share image once", async () => {
    const outfitId = "outfit-legacy";
    const paths = storagePaths(outfitId);
    const finalImage = await sharp({
      create: {
        width: 120,
        height: 160,
        channels: 4,
        background: "#f0a080",
      },
    })
      .png()
      .toBuffer();
    const { files, storage } = memoryStorage(
      new Map([[paths.finalImagePath, finalImage]]),
    );

    const first = await ensureShareImage(
      outfitId,
      paths.finalImagePath,
      storage,
    );
    const second = await ensureShareImage(
      outfitId,
      paths.finalImagePath,
      storage,
    );

    expect(first.equals(second)).toBe(true);
    expect(files.get(paths.shareImagePath)?.equals(first)).toBe(true);
    expect(storage.upsert).toHaveBeenCalledTimes(1);
  });

  it("still returns a generated image when best-effort caching fails", async () => {
    const outfitId = "outfit-cache-failure";
    const paths = storagePaths(outfitId);
    const finalImage = await sharp({
      create: {
        width: 120,
        height: 160,
        channels: 4,
        background: "#80a0f0",
      },
    })
      .png()
      .toBuffer();
    const { storage } = memoryStorage(
      new Map([[paths.finalImagePath, finalImage]]),
    );
    vi.mocked(storage.upsert).mockRejectedValueOnce(new Error("storage down"));

    const result = await ensureShareImage(
      outfitId,
      paths.finalImagePath,
      storage,
    );
    await expect(sharp(result).metadata()).resolves.toMatchObject({
      width: 720,
      height: 1280,
      format: "png",
    });
  });

  it("returns a bounded unavailable error when the final image is missing", async () => {
    const { storage } = memoryStorage();

    await expect(
      ensureShareImage("outfit-missing", "missing/final.webp", storage),
    ).rejects.toMatchObject({ code: "SHARE_IMAGE_UNAVAILABLE", status: 503 });
  });
});
