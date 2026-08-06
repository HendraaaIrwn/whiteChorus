import { expect, test } from "@playwright/test";

test("keeps homepage content usable through the enhanced scroll choreography", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");

  const title = page.getByRole("heading", { name: "DRESS. CREATE. CHORUS." });
  const processTitle = page.getByRole("heading", { name: "HOW IT WORKS" });
  await expect(title).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Replay the animated guest avatar" }),
  ).toBeAttached();

  await processTitle.scrollIntoViewIfNeeded();
  await expect(processTitle).toBeVisible();
  await expect(page.getByText("DRESS THE DUO")).toBeVisible();

  await title.scrollIntoViewIfNeeded();
  await expect(title).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("uses static homepage fallbacks when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "DRESS. CREATE. CHORUS." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Replay the animated guest avatar" }),
  ).toHaveCount(0);
  await expect(page.locator(".rive-avatar-fallback")).toBeVisible();
  await expect(page.locator(".home-scroll-rail")).toBeHidden();
  await expect(page.locator(".hero-stage__spring-layer")).toHaveCSS(
    "transform",
    "none",
  );
});

test("enters silently and restores a saved studio draft", async ({ page }) => {
  await page.route("**/api/guest/session", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { expiresAt: "2026-08-09T00:00:00.000Z" },
      }),
    });
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "DRESS. CREATE. CHORUS." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ENTER SILENTLY" }).click();

  await expect(page).toHaveURL(/\/studio$/);
  await expect(
    page.getByRole("heading", { name: "STYLE EMIR & FRISKA" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "ONE-PIECE" }).click();
  await page.getByRole("radio", { name: "ONE PIECE 02" }).click();
  await expect(
    page.getByRole("radio", { name: "ONE PIECE 02" }),
  ).toHaveAttribute("aria-checked", "true");
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("white-chorus:dress-up-draft:v1"),
      ),
    )
    .toContain('"onePieceId":"a-one-piece-02"');

  await page.reload();
  await page.getByRole("tab", { name: "ONE-PIECE" }).click();
  await expect(
    page.getByRole("radio", { name: "ONE PIECE 02" }),
  ).toHaveAttribute("aria-checked", "true");

  await page.evaluate(() => {
    const draft = JSON.parse(
      window.localStorage.getItem("white-chorus:dress-up-draft:v1")!,
    ) as { characterA: { topId: string } };
    draft.characterA.topId = "a-hair-01";
    window.localStorage.setItem(
      "white-chorus:dress-up-draft:v1",
      JSON.stringify(draft),
    );
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("white-chorus:dress-up-draft:v1"),
      ),
    )
    .toContain('"topId":"a-top-01"');
});

test("reports an audio failure without blocking studio entry", async ({
  page,
}) => {
  await page.route("**/api/guest/session", async (route) => {
    await route.fulfill({ contentType: "application/json", body: "{}" });
  });
  await page.route("**/audio/white-chorus-theme.mp3", async (route) => {
    await route.abort();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "ENTER WITH MUSIC" }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(
    page.getByRole("button", { name: "Music unavailable" }),
  ).toBeVisible();
});

test("shows brief publish success feedback", async ({ page }) => {
  await page.route("**/api/guest/session", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: {} }),
    });
  });
  await page.route("**/api/outfits", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { url: "/outfits/animated-look" },
      }),
    });
  });

  await page.goto("/studio");
  await page.getByRole("button", { name: "PUBLISH TO HALL OF FAME" }).click();

  await expect(page.getByText("LOOK IS LIVE!")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "VIEW YOUR LOOK" }),
  ).toBeVisible();
  await expect(
    page.getByText("Publish complete. Your look is live."),
  ).toBeVisible();
});

test("keeps repeated studio interactions usable with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/studio");

  await expect
    .poll(() =>
      page.evaluate(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    )
    .toBe(true);

  const friska = page.getByRole("button", { name: "DRESS FRISKA" });
  await friska.click();
  await expect(friska).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("tab", { name: "ACCESSORY" }).click();
  const accessory = page.getByRole("radio", { name: "ACCESSORY 03" });
  await accessory.click();
  await expect(accessory).toHaveAttribute("aria-checked", "true");

  await page.getByRole("tab", { name: "HAIR" }).click();
  await page.getByRole("tab", { name: "ACCESSORY" }).click();
  await expect(accessory).toHaveAttribute("aria-checked", "true");
});
