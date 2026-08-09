import "server-only";

import path from "node:path";
import sharp from "sharp";

import { getAsset, renderLayersFor } from "@/features/dress-up/catalog";
import type { DressUpConfiguration } from "@/features/dress-up/model";

export type RenderedOutfitBundle = {
  finalWebp: Buffer;
  downloadPng: Buffer;
  thumbnailWebp: Buffer;
  socialJpeg: Buffer;
};

export interface OutfitRenderer {
  render(configuration: DressUpConfiguration): Promise<RenderedOutfitBundle>;
}

function publicFile(urlPath: string): string {
  return path.join(process.cwd(), "public", urlPath.replace(/^\//, ""));
}

export const sharpOutfitRenderer: OutfitRenderer = {
  async render(configuration) {
    const background = getAsset(configuration.backgroundId);
    if (!background) throw new Error("INVALID_BACKGROUND");
    const layers = renderLayersFor(configuration);
    const finalWebp = await sharp(publicFile(background.renderPaths[0]!))
      .resize(1200, 1600, { fit: "cover" })
      .composite(
        layers.map(({ left, path: input, top }) => ({
          input: publicFile(input),
          left,
          top,
        })),
      )
      .webp({ quality: 92 })
      .toBuffer();

    const [downloadPng, thumbnailWebp, socialCharacter] = await Promise.all([
      sharp(finalWebp).png({ compressionLevel: 8 }).toBuffer(),
      sharp(finalWebp).resize(450, 600).webp({ quality: 84 }).toBuffer(),
      sharp(finalWebp).resize(472, 630, { fit: "cover" }).toBuffer(),
    ]);
    const socialJpeg = await sharp({
      create: { width: 1200, height: 630, channels: 3, background: "#fbede0" },
    })
      .composite([{ input: socialCharacter, gravity: "center" }])
      .jpeg({ quality: 90 })
      .toBuffer();
    return { finalWebp, downloadPng, thumbnailWebp, socialJpeg };
  },
};
