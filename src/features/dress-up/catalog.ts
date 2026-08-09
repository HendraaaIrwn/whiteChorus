import type {
  CharacterId,
  DressUpConfiguration,
  OutfitCategory,
} from "@/features/dress-up/model";

export type DressUpAsset = {
  id: string;
  label: string;
  characterId: CharacterId | null;
  category: OutfitCategory | "background";
  previewPath: string;
  renderPaths: string[];
  layerOrder: number;
  active: boolean;
  swatch: string;
};

export type RenderLayer = {
  path: string;
  layerOrder: number;
  left: number;
  top: number;
  characterId: CharacterId | null;
  kind: "base" | "wardrobe" | "watermark";
};

export const characterStageOffsets = {
  "character-a": { left: 0, top: 0 },
  "character-b": { left: 0, top: 30 },
} as const;

export const productionAssets = {
  characterBases: [
    {
      characterId: "character-a" as const,
      path: "/dress-up/character-a/base.webp",
      layerOrder: 10,
    },
    {
      characterId: "character-b" as const,
      path: "/dress-up/character-b/base.webp",
      layerOrder: 110,
    },
  ],
  watermarkPath: "/brand/watermark-white.png",
  logoPath: "/brand/logo-horizontal.webp",
  audioPath: "/audio/white-chorus-theme.mp3",
  defaultLookPath: "/dress-up/previews/default-look.webp",
  defaultSocialPath: "/dress-up/previews/default-look-social.jpg",
  characterLooks: {
    emir: "/dress-up/previews/emir-look-01.webp",
    friska: "/dress-up/previews/friska-look-01.webp",
  },
  characterIcons: {
    emir: "/dress-up/previews/emir-icon.webp",
    friska: "/dress-up/previews/friska-icon.webp",
  },
} as const;

export const dressUpAssetRevision = "2026-08-08-official-2";

const swatches = [
  "var(--blue-400)",
  "var(--mint-500)",
  "var(--apricot-500)",
  "var(--coral-400)",
  "var(--yellow-400)",
];

function makeCharacterAssets(
  characterId: CharacterId,
  prefix: "a" | "b",
): DressUpAsset[] {
  const characterOffset = prefix === "a" ? 0 : 100;
  return [
    { category: "hair", folder: "hair", layerOrder: 70 },
    { category: "top", folder: "tops", layerOrder: 40 },
    { category: "bottom", folder: "bottoms", layerOrder: 30 },
    { category: "one-piece", folder: "one-pieces", layerOrder: 45 },
    { category: "shoes", folder: "shoes", layerOrder: 35 },
    { category: "accessory", folder: "accessories", layerOrder: 80 },
  ].flatMap(({ category, folder, layerOrder }) =>
    Array.from({ length: 5 }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      const id = `${prefix}-${category}-${number}`;
      return {
        id,
        label: `${category.replace("-", " ")} ${number}`,
        characterId,
        category: category as OutfitCategory,
        previewPath: `/dress-up/${characterId}/thumbnails/${id}.webp`,
        renderPaths: [`/dress-up/${characterId}/${folder}/${id}.webp`],
        layerOrder: layerOrder + characterOffset,
        active: true,
        swatch: swatches[index],
      };
    }),
  );
}

export const backgroundAssets: DressUpAsset[] = Array.from(
  { length: 5 },
  (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `background-${number}`,
      label: [
        "Dance Floor",
        "Mint Room",
        "Apricot Beach",
        "Blue Garden",
        "Star Stage",
      ][index],
      characterId: null,
      category: "background",
      previewPath: `/dress-up/backgrounds/background-${number}-thumb.webp`,
      renderPaths: [`/dress-up/backgrounds/background-${number}.webp`],
      layerOrder: 0,
      active: true,
      swatch: swatches[index],
    };
  },
);

export const dressUpAssets = [
  ...backgroundAssets,
  ...makeCharacterAssets("character-a", "a"),
  ...makeCharacterAssets("character-b", "b"),
];

const assetById = new Map(dressUpAssets.map((asset) => [asset.id, asset]));

export function getAsset(id: string | null): DressUpAsset | undefined {
  return id ? assetById.get(id) : undefined;
}

export function getItems(
  characterId: CharacterId,
  category: OutfitCategory,
): DressUpAsset[] {
  return dressUpAssets.filter(
    (asset) =>
      asset.active &&
      asset.characterId === characterId &&
      asset.category === category,
  );
}

export function validateCatalogConfiguration(
  value: DressUpConfiguration,
): string[] {
  const errors: string[] = [];
  const background = getAsset(value.backgroundId);
  if (!background || background.category !== "background" || !background.active)
    errors.push("Invalid background");

  for (const [key, characterId] of [
    ["characterA", "character-a"],
    ["characterB", "character-b"],
  ] as const) {
    const character = value[key];
    const selections = [
      [character.hairId, "hair"],
      [character.topId, "top"],
      [character.bottomId, "bottom"],
      [character.onePieceId, "one-piece"],
      [character.shoesId, "shoes"],
      ...character.accessoryIds.map((id) => [id, "accessory"] as const),
    ] as const;
    for (const [id, category] of selections) {
      if (!id) continue;
      const asset = getAsset(id);
      if (
        !asset ||
        !asset.active ||
        asset.characterId !== characterId ||
        asset.category !== category
      )
        errors.push(`Invalid asset ${id}`);
    }
  }
  return errors;
}

export function renderLayersFor(value: DressUpConfiguration): RenderLayer[] {
  const ids = [
    value.characterA.hairId,
    value.characterA.bottomId,
    value.characterA.shoesId,
    value.characterA.topId,
    value.characterA.onePieceId,
    ...value.characterA.accessoryIds,
    value.characterB.hairId,
    value.characterB.bottomId,
    value.characterB.shoesId,
    value.characterB.topId,
    value.characterB.onePieceId,
    ...value.characterB.accessoryIds,
  ].filter(Boolean) as string[];
  return [
    ...productionAssets.characterBases.map(
      ({ characterId, path, layerOrder }) => ({
        path,
        layerOrder,
        characterId,
        kind: "base" as const,
        ...characterStageOffsets[characterId],
      }),
    ),
    ...ids.flatMap((id) => {
      const asset = getAsset(id);
      return (
        asset?.renderPaths.map((path, index) => ({
          path,
          layerOrder: asset.layerOrder + index / 100,
          characterId: asset.characterId,
          kind: "wardrobe" as const,
          ...(asset.characterId
            ? characterStageOffsets[asset.characterId]
            : { left: 0, top: 0 }),
        })) ?? []
      );
    }),
    {
      path: productionAssets.watermarkPath,
      layerOrder: 1000,
      left: 0,
      top: 0,
      characterId: null,
      kind: "watermark" as const,
    },
  ].sort((left, right) => left.layerOrder - right.layerOrder);
}
