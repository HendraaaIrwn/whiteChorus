import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { createOrRestoreGuest } from "@/features/guest-session/guest-session";
import { getPrisma } from "@/server/database/prisma";

const runDatabaseTests = process.env.RUN_DATABASE_TESTS === "1";
const prisma = runDatabaseTests ? getPrisma() : null;

describe.skipIf(!runDatabaseTests)("anonymous guest session", () => {
  it("stores only a token hash and restores the same guest", async () => {
    const request = new Request("http://localhost:3000/api/guest/session", {
      headers: {
        "x-forwarded-for": randomUUID(),
        "user-agent": "white-chorus-integration-test",
      },
    });
    const created = await createOrRestoreGuest(undefined, request);
    try {
      expect(created.rawToken).toBeTruthy();
      expect(created.guest.sessionTokenHash).not.toBe(created.rawToken);
      const restored = await createOrRestoreGuest(created.rawToken, request);
      expect(restored.guest.id).toBe(created.guest.id);
      expect(restored.rawToken).toBeUndefined();
    } finally {
      await prisma!.guest.delete({ where: { id: created.guest.id } });
      await prisma!.rateLimitCounter.deleteMany({
        where: { action: "SESSION_CREATE_HOURLY" },
      });
    }
  });
});
