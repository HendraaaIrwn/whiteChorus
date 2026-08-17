import { describe, expect, it } from "vitest";

import {
  defaultConfiguration,
  emptyCharacter,
  isPublishReady,
  resetConfiguration,
  selectItem,
} from "@/features/dress-up/model";
import {
  CHARACTER_STAGE,
  CHARACTER_WARDROBE_OFFSET,
  getAsset,
  renderLayersFor,
  resolveLayerPosition,
  validateCatalogConfiguration,
  wardrobeManifest,
} from "@/features/dress-up/catalog";
import { randomizeConfiguration } from "@/features/dress-up/randomize";

describe("dress-up model", () => {
  it("keeps One Piece exclusive with Top and Bottom", () => {
    const next = selectItem(
      defaultConfiguration.characterA,
      "one-piece",
      "a-one-piece-01",
    );
    expect(next).toMatchObject({
      onePieceId: "a-one-piece-01",
      topId: null,
      bottomId: null,
    });
  });

  it("removes the active accessory without changing the other layers", () => {
    const current = {
      ...defaultConfiguration.characterA,
      accessoryIds: ["a-accessory-03"],
    };
    expect(selectItem(current, "accessory", null)).toEqual({
      ...current,
      accessoryIds: [],
    });
  });

  it("always randomizes a publish-ready configuration", () => {
    for (const value of [
      randomizeConfiguration(() => 0.2),
      randomizeConfiguration(() => 0.8),
    ]) {
      expect(isPublishReady(value)).toBe(true);
      for (const character of [value.characterA, value.characterB]) {
        expect(character.hairId).toBeNull();
        expect(character.topId).toMatch(/^(emir|friska)-top-0[1-3]$/);
        expect(character.bottomId).toMatch(/^(emir|friska)-bottom-0[1-3]$/);
        expect(character.onePieceId).toBeNull();
        expect(character.shoesId).toMatch(/^(emir|friska)-shoes-0[1-3]$/);
        expect(character.accessoryIds).toEqual([]);
      }
    }
  });

  it("resets both characters to their unstyled base state", () => {
    expect(resetConfiguration.backgroundId).toBe("background-01");
    expect(resetConfiguration.characterA).toEqual(emptyCharacter);
    expect(resetConfiguration.characterB).toEqual(emptyCharacter);
    expect(isPublishReady(resetConfiguration)).toBe(false);
  });

  it("rejects an asset used in the wrong category", () => {
    expect(
      validateCatalogConfiguration({
        ...defaultConfiguration,
        characterA: {
          ...defaultConfiguration.characterA,
          topId: "a-hair-01",
        },
      }),
    ).toEqual(["Invalid asset a-hair-01"]);
  });

  it("orders both character bases, outfit layers, and watermark deterministically", () => {
    const layers = renderLayersFor(defaultConfiguration);
    const friskaTop = getAsset("friska-top-01");
    const friskaTopPosition = resolveLayerPosition(
      "character-b",
      "wardrobe",
      friskaTop,
    );
    expect(layers[0]?.path).toBe("/dress-up/character-a/base.webp");
    expect(
      layers.findIndex((layer) => layer.path.includes("character-b/base")),
    ).toBeGreaterThan(
      layers.findIndex((layer) => layer.path.includes("character-a/tops")),
    );
    expect(
      layers.find((layer) => layer.path.includes("character-b/base"))?.top,
    ).toBe(CHARACTER_STAGE["character-b"].y);
    expect(
      layers.find((layer) => layer.path.includes("character-b/base"))?.left,
    ).toBe(CHARACTER_STAGE["character-b"].x);
    expect(
      layers.find((layer) => layer.path.includes("character-b/tops"))?.top,
    ).toBe(friskaTopPosition.y);
    expect(
      layers.find((layer) => layer.path.includes("character-b/tops"))?.left,
    ).toBe(friskaTopPosition.x);
    expect(friskaTopPosition.x).toBeGreaterThan(
      CHARACTER_STAGE["character-b"].x +
        CHARACTER_WARDROBE_OFFSET["character-b"].x -
        10,
    );
    expect(
      layers.find((layer) => layer.path.includes("character-a/base"))?.top,
    ).toBe(0);
    expect(
      layers.find((layer) => layer.path.includes("character-a/base")),
    ).toMatchObject({ characterId: "character-a", kind: "base" });
    expect(
      layers.find((layer) => layer.path.includes("character-b/tops")),
    ).toMatchObject({ characterId: "character-b", kind: "wardrobe" });
    expect(layers.at(-1)).toMatchObject({
      path: "/brand/watermark-white.png",
      characterId: null,
      kind: "watermark",
      layerOrder: 1000,
    });
  });

  it("keeps Friska base fixed while shifting only wardrobe layers right", () => {
    const base = resolveLayerPosition("character-b", "base");
    const top = resolveLayerPosition(
      "character-b",
      "wardrobe",
      getAsset("friska-top-01"),
    );
    const emirTop = resolveLayerPosition(
      "character-a",
      "wardrobe",
      getAsset("emir-top-01"),
    );

    expect(base).toEqual({
      x: CHARACTER_STAGE["character-b"].x,
      y: CHARACTER_STAGE["character-b"].y,
    });
    expect(base).toEqual({ x: 0, y: 30 });
    expect(top.x).toBeGreaterThan(base.x);
    expect(top.y).toBe(base.y);
    expect(emirTop).toEqual({ x: 0, y: 0 });
  });

  it("renders Friska shoes behind her bottom layer", () => {
    const friskaBottom = wardrobeManifest.find(
      (item) => item.id === "friska-bottom-01",
    );
    const friskaShoes = wardrobeManifest.find(
      (item) => item.id === "friska-shoes-01",
    );
    expect(friskaBottom).toBeDefined();
    expect(friskaShoes).toBeDefined();
    expect(friskaShoes!.layerOrder).toBeLessThan(friskaBottom!.layerOrder);
  });

  it("renders Emir shoes behind his bottom layer", () => {
    const emirBottom = wardrobeManifest.find(
      (item) => item.id === "emir-bottom-01",
    );
    const emirShoes = wardrobeManifest.find(
      (item) => item.id === "emir-shoes-01",
    );
    expect(emirBottom).toBeDefined();
    expect(emirShoes).toBeDefined();
    expect(emirShoes!.layerOrder).toBeLessThan(emirBottom!.layerOrder);
  });
});
