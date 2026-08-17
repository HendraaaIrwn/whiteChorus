import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { categories } from "../src/features/dress-up/model";
import {
  backgroundAssets,
  dressUpAssets,
  productionAssets,
} from "../src/features/dress-up/catalog";
import { shareImageGeometry } from "../src/server/rendering/share-image-renderer";

const errors: string[] = [];
const ids = new Set<string>();
const ownedPaths = new Map<string, string>();
const realWardrobePattern = /^(emir|friska)-(top|bottom|shoes)-(0[1-3])$/;
for (const asset of dressUpAssets) {
  if (ids.has(asset.id)) errors.push(`Duplicate asset ID: ${asset.id}`);
  ids.add(asset.id);
  if (!asset.assetSrcs.length) errors.push(`Missing render path: ${asset.id}`);
  for (const file of [asset.iconSrc, ...asset.assetSrcs]) {
    const owner = ownedPaths.get(file);
    if (owner)
      errors.push(`Asset path reused by ${owner} and ${asset.id}: ${file}`);
    else ownedPaths.set(file, asset.id);
  }
  if (
    asset.characterId &&
    [asset.iconSrc, ...asset.assetSrcs].some(
      (file) => !file.startsWith(`/dress-up/${asset.characterId}/`),
    )
  )
    errors.push(`Character path mismatch: ${asset.id}`);

  const realWardrobeMatch = asset.id.match(realWardrobePattern);
  if (realWardrobeMatch) {
    const [, characterName, category, number] = realWardrobeMatch;
    const prefix = characterName === "emir" ? "a" : "b";
    const characterId =
      characterName === "emir" ? "character-a" : "character-b";
    const folder =
      category === "top" ? "tops" : category === "bottom" ? "bottoms" : "shoes";
    const expectedIcon = `/dress-up/${characterId}/icons/icon-${characterName}-${category}-${number}.png`;
    const expectedAsset = `/dress-up/${characterId}/${folder}/${prefix}-${category}-${number}.webp`;
    if (
      asset.characterId !== characterId ||
      asset.iconPresentation !== "framed-square" ||
      asset.iconSrc !== expectedIcon ||
      asset.assetSrcs.length !== 1 ||
      asset.assetSrcs[0] !== expectedAsset
    )
      errors.push(`Real wardrobe icon/equip pairing mismatch: ${asset.id}`);
  } else if (asset.iconPresentation === "framed-square") {
    errors.push(`Unexpected framed-square wardrobe asset: ${asset.id}`);
  }
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
    const expectedActiveCount =
      category === "top" || category === "bottom" || category === "shoes"
        ? 3
        : 0;
    if (activeCount !== expectedActiveCount)
      errors.push(
        `${characterId}/${category} must have exactly ${expectedActiveCount} real items; found ${activeCount}.`,
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
    ...dressUpAssets.flatMap((asset) => asset.assetSrcs),
    ...productionAssets.characterBases.map((asset) => asset.path),
    productionAssets.watermarkPath,
  ];
  const equippedLayerFiles = new Set(
    dressUpAssets
      .filter((asset) => asset.characterId)
      .flatMap((asset) => asset.assetSrcs),
  );
  for (const asset of dressUpAssets) {
    for (const file of [asset.iconSrc, ...asset.assetSrcs]) {
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
    productionAssets.defaultSharePath,
    productionAssets.shareFramePath,
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
      if (
        equippedLayerFiles.has(file) &&
        (metadata.format !== "webp" || !metadata.hasAlpha)
      )
        errors.push(`Equipped layer must be a transparent WebP: ${file}`);
    } catch {
      errors.push(`Unreadable render image: ${file}`);
    }
  }

  const derivedSizes = new Map<string, [number, number]>([
    [productionAssets.defaultLookPath, [1200, 1600]],
    [productionAssets.defaultSocialPath, [1200, 630]],
    [productionAssets.defaultSharePath, [720, 1280]],
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

  let standardItemThumbnailSize = "";
  for (const asset of dressUpAssets) {
    const absolute = path.join(process.cwd(), "public", asset.iconSrc.slice(1));
    if (!existsSync(absolute)) continue;
    try {
      const metadata = await sharp(absolute).metadata();
      if (!metadata.width || !metadata.height) {
        errors.push(`Invalid thumbnail dimensions: ${asset.iconSrc}`);
      } else if (asset.category === "background") {
        if (Math.abs(metadata.width / metadata.height - 4 / 3) > 0.01)
          errors.push(`Background thumbnail must be 4:3: ${asset.iconSrc}`);
      } else if (asset.iconPresentation === "framed-square") {
        if (
          metadata.width !== 2048 ||
          metadata.height !== 2048 ||
          !metadata.hasAlpha ||
          metadata.format !== "png"
        )
          errors.push(
            `Real wardrobe icon must be a transparent 2048x2048 PNG: ${asset.iconSrc}`,
          );
      } else {
        const size = `${metadata.width}x${metadata.height}`;
        standardItemThumbnailSize ||= size;
        if (size !== standardItemThumbnailSize)
          errors.push(`Item thumbnail size mismatch: ${asset.iconSrc}`);
      }
    } catch {
      errors.push(`Unreadable thumbnail image: ${asset.iconSrc}`);
    }
  }
}

async function validateShareAssets() {
  const frameFile = path.join(
    process.cwd(),
    "public",
    productionAssets.shareFramePath.slice(1),
  );
  const fixtureFile = path.join(
    process.cwd(),
    "public",
    productionAssets.defaultSharePath.slice(1),
  );
  for (const file of [frameFile, fixtureFile]) {
    if (!existsSync(file)) errors.push(`Missing share asset: ${file}`);
  }
  if (!existsSync(frameFile)) return;

  try {
    const { data, info } = await sharp(frameFile)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (
      info.width !== shareImageGeometry.width ||
      info.height !== shareImageGeometry.height
    )
      errors.push(
        `Share frame must be ${shareImageGeometry.width}x${shareImageGeometry.height}.`,
      );

    const alphaAt = (x: number, y: number) =>
      data[(y * info.width + x) * info.channels + 3];
    const { height, left, top, width } = shareImageGeometry.slot;
    const transparentCorners = [
      [left, top],
      [left + width - 1, top],
      [left, top + height - 1],
      [left + width - 1, top + height - 1],
    ] as const;
    const opaqueBoundaries = [
      [left - 1, top],
      [left, top - 1],
      [left + width, top + height - 1],
      [left, top + height],
      [Math.floor(info.width / 2), top],
    ] as const;
    if (transparentCorners.some(([x, y]) => alphaAt(x, y) !== 0))
      errors.push("Share frame transparent display-slot corners changed.");
    if (opaqueBoundaries.some(([x, y]) => alphaAt(x, y) === 0))
      errors.push("Share frame boundary or marquee alpha changed.");
  } catch {
    errors.push(`Unreadable share frame: ${productionAssets.shareFramePath}`);
  }

  if (existsSync(fixtureFile)) {
    try {
      const fixture = await sharp(fixtureFile).metadata();
      if (
        fixture.width !== shareImageGeometry.width ||
        fixture.height !== shareImageGeometry.height
      )
        errors.push(
          `Default share image must be ${shareImageGeometry.width}x${shareImageGeometry.height}.`,
        );
    } catch {
      errors.push(`Unreadable default share image: ${fixtureFile}`);
    }
  }
}

async function main() {
  await validateShareAssets();
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
