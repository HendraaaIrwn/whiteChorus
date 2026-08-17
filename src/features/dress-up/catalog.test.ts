import { describe, expect, it } from "vitest";

import {
  CHARACTER_STAGE,
  CHARACTER_WARDROBE_OFFSET,
  dressUpAssets,
  getAsset,
  getItems,
  normalizeCatalogConfiguration,
  renderLayersFor,
  resolveLayerPosition,
  validateWardrobeManifest,
  wardrobeManifest,
} from "@/features/dress-up/catalog";
import {
  defaultConfiguration,
  type DressUpConfiguration,
} from "@/features/dress-up/model";

const realWardrobeCategories = [
  ["top", "tops"],
  ["bottom", "bottoms"],
  ["shoes", "shoes"],
] as const;

const realWardrobeCharacters = [
  ["character-a", "emir", "a"],
  ["character-b", "friska", "b"],
] as const;

describe("dress-up asset catalog", () => {
  it("maps all supplied icons and equipped layers without crossing characters", () => {
    const realAssets = dressUpAssets.filter(
      (asset) => asset.iconPresentation === "framed-square",
    );
    expect(realAssets).toHaveLength(18);

    for (const [
      characterId,
      characterName,
      assetPrefix,
    ] of realWardrobeCharacters) {
      for (const [category, folder] of realWardrobeCategories) {
        for (const variant of [1, 2, 3]) {
          const number = String(variant).padStart(2, "0");
          const canonicalId = `${characterName}-${category}-${number}`;
          const legacyId = `${assetPrefix}-${category}-${number}`;
          const asset = getAsset(canonicalId);

          expect(asset).toMatchObject({
            id: canonicalId,
            characterId,
            category,
            iconPresentation: "framed-square",
            iconSrc: `/dress-up/${characterId}/icons/icon-${characterName}-${category}-${number}.png`,
            assetSrcs: [
              `/dress-up/${characterId}/${folder}/${assetPrefix}-${category}-${number}.webp`,
            ],
          });
          expect(getAsset(legacyId)).toBe(asset);
          expect(asset?.iconSrc).not.toContain(
            characterName === "emir" ? "friska" : "emir",
          );
          expect(asset?.assetSrcs).not.toContain(asset?.iconSrc);
        }
      }
    }
  });

  it("exposes only real icon and equipped-layer pairs", () => {
    expect(wardrobeManifest).toHaveLength(18);
    expect(validateWardrobeManifest()).toEqual([]);
    expect(new Set(wardrobeManifest.map((item) => item.id))).toHaveProperty(
      "size",
      18,
    );

    for (const [characterId] of realWardrobeCharacters) {
      expect(getItems(characterId, "top")).toHaveLength(3);
      expect(getItems(characterId, "bottom")).toHaveLength(3);
      expect(getItems(characterId, "shoes")).toHaveLength(3);
      expect(getItems(characterId, "hair")).toEqual([]);
      expect(getItems(characterId, "one-piece")).toEqual([]);
      expect(getItems(characterId, "accessory")).toEqual([]);
    }

    expect(
      wardrobeManifest.every(
        (item) =>
          item.iconPresentation === "framed-square" &&
          item.iconSrc.endsWith(".png") &&
          item.assetSrcs.length === 1 &&
          item.assetSrcs[0]?.endsWith(".webp"),
      ),
    ).toBe(true);
    expect(
      wardrobeManifest.some((item) => item.iconSrc.includes("/thumbnails/")),
    ).toBe(false);

    expect(defaultConfiguration.characterA).toMatchObject({
      topId: "emir-top-01",
      bottomId: "emir-bottom-01",
      shoesId: "emir-shoes-01",
    });
    expect(defaultConfiguration.characterB).toMatchObject({
      topId: "friska-top-01",
      bottomId: "friska-bottom-01",
      shoesId: "friska-shoes-01",
    });
  });

  it("renders equipped layers and never wardrobe icon sources", () => {
    const configuration: DressUpConfiguration = {
      ...defaultConfiguration,
      characterA: {
        ...defaultConfiguration.characterA,
        topId: "emir-top-03",
      },
      characterB: {
        ...defaultConfiguration.characterB,
        topId: "friska-top-02",
      },
    };
    const layers = renderLayersFor(configuration);
    const paths = layers.map((layer) => layer.path);

    expect(paths).toContain("/dress-up/character-a/tops/a-top-03.webp");
    expect(paths).toContain("/dress-up/character-b/tops/b-top-02.webp");
    expect(paths.some((path) => path.includes("/icons/"))).toBe(false);
  });

  it("migrates legacy draft IDs to the canonical item IDs", () => {
    const legacyConfiguration: DressUpConfiguration = {
      ...defaultConfiguration,
      characterA: {
        hairId: "a-hair-02",
        topId: "a-top-03",
        bottomId: "a-bottom-01",
        onePieceId: null,
        shoesId: "a-shoes-02",
        accessoryIds: ["a-accessory-04"],
      },
      characterB: {
        hairId: "b-hair-01",
        topId: null,
        bottomId: null,
        onePieceId: "b-one-piece-05",
        shoesId: "b-shoes-03",
        accessoryIds: ["b-accessory-02"],
      },
    };

    expect(normalizeCatalogConfiguration(legacyConfiguration)).toMatchObject({
      characterA: {
        hairId: null,
        topId: "emir-top-03",
        bottomId: "emir-bottom-01",
        shoesId: "emir-shoes-02",
        accessoryIds: [],
      },
      characterB: {
        hairId: null,
        onePieceId: null,
        shoesId: "friska-shoes-03",
        accessoryIds: [],
      },
    });
  });

  it("refuses to render an item on the other character", () => {
    expect(() =>
      renderLayersFor({
        ...defaultConfiguration,
        characterA: {
          ...defaultConfiguration.characterA,
          topId: "friska-top-01",
        },
      }),
    ).toThrow("cannot render as character-a/top");
  });

  it("resolves Friska wardrobe positions without moving her base body", () => {
    const base = resolveLayerPosition("character-b", "base");
    expect(base).toEqual({
      x: CHARACTER_STAGE["character-b"].x,
      y: CHARACTER_STAGE["character-b"].y,
    });
    expect(base).toEqual({ x: 0, y: 30 });

    const top01 = getAsset("friska-top-01");
    const bottom02 = getAsset("friska-bottom-02");
    const shoes03 = getAsset("friska-shoes-03");
    expect(top01?.registrationOffset).toEqual({ x: 1, y: 0 });
    expect(bottom02?.registrationOffset).toEqual({ x: 1, y: 0 });
    expect(shoes03?.registrationOffset).toEqual({ x: 0, y: 0 });

    const topPosition = resolveLayerPosition("character-b", "wardrobe", top01);
    expect(topPosition).toEqual({
      x:
        base.x +
        CHARACTER_WARDROBE_OFFSET["character-b"].x +
        (top01?.registrationOffset?.x ?? 0),
      y:
        base.y +
        CHARACTER_WARDROBE_OFFSET["character-b"].y +
        (top01?.registrationOffset?.y ?? 0),
    });
    expect(topPosition.x).toBe(107);
    expect(topPosition.y).toBe(30);

    const layers = renderLayersFor(defaultConfiguration);
    const friskaBase = layers.find((layer) => layer.assetId === "character-b-base");
    const friskaTop = layers.find((layer) => layer.assetId === "friska-top-01");
    const emirTop = layers.find((layer) => layer.assetId === "emir-top-01");
    expect(friskaBase).toMatchObject({ left: 0, top: 30, kind: "base" });
    expect(friskaTop).toMatchObject({ left: 107, top: 30, kind: "wardrobe" });
    expect(emirTop).toMatchObject({ left: 0, top: 0, kind: "wardrobe" });

    // Shoes remain behind bottom in paint order.
    const friskaShoes = layers.find((layer) => layer.assetId === "friska-shoes-01");
    const friskaBottom = layers.find(
      (layer) => layer.assetId === "friska-bottom-01",
    );
    expect(friskaShoes!.layerOrder).toBeLessThan(friskaBottom!.layerOrder);
  });
});
