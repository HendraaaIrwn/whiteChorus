import path from "node:path";
import sharp from "sharp";

import { productionAssets } from "@/features/dress-up/catalog";

export const shareImageGeometry = {
  width: 720,
  height: 1280,
  slot: { left: 65, top: 221, width: 587, height: 782 },
} as const;

function publicFile(urlPath: string): string {
  return path.join(process.cwd(), "public", urlPath.replace(/^\//, ""));
}

export async function composeShareImage(finalImage: Buffer): Promise<Buffer> {
  const { height, slot, width } = shareImageGeometry;
  const containedOutfit = await sharp(finalImage)
    .resize(slot.width, slot.height, {
      fit: "contain",
      position: "centre",
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([
      { input: containedOutfit, left: slot.left, top: slot.top },
      {
        input: publicFile(productionAssets.shareFramePath),
        left: 0,
        top: 0,
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}
