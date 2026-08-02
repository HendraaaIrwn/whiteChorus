import { backgroundAssets, getItems } from "@/features/dress-up/catalog";
import {
  type CharacterConfiguration,
  type CharacterId,
  type DressUpConfiguration,
} from "@/features/dress-up/model";

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function randomCharacter(
  characterId: CharacterId,
  random: () => number,
): CharacterConfiguration {
  const onePiece = random() > 0.5;
  return {
    hairId: pick(getItems(characterId, "hair"), random).id,
    topId: onePiece ? null : pick(getItems(characterId, "top"), random).id,
    bottomId: onePiece
      ? null
      : pick(getItems(characterId, "bottom"), random).id,
    onePieceId: onePiece
      ? pick(getItems(characterId, "one-piece"), random).id
      : null,
    shoesId: pick(getItems(characterId, "shoes"), random).id,
    accessoryIds:
      random() > 0.35
        ? [pick(getItems(characterId, "accessory"), random).id]
        : [],
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
