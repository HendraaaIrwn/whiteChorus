import type {
  CharacterConfiguration,
  CharacterId,
  DressUpConfiguration,
  OutfitCategory,
} from "@/features/dress-up/model";

export type RegistrationOffset = {
  x: number;
  y: number;
};

export type DressUpAsset = {
  id: string;
  legacyIds?: readonly string[];
  label: string;
  characterId: CharacterId | null;
  category: OutfitCategory | "background";
  ordinal: number;
  iconSrc: string;
  assetSrcs: string[];
  iconPresentation: "standard" | "framed-square";
  layerOrder: number;
  active: boolean;
  swatch: string;
  /**
   * Per-asset wardrobe registration correction against the character body.
   * Applied on top of CHARACTER_WARDROBE_OFFSET. Does not move the base body.
   */
  registrationOffset?: RegistrationOffset;
};

export type RenderLayer = {
  assetId: string;
  path: string;
  layerOrder: number;
  left: number;
  top: number;
  characterId: CharacterId | null;
  kind: "base" | "wardrobe" | "watermark";
};

/**
 * LEVEL A — STAGE POSITION
 * Where each character stands as a whole inside the 1200x1600 stage canvas.
 * Applies to the character root (base body).
 *
 * Friska (character-b) base/body is locked at x=0, y=30.
 * Do NOT move this to fix wardrobe alignment — use wardrobe offsets instead.
 */
export const CHARACTER_STAGE = {
  "character-a": { x: 0, y: 0, scale: 1 },
  "character-b": { x: 0, y: 30, scale: 1 },
} as const;

/**
 * LEVEL B — BASE REGISTRATION
 * Optional fine-alignment of the base body relative to stage.
 * Kept at zero for both characters; Friska's approved body position is stage-only.
 */
export const CHARACTER_REGISTRATION = {
  "character-a": { x: 0, y: 0 },
  "character-b": { x: 0, y: 0 },
} as const;

/**
 * LEVEL C — GLOBAL WARDROBE CORRECTION
 * Shared shift applied to every wardrobe layer of a character, relative to that
 * character's base body. Does NOT move the base/body.
 *
 * Friska wardrobe artwork is painted too far left inside the shared 1200×1600
 * canvas; shift garments right so they sit on the body. Emir needs no correction.
 */
export const CHARACTER_WARDROBE_OFFSET = {
  "character-a": { x: 0, y: 0 },
  "character-b": { x: 106, y: 0 },
} as const;

/**
 * Canonical layer position resolver shared by client preview and Sharp compositor.
 *
 * base     → stage + base registration
 * wardrobe → base + character wardrobe offset + per-item registration offset
 */
export function resolveLayerPosition(
  characterId: CharacterId,
  kind: "base" | "wardrobe",
  item?: Pick<DressUpAsset, "registrationOffset"> | null,
): RegistrationOffset {
  const stage = CHARACTER_STAGE[characterId];
  const registration = CHARACTER_REGISTRATION[characterId];
  const baseLeft = stage.x + registration.x;
  const baseTop = stage.y + registration.y;

  if (kind === "base") {
    return { x: baseLeft, y: baseTop };
  }

  const wardrobe = CHARACTER_WARDROBE_OFFSET[characterId];
  const itemOffset = item?.registrationOffset ?? { x: 0, y: 0 };
  return {
    x: baseLeft + wardrobe.x + itemOffset.x,
    y: baseTop + wardrobe.y + itemOffset.y,
  };
}

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
  shareFramePath: "/brand/shareables-frame.png",
  audioPath: "/audio/white-chorus-theme.mp3",
  defaultLookPath: "/dress-up/previews/default-look.webp",
  defaultSocialPath: "/dress-up/previews/default-look-social.jpg",
  defaultSharePath: "/dress-up/previews/default-look-share.png",
  characterLooks: {
    emir: "/dress-up/previews/emir-look-01.webp",
    friska: "/dress-up/previews/friska-look-01.webp",
  },
  characterIcons: {
    emir: "/dress-up/previews/emir-icon.webp",
    friska: "/dress-up/previews/friska-icon.webp",
  },
} as const;

export const dressUpAssetRevision = "2026-08-17-real-wardrobe-only-3";

const swatches = [
  "var(--blue-400)",
  "var(--mint-500)",
  "var(--apricot-500)",
  "var(--coral-400)",
  "var(--yellow-400)",
];

/**
 * Centralized render-order definition per character (higher paints later).
 * Both characters use the same stacking: shoes paint first (behind bottom),
 * then bottom, then top. This ensures pants/skirts/dress-bottoms always
 * appear in front of shoes for a natural overlap at the hem/ankle.
 */
export const wardrobeLayerOrder: Record<
  CharacterId,
  Record<OutfitCategory, number>
> = {
  "character-a": {
    shoes: 30,
    bottom: 35,
    top: 40,
    "one-piece": 45,
    hair: 70,
    accessory: 80,
  },
  "character-b": {
    shoes: 30,
    bottom: 35,
    top: 40,
    "one-piece": 45,
    hair: 70,
    accessory: 80,
  },
};

