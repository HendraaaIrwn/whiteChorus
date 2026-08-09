import { describe, expect, it } from "vitest";

import { assertSameOrigin } from "@/server/security/request-security";

describe("assertSameOrigin", () => {
  it("does not classify missing unrelated server configuration as an invalid origin", () => {
    const request = new Request("http://localhost:3000/api/guest/session", {
      headers: { origin: "http://localhost:3000" },
    });

    expect(() => assertSameOrigin(request)).not.toThrow();
  });

  it("rejects a cross-origin request", () => {
    const request = new Request("http://localhost:3000/api/guest/session", {
      headers: { origin: "https://attacker.example" },
    });

    expect(() => assertSameOrigin(request)).toThrow("INVALID_ORIGIN");
  });
});
