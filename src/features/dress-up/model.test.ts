import { describe, expect, it } from "vitest";

import {
  defaultConfiguration,
  isPublishReady,
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

  it("always randomizes a publish-ready configuration", () => {
    expect(isPublishReady(randomizeConfiguration(() => 0.2))).toBe(true);
    expect(isPublishReady(randomizeConfiguration(() => 0.8))).toBe(true);
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
    expect(layers.at(-1)?.path).toBe("/brand/watermark-white.png");
  });
});
