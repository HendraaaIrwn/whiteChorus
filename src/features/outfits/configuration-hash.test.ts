import { describe, expect, it } from "vitest";

import { defaultConfiguration } from "@/features/dress-up/model";
import { configurationHash } from "@/features/outfits/configuration-hash";

describe("configurationHash", () => {
  it("is stable after canonical accessory ordering", () => {
    const left = {
      ...defaultConfiguration,
      characterA: {
        ...defaultConfiguration.characterA,
        accessoryIds: ["a-accessory-02", "a-accessory-01"],
      },
    };
    const right = {
      ...left,
      characterA: {
        ...left.characterA,
        accessoryIds: [...left.characterA.accessoryIds].reverse(),
      },
    };
    expect(configurationHash(left)).toBe(configurationHash(right));
  });

  it("treats legacy and canonical wardrobe IDs as the same outfit", () => {
    const legacy = {
      ...defaultConfiguration,
      characterA: {
        ...defaultConfiguration.characterA,
        topId: "a-top-01",
        bottomId: "a-bottom-01",
        shoesId: "a-shoes-01",
      },
      characterB: {
        ...defaultConfiguration.characterB,
        topId: "b-top-01",
        bottomId: "b-bottom-01",
        shoesId: "b-shoes-01",
      },
    };

    expect(configurationHash(legacy)).toBe(
      configurationHash(defaultConfiguration),
    );
  });
});