const characterLayerOffset: Record<CharacterId, number> = {
  "character-a": 0,
  "character-b": 100,
};

type WardrobeManifestEntry = {
  id: string;
  legacyId: string;
  characterId: CharacterId;
  category: OutfitCategory;
  ordinal: number;
  iconSrc: string;
  layerSrc: string;
  iconPresentation: DressUpAsset["iconPresentation"];
  registrationOffset?: RegistrationOffset;
};

/**
 * Per-asset Friska wardrobe fine-tuning on top of CHARACTER_WARDROBE_OFFSET.
 * Values are pixel deltas inside the 1200×1600 stage (positive x = right).
 * Calibrated against body shoulder/leg/foot centers without moving the base.
 */
const friskaItemRegistrationOffsets: Record<string, RegistrationOffset> = {
  "friska-top-01": { x: 1, y: 0 },
  "friska-top-02": { x: 5, y: 0 },
  "friska-top-03": { x: -4, y: 0 },
  "friska-bottom-01": { x: 1, y: 0 },
  "friska-bottom-02": { x: 1, y: 0 },
  "friska-bottom-03": { x: 5, y: 0 },
  "friska-shoes-01": { x: -2, y: 0 },
  "friska-shoes-02": { x: -2, y: 0 },
  "friska-shoes-03": { x: 0, y: 0 },
};

function wardrobeItem(entry: WardrobeManifestEntry): DressUpAsset {
  const number = String(entry.ordinal).padStart(2, "0");
  const registrationOffset =
    entry.registrationOffset ??
    (entry.characterId === "character-b"
      ? friskaItemRegistrationOffsets[entry.id]
      : undefined);
  return {
    id: entry.id,
    legacyIds: [entry.legacyId],
    label: `${entry.category.replace("-", " ")} ${number}`,
    characterId: entry.characterId,
    category: entry.category,
    ordinal: entry.ordinal,
    iconSrc: entry.iconSrc,
    assetSrcs: [entry.layerSrc],
    iconPresentation: entry.iconPresentation,
    layerOrder:
      wardrobeLayerOrder[entry.characterId][entry.category] +
      characterLayerOffset[entry.characterId],
    active: true,
    swatch: swatches[entry.ordinal - 1]!,
    ...(registrationOffset ? { registrationOffset } : {}),
  };
}

const realWardrobeCharacters = [
  {
    characterId: "character-a",
    characterName: "emir",
    assetPrefix: "a",
  },
  {
    characterId: "character-b",
    characterName: "friska",
    assetPrefix: "b",
  },
] as const;

const realWardrobeCategories = [
  { category: "top", folder: "tops" },
  { category: "bottom", folder: "bottoms" },
  { category: "shoes", folder: "shoes" },
] as const;

export const wardrobeManifest: DressUpAsset[] = realWardrobeCharacters.flatMap(
  ({ assetPrefix, characterId, characterName }) =>
    realWardrobeCategories.flatMap(({ category, folder }) =>
      Array.from({ length: 3 }, (_, index) => {
        const ordinal = index + 1;
        const number = String(ordinal).padStart(2, "0");
        return wardrobeItem({
          id: `${characterName}-${category}-${number}`,
          legacyId: `${assetPrefix}-${category}-${number}`,
          characterId,
          category,
          ordinal,
          iconSrc: `/dress-up/${characterId}/icons/icon-${characterName}-${category}-${number}.png`,
          layerSrc: `/dress-up/${characterId}/${folder}/${assetPrefix}-${category}-${number}.webp`,
          iconPresentation: "framed-square",
        });
      }),
    ),
);

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
      ordinal: index + 1,
      iconSrc: `/dress-up/backgrounds/background-${number}-thumb.webp`,
      assetSrcs: [`/dress-up/backgrounds/background-${number}.webp`],
      iconPresentation: "standard",
      layerOrder: 0,
      active: true,
      swatch: swatches[index],
    };
  },
);

export const dressUpAssets = [...backgroundAssets, ...wardrobeManifest];

const assetById = new Map(dressUpAssets.map((asset) => [asset.id, asset]));
const legacyAssetById = new Map(
  wardrobeManifest.flatMap((asset) =>
    (asset.legacyIds ?? []).map((legacyId) => [legacyId, asset] as const),
  ),
);

export function getAsset(id: string | null): DressUpAsset | undefined {
  return id ? (assetById.get(id) ?? legacyAssetById.get(id)) : undefined;
}

function canonicalAssetId(id: string | null): string | null {
  return id ? (getAsset(id)?.id ?? null) : null;
}

export function normalizeCatalogConfiguration(
  value: DressUpConfiguration,
): DressUpConfiguration {
  const normalizeCharacter = (
    character: CharacterConfiguration,
  ): CharacterConfiguration => ({
    hairId: canonicalAssetId(character.hairId),
    topId: canonicalAssetId(character.topId),
    bottomId: canonicalAssetId(character.bottomId),
    onePieceId: canonicalAssetId(character.onePieceId),
    shoesId: canonicalAssetId(character.shoesId),
    accessoryIds: character.accessoryIds.flatMap((id) => {
      const canonicalId = canonicalAssetId(id);
      return canonicalId ? [canonicalId] : [];
    }),
  });

  return {
    version: 1,
    backgroundId: canonicalAssetId(value.backgroundId) ?? value.backgroundId,
    characterA: normalizeCharacter(value.characterA),
    characterB: normalizeCharacter(value.characterB),
  };
}

