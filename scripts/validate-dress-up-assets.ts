import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { categories } from "../src/features/dress-up/model";
import {
  backgroundAssets,
  dressUpAssets,
  productionAssets,
} from "../src/features/dress-up/catalog";

const errors: string[] = [];
const ids = new Set<string>();
const ownedPaths = new Map<string, string>();
for (const asset of dressUpAssets) {
  if (ids.has(asset.id)) errors.push(`Duplicate asset ID: ${asset.id}`);
  ids.add(asset.id);
  if (!asset.renderPaths.length)
    errors.push(`Missing render path: ${asset.id}`);
  for (const file of [asset.previewPath, ...asset.renderPaths]) {
    const owner = ownedPaths.get(file);
    if (owner)
      errors.push(`Asset path reused by ${owner} and ${asset.id}: ${file}`);
    else ownedPaths.set(file, asset.id);
  }
  if (
    asset.characterId &&
    [asset.previewPath, ...asset.renderPaths].some(
      (file) => !file.startsWith(`/dress-up/${asset.characterId}/`),
    )
  )
    errors.push(`Character path mismatch: ${asset.id}`);
}
if (backgroundAssets.filter((asset) => asset.active).length !== 5)
  errors.push("Exactly five active backgrounds are required.");
if (backgroundAssets.length !== 5)
  errors.push("Exactly five background catalog entries are supported.");
for (const characterId of ["character-a", "character-b"] as const) {
  for (const category of categories) {
    const assets = dressUpAssets.filter(
      (asset) =>
        asset.characterId === characterId && asset.category === category,
    );
    const activeCount = assets.filter((asset) => asset.active).length;
    if (activeCount !== 5)
      errors.push(
        `${characterId}/${category} must have exactly five active items; found ${activeCount}.`,
      );
    if (assets.length > 10)
      errors.push(
        `${characterId}/${category} exceeds the supported maximum of ten.`,
      );
  }
}

async function validateOfficialAssets() {
  if (process.env.REQUIRE_OFFICIAL_ASSETS !== "1") return;
  const renderFiles = [
    ...dressUpAssets.flatMap((asset) => asset.renderPaths),
    ...productionAssets.characterBases.map((asset) => asset.path),
    productionAssets.watermarkPath,
  ];
  for (const asset of dressUpAssets) {
    for (const file of [asset.previewPath, ...asset.renderPaths]) {
      if (
        !existsSync(path.join(process.cwd(), "public", file.replace(/^\//, "")))
      )
        errors.push(`Missing official file: ${file}`);
    }
  }
  for (const required of [
    productionAssets.audioPath,
    productionAssets.logoPath,
    productionAssets.defaultLookPath,
    productionAssets.defaultSocialPath,
    ...Object.values(productionAssets.characterLooks),
    ...Object.values(productionAssets.characterIcons),
    ...productionAssets.characterBases.map((asset) => asset.path),
    productionAssets.watermarkPath,
  ]) {
    if (!existsSync(path.join(process.cwd(), "public", required.slice(1))))
      errors.push(`Missing official file: ${required}`);
  }

  for (const file of new Set(renderFiles)) {
    const absolute = path.join(process.cwd(), "public", file.slice(1));
    if (!existsSync(absolute)) continue;
    try {
      const metadata = await sharp(absolute).metadata();
      if (metadata.width !== 1200 || metadata.height !== 1600)
        errors.push(
          `Render canvas must be 1200x1600: ${file} is ${metadata.width}x${metadata.height}`,
        );
    } catch {
      errors.push(`Unreadable render image: ${file}`);
    }
  }

  const derivedSizes = new Map<string, [number, number]>([
    [productionAssets.defaultLookPath, [1200, 1600]],
    [productionAssets.defaultSocialPath, [1200, 630]],
    [productionAssets.characterLooks.emir, [1200, 1600]],
    [productionAssets.characterLooks.friska, [1200, 1600]],
    [productionAssets.characterIcons.emir, [256, 256]],
    [productionAssets.characterIcons.friska, [256, 256]],
    [productionAssets.logoPath, [320, 144]],
  ]);
  for (const [file, [expectedWidth, expectedHeight]] of derivedSizes) {
    const absolute = path.join(process.cwd(), "public", file.slice(1));
    if (!existsSync(absolute)) continue;
    try {
      const metadata = await sharp(absolute).metadata();
      if (
        metadata.width !== expectedWidth ||
        metadata.height !== expectedHeight
      )
        errors.push(
          `Derived asset must be ${expectedWidth}x${expectedHeight}: ${file} is ${metadata.width}x${metadata.height}`,
        );
    } catch {
      errors.push(`Unreadable derived asset: ${file}`);
    }
  }

  let itemThumbnailSize = "";
  for (const asset of dressUpAssets) {
    const absolute = path.join(
      process.cwd(),
      "public",
      asset.previewPath.slice(1),
    );
    if (!existsSync(absolute)) continue;
    try {
      const metadata = await sharp(absolute).metadata();
      if (!metadata.width || !metadata.height) {
        errors.push(`Invalid thumbnail dimensions: ${asset.previewPath}`);
      } else if (asset.category === "background") {
        if (Math.abs(metadata.width / metadata.height - 4 / 3) > 0.01)
          errors.push(`Background thumbnail must be 4:3: ${asset.previewPath}`);
      } else {
        const size = `${metadata.width}x${metadata.height}`;
        itemThumbnailSize ||= size;
        if (size !== itemThumbnailSize)
          errors.push(`Item thumbnail size mismatch: ${asset.previewPath}`);
      }
    } catch {
      errors.push(`Unreadable thumbnail image: ${asset.previewPath}`);
    }
  }
}

async function main() {
  await validateOfficialAssets();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Validated ${dressUpAssets.length} catalog entries${process.env.REQUIRE_OFFICIAL_ASSETS === "1" ? " and official files" : " (structure only)"}.`,
    );
  }
}

void main();
