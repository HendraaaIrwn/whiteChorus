import type { TurnstileVerifier } from "@/features/abuse-protection/turnstile";
import type {
  OutfitRenderer,
  RenderedOutfitBundle,
} from "@/server/rendering/outfit-renderer";
import {
  storagePaths,
  type GeneratedAssetStorage,
} from "@/server/storage/generated-asset-storage";
import type { Clock } from "@/server/time/clock";

export const deterministicOutfitRenderer: OutfitRenderer = {
  async render() {
    return {
      finalWebp: Buffer.from("final-webp"),
      downloadPng: Buffer.from("download-png"),
      thumbnailWebp: Buffer.from("thumbnail-webp"),
      socialJpeg: Buffer.from("social-jpeg"),
    };
  },
};

export function createMemoryGeneratedAssetStorage(): GeneratedAssetStorage & {
  files: Map<string, Buffer>;
} {
  const files = new Map<string, Buffer>();
  return {
    files,
    async uploadOutfit(outfitId: string, bundle: RenderedOutfitBundle) {
      const paths = storagePaths(outfitId);
      files.set(paths.finalImagePath, bundle.finalWebp);
      files.set(paths.downloadImagePath, bundle.downloadPng);
      files.set(paths.thumbnailPath, bundle.thumbnailWebp);
      files.set(paths.socialImagePath, bundle.socialJpeg);
      return paths;
    },
    async delete(paths) {
      paths.forEach((path) => files.delete(path));
    },
    async copy(from, to) {
      const source = files.get(from);
      if (!source) throw new Error("TEST_STORAGE_SOURCE_NOT_FOUND");
      files.set(to, source);
    },
    async listOutfitIds() {
      return [
        ...new Set(
          [...files.keys()]
            .filter((path) => path.startsWith("outfits/"))
            .map((path) => path.split("/")[1]!),
        ),
      ];
    },
    publicUrl(path) {
      return `https://storage.test/${path}`;
    },
  };
}

export function fixedClock(now: Date): Clock {
  return { now: () => new Date(now) };
}

export const passingTurnstileVerifier: TurnstileVerifier = {
  async verify() {},
};
