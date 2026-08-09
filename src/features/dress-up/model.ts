import { z } from "zod";

export const characterIds = ["character-a", "character-b"] as const;
export const categories = [
  "hair",
  "top",
  "bottom",
  "one-piece",
  "shoes",
  "accessory",
] as const;

export type CharacterId = (typeof characterIds)[number];
export type OutfitCategory = (typeof categories)[number];

export const characterConfigurationSchema = z
  .object({
    hairId: z.string().nullable(),
    topId: z.string().nullable(),
    bottomId: z.string().nullable(),
    onePieceId: z.string().nullable(),
    shoesId: z.string().nullable(),
    accessoryIds: z.array(z.string()).max(1),
  })
  .strict()
  .refine(
    (value) => !(value.onePieceId && (value.topId || value.bottomId)),
    "One Piece cannot be combined with Top or Bottom",
  );

export const dressUpConfigurationSchema = z
  .object({
    version: z.literal(1),
    backgroundId: z.string(),
    characterA: characterConfigurationSchema,
    characterB: characterConfigurationSchema,
  })
  .strict();

export type CharacterConfiguration = z.infer<
  typeof characterConfigurationSchema
>;
export type DressUpConfiguration = z.infer<typeof dressUpConfigurationSchema>;

export const emptyCharacter: CharacterConfiguration = {
  hairId: null,
  topId: null,
  bottomId: null,
  onePieceId: null,
  shoesId: null,
  accessoryIds: [],
};

export const defaultConfiguration: DressUpConfiguration = {
  version: 1,
  backgroundId: "background-01",
  characterA: {
    hairId: null,
    topId: "a-top-01",
    bottomId: "a-bottom-01",
    onePieceId: null,
    shoesId: "a-shoes-01",
    accessoryIds: [],
  },
  characterB: {
    hairId: null,
    topId: "b-top-01",
    bottomId: "b-bottom-01",
    onePieceId: null,
    shoesId: "b-shoes-01",
    accessoryIds: [],
  },
};

export const resetConfiguration: DressUpConfiguration = {
  version: 1,
  backgroundId: "background-01",
  characterA: { ...emptyCharacter },
  characterB: { ...emptyCharacter },
};

export function normalizeConfiguration(
  value: DressUpConfiguration,
): DressUpConfiguration {
  return {
    version: 1,
    backgroundId: value.backgroundId,
    characterA: {
      ...value.characterA,
      accessoryIds: [...value.characterA.accessoryIds].sort(),
    },
    characterB: {
      ...value.characterB,
      accessoryIds: [...value.characterB.accessoryIds].sort(),
    },
  };
}

export function selectItem(
  character: CharacterConfiguration,
  category: OutfitCategory,
  assetId: string | null,
): CharacterConfiguration {
  if (category === "one-piece")
    return { ...character, onePieceId: assetId, topId: null, bottomId: null };
  if (category === "top")
    return { ...character, topId: assetId, onePieceId: null };
  if (category === "bottom")
    return { ...character, bottomId: assetId, onePieceId: null };
  if (category === "hair") return { ...character, hairId: assetId };
  if (category === "shoes") return { ...character, shoesId: assetId };
  return { ...character, accessoryIds: assetId ? [assetId] : [] };
}

export function isPublishReady(value: DressUpConfiguration): boolean {
  return [value.characterA, value.characterB].every((character) =>
    Boolean(character.onePieceId || (character.topId && character.bottomId)),
  );
}
