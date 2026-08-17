import { describe, expect, it } from "vitest";

import {
  defaultConfiguration,
  emptyCharacter,
  isPublishReady,
  resetConfiguration,
  selectItem,
} from "@/features/dress-up/model";
import {
  renderLayersFor,
  validateCatalogConfiguration,
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
    expect(layers[0]?.path).toBe("/dress-up/character-a/base.webp");
    expect(
      layers.findIndex((layer) => layer.path.includes("character-b/base")),
    ).toBeGreaterThan(
      layers.findIndex((layer) => layer.path.includes("character-a/tops")),
    );
    expect(
      layers.find((layer) => layer.path.includes("character-b/base"))?.top,
    ).toBe(30);
    expect(
      layers.find((layer) => layer.path.includes("character-b/base"))?.left,
    ).toBe(48);
    expect(
      layers.find((layer) => layer.path.includes("character-b/tops"))?.top,
    ).toBe(30);
    expect(
      layers.find((layer) => layer.path.includes("character-b/tops"))?.left,
    ).toBe(48);
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
});
