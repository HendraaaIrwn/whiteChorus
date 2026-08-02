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
});
