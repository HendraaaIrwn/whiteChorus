import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/config/env";
import type { RenderedOutfitBundle } from "@/server/rendering/outfit-renderer";

export type OutfitStoragePaths = {
  finalImagePath: string;
  downloadImagePath: string;
  thumbnailPath: string;
  socialImagePath: string;
  shareImagePath: string;
};

export interface GeneratedAssetStorage {
  uploadOutfit(
    outfitId: string,
    bundle: RenderedOutfitBundle,
  ): Promise<OutfitStoragePaths>;
  read(path: string): Promise<Buffer | null>;
  upsert(path: string, body: Buffer, contentType: string): Promise<void>;
  delete(paths: string[]): Promise<void>;
  copy(from: string, to: string): Promise<void>;
  listOutfitIds(): Promise<string[]>;
  publicUrl(path: string): string;
}

export function storagePaths(outfitId: string): OutfitStoragePaths {
  const base = `outfits/${outfitId}`;
  return {
    finalImagePath: `${base}/final.webp`,
    downloadImagePath: `${base}/download.png`,
    thumbnailPath: `${base}/thumbnail.webp`,
    socialImagePath: `${base}/social.jpg`,
    shareImagePath: `${base}/share.png`,
  };
}

function isMissingObject(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: number; statusCode?: string };
  return candidate.status === 404 || candidate.statusCode === "404";
}

let cached: GeneratedAssetStorage | undefined;

export function getGeneratedAssetStorage(): GeneratedAssetStorage {
  if (cached) return cached;
  const env = getServerEnv();
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const bucket = client.storage.from(env.SUPABASE_STORAGE_BUCKET);
  cached = {
    async uploadOutfit(outfitId, bundle) {
      const paths = storagePaths(outfitId);
      const uploads = [
        [paths.finalImagePath, bundle.finalWebp, "image/webp"],
        [paths.downloadImagePath, bundle.downloadPng, "image/png"],
        [paths.thumbnailPath, bundle.thumbnailWebp, "image/webp"],
        [paths.socialImagePath, bundle.socialJpeg, "image/jpeg"],
        [paths.shareImagePath, bundle.sharePng, "image/png"],
      ] as const;
      const uploaded: string[] = [];
      try {
        for (const [path, body, contentType] of uploads) {
          const { error } = await bucket.upload(path, body, {
            contentType,
            upsert: true,
          });
          if (error) throw error;
          uploaded.push(path);
        }
        return paths;
      } catch (error) {
        if (uploaded.length) await bucket.remove(uploaded);
        throw error;
      }
    },
    async read(path) {
      const { data, error } = await bucket.download(path);
      if (error) {
        if (isMissingObject(error)) return null;
        throw error;
      }
      return Buffer.from(await data.arrayBuffer());
    },
    async upsert(path, body, contentType) {
      const { error } = await bucket.upload(path, body, {
        contentType,
        cacheControl: "3600",
        upsert: true,
      });
      if (error) throw error;
    },
    async delete(paths) {
      if (!paths.length) return;
      const { error } = await bucket.remove(paths);
      if (error) throw error;
    },
    async copy(from, to) {
      const { error } = await bucket.copy(from, to);
      if (error) throw error;
    },
    async listOutfitIds() {
      // ponytail: one page covers the MVP ceiling; paginate when active volume exceeds 1000.
      const { data, error } = await bucket.list("outfits", { limit: 1000 });
      if (error) throw error;
      return data
        .map((entry) => entry.name)
        .filter((name) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            name,
          ),
        );
    },
    publicUrl(path) {
      return bucket.getPublicUrl(path).data.publicUrl;
    },
  };
  return cached;
}
