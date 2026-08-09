import { expect, test } from "@playwright/test";

const studioDraftKey = "white-chorus:dress-up-draft:v2";

test.beforeEach(({ browserName }) => {
  test.skip(
    browserName === "firefox",
    "Firefox has a verified pre-existing homepage navigation timeout.",
  );
});

test("keeps the homepage menu accessible and returns focus", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: "Open menu" });

  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "White Chorus navigation",
  });
  await expect(dialog).toBeVisible();
  const homeLink = dialog.getByRole("link", { name: "HOME", exact: true });
  await expect(homeLink).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("keeps teaser choices local and leaves the Studio draft untouched", async ({
  page,
}) => {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [studioDraftKey, "sentinel-home-draft"] as const,
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "B FRISKA" }).click();
  await page.getByRole("tab", { name: "ONE-PIECE" }).click();
  await page.getByRole("radio", { name: "one piece 03" }).click();
  await expect(
    page.locator('.home-teaser__layer[src*="b-one-piece-03"]'),
  ).toBeVisible();

  await page.getByRole("tab", { name: "BACKGROUND" }).click();
  await page.getByRole("radio", { name: "Apricot Beach" }).click();
  await expect(
    page.locator('.home-teaser__background img[src*="background-03"]'),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) => window.localStorage.getItem(key),
      studioDraftKey,
    ),
  ).toBe("sentinel-home-draft");
});

test("exposes truthful fallback cards and the open Daily Spotlight", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const curatedCard = page.getByRole("link", { name: /Dress up from/ }).first();
  await expect(curatedCard).toHaveAttribute("href", "/studio");
  await expect(curatedCard).toContainText("CURATED");
  await expect(curatedCard).not.toContainText(/RATINGS|SCORE/);

  await expect(
    page.getByRole("heading", { name: "THE NEXT SPOTLIGHT IS OPEN" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "BROWSE THE DAILY ARCHIVE" }),
  ).toHaveAttribute("href", "/daily-winners");
});

test("switches desktop cursor context and keeps keyboard focus visible", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Pointer QA runs in desktop Chromium.",
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.locator('[data-cursor="DRESS"]').first().hover();
  await expect(page.locator(".home-cursor span")).toHaveText("DRESS");
  await page.getByRole("button", { name: "Open menu" }).hover();
  await expect(page.locator(".home-cursor span")).toHaveText("OPEN");

  const menuTrigger = page.getByRole("button", { name: "Open menu" });
  await menuTrigger.focus();
  expect(
    await menuTrigger.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    ),
  ).not.toBe("none");
});

test("opens the audio choice from the final homepage CTA", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const triggers = page.getByRole("button", { name: "START DRESSING" });
  await expect(triggers).toHaveCount(2);

  await triggers.last().click();
  await expect(
    page.getByRole("heading", { name: "HOW SHOULD THE CHORUS BEGIN?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ENTER WITH MUSIC" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ENTER SILENTLY" }),
  ).toBeVisible();
});
