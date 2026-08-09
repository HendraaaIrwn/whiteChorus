import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  getAsset,
  productionAssets,
  renderLayersFor,
} from "../src/features/dress-up/catalog";
import {
  defaultConfiguration,
  type CharacterId,
} from "../src/features/dress-up/model";

const root = path.join(process.cwd(), "public");
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const officialWardrobeIds = [
  "a-top-01",
  "a-bottom-01",
  "a-shoes-01",
  "b-top-01",
  "b-bottom-01",
  "b-shoes-01",
] as const;

function publicFile(urlPath: string) {
  return path.join(root, urlPath.replace(/^\//, ""));
}

async function ensureParent(file: string) {
  await mkdir(path.dirname(file), { recursive: true });
}

async function generateOfficialWardrobeThumbnails() {
  await Promise.all(
    officialWardrobeIds.map(async (id) => {
      const asset = getAsset(id);
      const renderPath = asset?.renderPaths[0];
      if (!asset || !renderPath)
        throw new Error(`Official wardrobe asset is missing: ${id}`);

      const destination = publicFile(asset.previewPath);
      await ensureParent(destination);
      await sharp(publicFile(renderPath))
        .trim({ threshold: 8 })
        .resize(156, 196, { fit: "contain", background: transparent })
        .extend({
          top: 22,
          bottom: 22,
          left: 12,
          right: 12,
          background: transparent,
        })
        .webp({ lossless: true, effort: 6 })
        .toFile(destination);
    }),
  );
}

async function characterLook(characterId: CharacterId) {
  const prefix = `/dress-up/${characterId}/`;
  const layers = renderLayersFor(defaultConfiguration).filter(({ path }) =>
    path.startsWith(prefix),
  );
  return sharp({
    create: { width: 1200, height: 1600, channels: 4, background: transparent },
  })
    .composite(
      layers.map(({ left, path: layer, top }) => ({
        input: publicFile(layer),
        left,
        top,
      })),
    )
    .webp({ lossless: true, effort: 6 })
    .toBuffer();
}

async function main() {
  const background = getAsset(defaultConfiguration.backgroundId);
  if (!background) throw new Error("Default background is missing.");

  await generateOfficialWardrobeThumbnails();

  const [emir, friska] = await Promise.all([
    characterLook("character-a"),
    characterLook("character-b"),
  ]);
  const characterLooks = [
    [productionAssets.characterLooks.emir, emir],
    [productionAssets.characterLooks.friska, friska],
  ] as const;

  for (const [urlPath, buffer] of characterLooks) {
    const destination = publicFile(urlPath);
    await ensureParent(destination);
    await sharp(buffer).toFile(destination);
  }

  for (const [urlPath, buffer] of [
    [productionAssets.characterIcons.emir, emir],
    [productionAssets.characterIcons.friska, friska],
  ] as const) {
    const destination = publicFile(urlPath);
    await ensureParent(destination);
    await sharp(buffer)
      .trim({ threshold: 8 })
      .resize(256, 256, {
        fit: "cover",
        position: "top",
        background: transparent,
      })
      .webp({ lossless: true, effort: 6 })
      .toFile(destination);
  }

  const scene = await sharp(publicFile(background.renderPaths[0]!))
    .resize(1200, 1600, { fit: "cover" })
    .composite([{ input: emir }, { input: friska }])
    .webp({ quality: 94, smartSubsample: true, effort: 6 })
    .toBuffer();
  const sceneDestination = publicFile(productionAssets.defaultLookPath);
  await ensureParent(sceneDestination);
  await sharp(scene).toFile(sceneDestination);

  const socialDestination = publicFile(productionAssets.defaultSocialPath);
  await ensureParent(socialDestination);
  const socialCharacter = await sharp(scene)
    .resize(472, 630, { fit: "cover" })
    .toBuffer();
  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: "#fbede0" },
  })
    .composite([{ input: socialCharacter, gravity: "center" }])
    .jpeg({ quality: 90 })
    .toFile(socialDestination);

  const iconSource = await sharp(scene)
    .extract({ left: 250, top: 180, width: 700, height: 700 })
    .png()
    .toBuffer();
  await sharp(iconSource).resize(512, 512).png().toFile("src/app/icon.png");
  await sharp(iconSource)
    .resize(180, 180)
    .png()
    .toFile("src/app/apple-icon.png");

  console.log(
    "Generated synchronized wardrobe thumbnails, character, homepage, social, and icon assets.",
  );
}

void main();
