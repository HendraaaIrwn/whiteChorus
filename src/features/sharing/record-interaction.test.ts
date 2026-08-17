import { describe, expect, it } from "vitest";

import { shareSchema } from "@/features/sharing/record-interaction";

describe("shareSchema", () => {
  it("accepts Instagram and rejects new Telegram tracking", () => {
    expect(shareSchema.parse({ channel: "instagram" })).toEqual({
      channel: "instagram",
    });
    expect(shareSchema.safeParse({ channel: "telegram" }).success).toBe(false);
  });
});
