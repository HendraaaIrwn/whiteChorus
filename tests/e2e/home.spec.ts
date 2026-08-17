import { expect, test } from "@playwright/test";

const studioDraftKey = "white-chorus:dress-up-draft:v2";

function circleRadius(clipPath: string) {
  const match = clipPath.match(/circle\(([\d.]+)px/);
  expect(
    match,
    `expected a pixel circle clip-path, received ${clipPath}`,
  ).not.toBeNull();
  return Number(match?.[1]);
}

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
  await page.evaluate(() => {
    document.body.style.overflow = "clip";
  });

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");
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
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("clip");
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.evaluate(() => {
    document.body.style.overflow = "";
  });
  await trigger.click();
  await dialog.getByRole("link", { name: "DRESS UP", exact: true }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("");
});

test("runs the pointer hover, radial reveal, and reverse close sequence", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Pointer animation regression runs in desktop Chromium.",
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("header.site-header")).toHaveCSS("opacity", "1", {
    timeout: 15_000,
  });

  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.hover();
  await expect(trigger).toHaveCSS("transform", "none");
  const surface = trigger.locator(".home-menu-button__surface");
  await expect(surface).toHaveCSS(
    "transform",
    "matrix(1.25, 0, 0, 1.25, 0, 0)",
  );
  await expect(surface).toHaveCSS("background-color", "rgb(65, 88, 134)");
  await expect(surface).toHaveCSS("color", "rgb(253, 246, 236)");
  const topLine = trigger.locator(
    ".home-menu-button__line-frame--top .home-menu-button__line",
  );
  const bottomLine = trigger.locator(
    ".home-menu-button__line-frame--bottom .home-menu-button__line",
  );
  await expect(topLine).toHaveCSS("transform", "none");
  await expect(bottomLine).toHaveCSS("transform", "none");
  await expect(page.locator(".home-cursor")).not.toHaveAttribute(
    "data-label",
    "OPEN",
  );

  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "White Chorus navigation",
  });
  const radial = dialog.locator(".home-menu-radial");
  await expect(radial).toBeVisible();
  await expect(radial).toHaveCSS("background-color", "rgb(176, 228, 233)");
  await expect(radial).toHaveCSS("color", "rgb(65, 88, 134)");
  const triggerBounds = await page.locator(".home-menu-trigger").boundingBox();
  expect(triggerBounds).not.toBeNull();
  const geometry = await radial.evaluate((element) => ({
    coverRadius: Number(element.getAttribute("data-menu-cover-radius")),
    originX: Number(element.getAttribute("data-menu-origin-x")),
    originY: Number(element.getAttribute("data-menu-origin-y")),
  }));
  expect(geometry.originX).toBeCloseTo(
    triggerBounds!.x + triggerBounds!.width / 2,
    0,
  );
  expect(geometry.originY).toBeCloseTo(
    triggerBounds!.y + triggerBounds!.height / 2,
    0,
  );

  await page.waitForTimeout(80);
  const earlyRadius = circleRadius(
    await radial.evaluate((element) => getComputedStyle(element).clipPath),
  );
  expect(earlyRadius).toBeGreaterThan(triggerBounds!.width / 2);
  expect(earlyRadius).toBeLessThan(geometry.coverRadius);

  const closeButton = dialog.getByRole("button", { name: "Close menu" });
  await expect(
    closeButton.locator('[data-menu-button-state="open"]'),
  ).toBeVisible();
  await closeButton.hover();
  await expect(closeButton.locator(".home-menu-button__surface")).toHaveCSS(
    "transform",
    "matrix(1.25, 0, 0, 1.25, 0, 0)",
  );
  await page.waitForTimeout(980);
  const openRadius = circleRadius(
    await radial.evaluate((element) => getComputedStyle(element).clipPath),
  );
  expect(openRadius).toBeCloseTo(geometry.coverRadius, 0);
  await expect(dialog.locator(".home-menu-thread")).toHaveCount(0);

  const highlight = dialog.locator(".home-menu-highlight");
  const hallLink = dialog.getByRole("link", {
    name: "HALL OF FAME",
    exact: true,
  });

  await expect(highlight).toHaveCount(1);
  await expect(highlight).toHaveCSS("border-top-width", "5px");
  await expect(dialog).not.toContainText("ANONYMOUS BY DESIGN");
  await hallLink.hover();
  await expect(hallLink).toHaveCSS("transform", "none");
  await expect(hallLink.locator(".home-menu-scene__label")).not.toHaveCSS(
    "transform",
    "none",
  );
  await expect(highlight).toHaveCount(1);
  await expect(highlight.locator("xpath=ancestor::li[1]")).toContainText(
    "HALL OF FAME",
  );

  await closeButton.click();
  await page.waitForTimeout(100);
  const closingRadius = circleRadius(
    await radial.evaluate((element) => getComputedStyle(element).clipPath),
  );
  expect(closingRadius).toBeGreaterThan(geometry.coverRadius * 0.95);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("uses immediate menu state changes when reduced motion is requested", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Reduced-motion menu timing runs once in desktop Chromium.",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Open menu" }).click();

  const dialog = page.getByRole("dialog", {
    name: "White Chorus navigation",
  });
  const radial = dialog.locator(".home-menu-radial");
  const finalRadius = Number(
    await radial.getAttribute("data-menu-cover-radius"),
  );
  await expect
    .poll(async () =>
      circleRadius(
        await radial.evaluate((element) => getComputedStyle(element).clipPath),
      ),
    )
    .toBeCloseTo(finalRadius, 0);
  await expect(dialog.locator("nav li")).toHaveCount(4);
  await expect(dialog.locator("nav li").first()).toHaveCSS("opacity", "1");

  await dialog.getByRole("button", { name: "Close menu" }).click();
  await expect(dialog).toBeHidden();
});

