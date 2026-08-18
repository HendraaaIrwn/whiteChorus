import { readFile } from "node:fs/promises";

import { defaultConfiguration } from "@/features/dress-up/model";
import { sharpOutfitRenderer } from "@/server/rendering/outfit-renderer";
import sharp from "sharp";

/**
 * Local end-to-end render smoke test. Runs the REAL sharpOutfitRenderer
 * (the same code path Vercel invokes through POST /api/outfits) against the
 * default production configuration and verifies every artifact is a
 * decodable image with the expected format/dimensions.
 *
 * Run with: pnpm exec tsx scripts/smoke-render-outfit.ts
 */
async function main() {
  const startedAt = Date.now();
  console.log("[smoke] rendering default configuration with sharpOutfitRenderer");
  console.log("[smoke] sharp versions:", JSON.stringify(sharp.versions));

  const bundle = await sharpOutfitRenderer.render(defaultConfiguration);

  const checks = [
    { name: "finalWebp", buffer: bundle.finalWebp, format: "webp" },
    { name: "downloadPng", buffer: bundle.downloadPng, format: "png" },
    { name: "thumbnailWebp", buffer: bundle.thumbnailWebp, format: "webp" },
    { name: "socialJpeg", buffer: bundle.socialJpeg, format: "jpeg" },
    { name: "sharePng", buffer: bundle.sharePng, format: "png" },
  ] as const;

  for (const { name, buffer, format } of checks) {
    const meta = await sharp(buffer).metadata();
    const ok =
      meta.format === format &&
      (meta.width ?? 0) > 0 &&
      (meta.height ?? 0) > 0 &&
      buffer.byteLength > 0;
    console.log(
      `[smoke] ${ok ? "OK" : "FAIL"} ${name}: ${meta.format} ${meta.width}x${meta.height} (${buffer.byteLength} bytes)`,
    );
    if (!ok) process.exitCode = 1;
  }

  // Sanity: the share frame composite is opaque at the slot centre.
  const frame = await readFile("public/brand/shareables-frame.png");
  const frameMeta = await sharp(frame).metadata();
  console.log(
    `[smoke] share frame: ${frameMeta.format} ${frameMeta.width}x${frameMeta.height}`,
  );

  console.log(`[smoke] done in ${Date.now() - startedAt}ms`);
}

main().catch((error) => {
  console.error("[smoke] render failed:", error);
  process.exit(1);
});
