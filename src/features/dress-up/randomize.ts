import { backgroundAssets, getItems } from "@/features/dress-up/catalog";
import {
  type CharacterConfiguration,
  type CharacterId,
  type DressUpConfiguration,
} from "@/features/dress-up/model";

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function pickOptional<T>(items: T[], random: () => number): T | undefined {
  return items.length ? pick(items, random) : undefined;
}

function randomCharacter(
  characterId: CharacterId,
  random: () => number,
): CharacterConfiguration {
  const hair = pickOptional(getItems(characterId, "hair"), random);
  const top = pickOptional(getItems(characterId, "top"), random);
  const bottom = pickOptional(getItems(characterId, "bottom"), random);
  const onePiece = pickOptional(getItems(characterId, "one-piece"), random);
  const shoes = pickOptional(getItems(characterId, "shoes"), random);
  const accessory = pickOptional(getItems(characterId, "accessory"), random);
  const useOnePiece = Boolean(onePiece && (!top || !bottom || random() > 0.5));

  return {
    hairId: hair?.id ?? null,
    topId: useOnePiece ? null : (top?.id ?? null),
    bottomId: useOnePiece ? null : (bottom?.id ?? null),
    onePieceId: useOnePiece ? (onePiece?.id ?? null) : null,
    shoesId: shoes?.id ?? null,
    accessoryIds: accessory && random() > 0.35 ? [accessory.id] : [],
  };
}

export function randomizeConfiguration(
  random: () => number = Math.random,
): DressUpConfiguration {
  return {
    version: 1,
    backgroundId: pick(
      backgroundAssets.filter((asset) => asset.active),
      random,
    ).id,
    characterA: randomCharacter("character-a", random),
    characterB: randomCharacter("character-b", random),
  };
}
