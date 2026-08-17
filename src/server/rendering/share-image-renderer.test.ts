import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { productionAssets } from "@/features/dress-up/catalog";
import {
  composeShareImage,
  shareImageGeometry,
} from "@/server/rendering/share-image-renderer";

function publicFile(urlPath: string): string {
  return path.join(process.cwd(), "public", urlPath.replace(/^\//, ""));
}

function pixelAt(
  data: Buffer,
  width: number,
  channels: number,
  x: number,
  y: number,
) {
  const offset = (y * width + x) * channels;
  return [...data.subarray(offset, offset + channels)];
}

describe("composeShareImage", () => {
  it("contains the complete outfit beneath the untouched 720x1280 frame", async () => {
    const corner = (background: string) => ({
      create: { width: 180, height: 180, channels: 4 as const, background },
    });
    const source = await sharp({
      create: {
        width: 1200,
        height: 1600,
        channels: 4,
        background: "#224466",
      },
    })
      .composite([
        { input: corner("#ff0000"), left: 0, top: 0 },
        { input: corner("#00ff00"), left: 1020, top: 0 },
        { input: corner("#ffff00"), left: 0, top: 1420 },
        { input: corner("#00ffff"), left: 1020, top: 1420 },
      ])
      .png()
      .toBuffer();
    const unchangedSource = Buffer.from(source);

    const output = await composeShareImage(source);
    expect(source.equals(unchangedSource)).toBe(true);
    await expect(sharp(output).metadata()).resolves.toMatchObject({
      width: shareImageGeometry.width,
      height: shareImageGeometry.height,
      format: "png",
    });

    const rendered = await sharp(output)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const frame = await sharp(
      await readFile(publicFile(productionAssets.shareFramePath)),
    )
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const renderedPixel = (x: number, y: number) =>
      pixelAt(rendered.data, rendered.info.width, rendered.info.channels, x, y);
    const framePixel = (x: number, y: number) =>
      pixelAt(frame.data, frame.info.width, frame.info.channels, x, y);

    expect(renderedPixel(75, 231).slice(0, 3)).toEqual([255, 0, 0]);
    expect(renderedPixel(641, 231).slice(0, 3)).toEqual([0, 255, 0]);
    expect(renderedPixel(75, 992).slice(0, 3)).toEqual([255, 255, 0]);
    expect(renderedPixel(641, 992).slice(0, 3)).toEqual([0, 255, 255]);

    for (const [x, y] of [
      [0, 0],
      [360, 221],
      [360, 1100],
    ] as const) {
      const renderedFramePixel = renderedPixel(x, y);
      const sourceFramePixel = framePixel(x, y);
      expect(renderedFramePixel[3]).toBe(sourceFramePixel[3]);
      expect(
        renderedFramePixel
          .slice(0, 3)
          .every(
            (channel, index) =>
              Math.abs(channel! - sourceFramePixel[index]!) <= 2,
          ),
      ).toBe(true);
    }
    expect(renderedPixel(360, 700)[3]).toBe(255);
  });
});