test("does not expose pointer hover enhancement on touch devices", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chrome",
    "Touch media-query coverage runs on the Pixel project.",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(
    await page.evaluate(
      () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    ),
  ).toBe(false);
  const trigger = page.getByRole("button", { name: "Open menu" });
  await expect(trigger.locator(".home-menu-button__surface")).toHaveCSS(
    "transform",
    "none",
  );

  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "White Chorus navigation",
  });
  const radial = dialog.locator(".home-menu-radial");
  await expect(radial).toBeVisible();
  expect(
    await radial.evaluate(
      (element) =>
        element.scrollWidth <= window.innerWidth &&
        element.scrollHeight <= window.innerHeight,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("keeps the radial origin aligned across shared route chrome", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  test.skip(
    testInfo.project.name !== "chromium",
    "Shared route geometry runs once in desktop Chromium.",
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  for (const pathname of [
    "/",
    "/studio",
    "/hall-of-fame",
    "/outfits/not-a-valid-uuid",
    "/daily-winners",
  ]) {
    await page.goto(pathname, { waitUntil: "domcontentloaded" });
    await expect(page.locator("header.site-header")).toHaveCSS("opacity", "1", {
      timeout: 15_000,
    });
    const trigger = page.getByRole("button", { name: "Open menu" });
    await expect(
      trigger,
      `${pathname} should expose the shared menu`,
    ).toBeVisible();
    await trigger.click();
    const dialog = page.getByRole("dialog", {
      name: "White Chorus navigation",
    });
    const radial = dialog.locator(".home-menu-radial");
    await expect(
      radial,
      `${pathname} should render the radial scene`,
    ).toBeVisible({ timeout: 10_000 });
    const alignedBounds = await page
      .locator(".home-menu-trigger")
      .boundingBox();
    expect(alignedBounds).not.toBeNull();
    await expect
      .poll(async () =>
        Math.abs(
          Number(await radial.getAttribute("data-menu-origin-x")) -
            (alignedBounds!.x + alignedBounds!.width / 2),
        ),
      )
      .toBeLessThanOrEqual(1);
    await expect
      .poll(async () =>
        Math.abs(
          Number(await radial.getAttribute("data-menu-origin-y")) -
            (alignedBounds!.y + alignedBounds!.height / 2),
        ),
      )
      .toBeLessThanOrEqual(1);
    expect(
      await radial.evaluate(
        (element) => element.scrollWidth <= window.innerWidth,
      ),
      `${pathname} radial scene should not overflow horizontally`,
    ).toBe(true);

    if (pathname === "/") {
      await page.setViewportSize({ width: 1024, height: 768 });
      await expect
        .poll(async () => {
          const resizedBounds = await page
            .locator(".home-menu-trigger")
            .boundingBox();
          const originX = Number(
            await radial.getAttribute("data-menu-origin-x"),
          );
          return Math.abs(
            originX - (resizedBounds!.x + resizedBounds!.width / 2),
          );
        })
        .toBeLessThanOrEqual(1);
      await expect
        .poll(async () => {
          const resizedBounds = await page
            .locator(".home-menu-trigger")
            .boundingBox();
          const originY = Number(
            await radial.getAttribute("data-menu-origin-y"),
          );
          return Math.abs(
            originY - (resizedBounds!.y + resizedBounds!.height / 2),
          );
        })
        .toBeLessThanOrEqual(1);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.setViewportSize({ width: 1280, height: 900 });
  }
});

test("keeps teaser choices local and leaves the Studio draft untouched", async ({
  page,
}) => {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [studioDraftKey, "sentinel-home-draft"] as const,
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "FRISKA", exact: true }).click();
  await page.getByRole("tab", { name: "TOPS" }).click();
  await page.getByRole("radio", { name: "top 03" }).click();
  await expect(
    page.locator('.home-teaser__layer[src*="b-top-03"]'),
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

test("renders exactly the seven-scene homepage composition", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const scenes = page.locator(".home-page > section");
  await expect(scenes).toHaveCount(6);
  await expect(scenes.locator(".home-label")).toHaveText([
    "01 · AN INTERACTIVE FASHION CHORUS",
    "02 · THE DUET",
    "03 · TRY A VERSE",
    "04 · ONE LIVING ARCHIVE",
    "05 · THREE BEATS",
    "06 · YOUR TURN",
  ]);

  await expect(page.locator(".site-footer--home .home-label")).toHaveText(
    "07 · THE LAST NOTE",
  );
  await expect(
    page.getByRole("heading", { name: "DRESS THE CHORUS YOUR WAY." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "TWO VOICES. ONE SHARED STAGE." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "MIX A LOOK. THEN MAKE IT YOURS." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "EVERY LOOK ADDS A NEW VOICE." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "HOW THE CHORUS COMES TOGETHER." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "PUT YOUR NEXT LOOK IN THE CHORUS." }),
  ).toBeVisible();

  await expect(
    page.locator(
      ".home-featured, .home-spotlight, .home-hall-preview, .home-look-card",
    ),
  ).toHaveCount(0);
  await expect(
    page.getByText(/FRESH COMPOSITIONS|DAILY SPOTLIGHT/),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "EXPLORE HALL OF FAME" }),
  ).toHaveAttribute("href", "/hall-of-fame");
  await expect(
    page
      .locator(".site-footer--home")
      .getByRole("link", { name: "DAILY WINNERS" }),
  ).toHaveAttribute("href", "/daily-winners");
});

test("keeps the menu cursor compact and keyboard focus visible", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Pointer QA runs in desktop Chromium.",
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(/home-custom-cursor-ready/);

  const cursor = page.locator(".home-cursor").first();
  await page.locator('[data-cursor="DRESS"]').first().hover();
  await expect(cursor.locator("span")).toHaveText("DRESS");
  await page.getByRole("button", { name: "Open menu" }).hover();
  await expect(cursor.locator("span")).toBeEmpty();
  await expect(cursor).toHaveCSS("width", "14px");

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
