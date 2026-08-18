import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { productionAssets } from "@/features/dress-up/catalog";

/**
 * Production compatibility check for the native Sharp/libvips binary.
 *
 * A successful Next.js build is not sufficient proof that the serverless
 * function can render images. This test exercises the real native module
 * end-to-end: it loads Sharp, reads a real production asset, performs a
 * resize + composite + encode pipeline (the same operations the outfit
 * renderer uses), and verifies a decodable buffer is produced.
 *
 * On Vercel (linux-x64/glibc) this is the exact code path that fails with
 * `ERR_DLOPEN_FAILED: libvips-cpp.so ... cannot open shared object file`
 * when the platform-specific `@img/sharp-libvips-linux-x64` package is
 * missing from the install. If that package is absent, importing Sharp or
 * running any operation throws here before a deploy can ship a broken
 * render pipeline.
 */
describe("sharp native module (production compatibility)", () => {
  it("loads the native binary and exposes libvips version metadata", () => {
    // `sharp.versions` is populated by the native addon. If the binary
    // failed to dlopen, this access throws or returns empty metadata.
    expect(sharp.versions).toBeDefined();
    expect(typeof sharp.versions.vips).toBe("string");
    expect(sharp.versions.vips.length).toBeGreaterThan(0);
  });

  it("resizes, composites, and encodes a real production asset to a buffer", async () => {
    const framePath = path.join(
      process.cwd(),
      "public",
      productionAssets.shareFramePath.replace(/^\//, ""),
    );
    // The share frame is a required production asset for the render
    // pipeline. If it is missing the render cannot ship, so fail loudly.
    expect(existsSync(framePath)).toBe(true);

    const background = await sharp({
      create: { width: 1200, height: 1600, channels: 4, background: "#224466" },
    })
      .png()
      .toBuffer();

    // Resize (the same operation the renderer applies to the scene).
    const resized = await sharp(background)
      .resize(472, 630, { fit: "cover" })
      .toBuffer();

    // Composite the resized scene onto a fresh canvas — mirrors socialJpeg.
    const frame = await readFile(framePath);
    const composited = await sharp({
      create: { width: 1200, height: 630, channels: 3, background: "#fbede0" },
    })
      .composite([{ input: resized, gravity: "center" }])
      .jpeg({ quality: 90 })
      .toBuffer();

    // Composite the real share frame (resized to fit) on top — mirrors
    // composeShareImage, which layers the 720x1280 frame over the scene.
    const fittedFrame = await sharp(frame)
      .resize(1200, 630, { fit: "cover" })
      .toBuffer();
    const withFrame = await sharp(composited)
      .composite([{ input: fittedFrame, gravity: "center", blend: "over" }])
      .png()
      .toBuffer();

    // The output must be a decodable image with the expected dimensions.
    const metadata = await sharp(withFrame).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
    expect(withFrame.byteLength).toBeGreaterThan(0);
  });
});