export function validateWardrobeManifest(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const legacyIds = new Set<string>();

  for (const item of wardrobeManifest) {
    if (ids.has(item.id)) errors.push(`Duplicate wardrobe ID: ${item.id}`);
    ids.add(item.id);
    if (!item.characterId) errors.push(`Missing character: ${item.id}`);
    if (!item.iconSrc) errors.push(`Missing iconSrc: ${item.id}`);
    if (item.assetSrcs.length !== 1 || !item.assetSrcs[0])
      errors.push(`Missing layerSrc: ${item.id}`);
    if (!Number.isInteger(item.ordinal) || item.ordinal < 1)
      errors.push(`Invalid ordinal: ${item.id}`);

    for (const legacyId of item.legacyIds ?? []) {
      if (legacyIds.has(legacyId))
        errors.push(`Duplicate legacy wardrobe ID: ${legacyId}`);
      legacyIds.add(legacyId);
    }

    const isEmir = item.characterId === "character-a";
    const expectedAssetPrefix = isEmir ? "/a-" : "/b-";
    const forbiddenAssetPrefix = isEmir ? "/b-" : "/a-";
    const expectedCharacterPath = `/dress-up/${item.characterId}/`;
    const expectedIconName = isEmir ? "emir" : "friska";
    const forbiddenIconName = isEmir ? "friska" : "emir";
    if (
      !item.iconSrc.startsWith(expectedCharacterPath) ||
      item.iconSrc.includes(forbiddenIconName)
    )
      errors.push(`Character icon mismatch: ${item.id}`);
    if (
      !item.assetSrcs.every(
        (layerSrc) =>
          layerSrc.startsWith(expectedCharacterPath) &&
          layerSrc.includes(expectedAssetPrefix) &&
          !layerSrc.includes(forbiddenAssetPrefix),
      )
    )
      errors.push(`Character layer mismatch: ${item.id}`);
    if (
      item.iconPresentation !== "framed-square" ||
      !item.iconSrc.includes(`icon-${expectedIconName}-`) ||
      !item.iconSrc.endsWith(".png")
    )
      errors.push(`Named wardrobe icon mismatch: ${item.id}`);
  }

  return errors;
}

if (process.env.NODE_ENV !== "production") {
  const manifestErrors = validateWardrobeManifest();
  if (manifestErrors.length)
    throw new Error(`Invalid wardrobe manifest:\n${manifestErrors.join("\n")}`);
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
  const selectedItems = (
    character: CharacterConfiguration,
    characterId: CharacterId,
  ) => {
    const selections: Array<{
      id: string | null;
      category: OutfitCategory;
    }> = [
      { id: character.hairId, category: "hair" },
      ...(character.onePieceId
        ? [{ id: character.onePieceId, category: "one-piece" as const }]
        : [
            { id: character.bottomId, category: "bottom" as const },
            { id: character.topId, category: "top" as const },
          ]),
      { id: character.shoesId, category: "shoes" },
      ...character.accessoryIds.map((id) => ({
        id,
        category: "accessory" as const,
      })),
    ];

    return selections.flatMap(({ category, id }) => {
      if (!id) return [];
      const item = getAsset(id);
      if (!item) return [];
      if (item.characterId !== characterId || item.category !== category)
        throw new Error(
          `Wardrobe item ${id} cannot render as ${characterId}/${category}`,
        );
      return [item];
    });
  };

  const equippedItems = [
    ...selectedItems(value.characterA, "character-a"),
    ...selectedItems(value.characterB, "character-b"),
  ];

  return [
    ...productionAssets.characterBases.map(
      ({ characterId, path, layerOrder }) => {
        const position = resolveLayerPosition(characterId, "base");
        return {
          assetId: `${characterId}-base`,
          path,
          layerOrder,
          characterId,
          kind: "base" as const,
          left: position.x,
          top: position.y,
        };
      },
    ),
    ...equippedItems.flatMap((asset) =>
      asset.assetSrcs.map((path, index) => {
        const position = asset.characterId
          ? resolveLayerPosition(asset.characterId, "wardrobe", asset)
          : { x: 0, y: 0 };
        return {
          assetId: asset.id,
          path,
          layerOrder: asset.layerOrder + index / 100,
          characterId: asset.characterId,
          kind: "wardrobe" as const,
          left: position.x,
          top: position.y,
        };
      }),
    ),
    {
      assetId: "white-chorus-watermark",
      path: productionAssets.watermarkPath,
      layerOrder: 1000,
      left: 0,
      top: 0,
      characterId: null,
      kind: "watermark" as const,
    },
  ].sort((left, right) => left.layerOrder - right.layerOrder);
}
