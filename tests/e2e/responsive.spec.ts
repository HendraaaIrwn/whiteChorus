import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
] as const;

test("keeps the Studio usable at every acceptance width", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Responsive matrix runs in Chromium.");

  await page.setViewportSize(viewports[0]);
  await page.goto("/studio");

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${viewport.width}px must not overflow horizontally`,
    ).toBe(true);

    if (viewport.width < 768) {
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).toBeVisible();
      const visibleStageHeights = await page
        .locator(".studio-stage")
        .evaluateAll((elements) =>
          elements
            .map((element) => element.getBoundingClientRect())
            .filter((bounds) => bounds.width > 0 && bounds.height > 0)
            .map((bounds) => bounds.height),
        );
      expect(visibleStageHeights).toHaveLength(1);
      expect(visibleStageHeights[0]).toBeGreaterThan(viewport.height * 0.45);
      expect(visibleStageHeights[0]).toBeLessThan(viewport.height * 0.8);
      await expect(
        page.locator(".studio-cursor").filter({ visible: true }),
      ).toHaveCount(0);
      await expect(
        page.locator(".category-tabs").filter({ visible: true }),
      ).toHaveCSS("overflow-x", "auto");
      await expect(
        page.locator(".item-rail").filter({ visible: true }),
      ).toHaveCSS("overflow-x", "auto");
    } else {
      await expect(page.getByText("STUDIO · AUTO-SAVED")).toBeVisible();
    }

    if (viewport.width >= 768 && viewport.width < 1200) {
      const stageBounds = await page
        .locator(".studio-stage-panel")
        .evaluate((element) => element.getBoundingClientRect().toJSON());
      expect(stageBounds.top).toBeLessThan(viewport.height * 0.45);
      expect(stageBounds.bottom).toBeLessThanOrEqual(viewport.height + 1);
      expect(stageBounds.height).toBeGreaterThan(viewport.height * 0.55);
      expect(stageBounds.height).toBeLessThan(viewport.height * 0.7);
    }

    const categoryHeight = await page
      .getByRole("tab", { name: "ONE-PIECE" })
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(categoryHeight).toBeGreaterThanOrEqual(44);

    const railItemHeight = await page
      .getByRole("radio", { name: /hair 05/i })
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(railItemHeight).toBeGreaterThanOrEqual(44);

    const actionWidths = await page
      .locator(".studio-action")
      .filter({ visible: true })
      .evaluateAll((elements) =>
        elements.map((element) => ({
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
        })),
      );
    expect(
      actionWidths.every(
        ({ clientWidth, scrollWidth }) =>
          Boolean(clientWidth) && scrollWidth <= clientWidth + 1,
      ),
      `${viewport.width}px Studio CTA labels must remain untruncated`,
    ).toBe(true);

    if (viewport.width >= 1200) {
      const coreBottom = await page
        .locator(".studio-action-dock")
        .filter({ visible: true })
        .evaluate((element) => element.getBoundingClientRect().bottom);
      expect(coreBottom).toBeLessThanOrEqual(viewport.height + 1);
    }
  }
});

test("recomposes the homepage without horizontal overflow", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Responsive matrix runs in Chromium.");

  await page.setViewportSize(viewports[0]);
  await page.goto("/");

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${viewport.width}px homepage must not overflow horizontally`,
    ).toBe(true);

    const actionWidths = await page
      .locator(".home-action")
      .evaluateAll((elements) =>
        elements.map((element) => ({
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
        })),
      );
    expect(
      actionWidths.every(({ clientWidth, scrollWidth }) =>
        Boolean(clientWidth && scrollWidth <= clientWidth + 1),
      ),
      `${viewport.width}px CTA labels must remain untruncated`,
    ).toBe(true);

    const firstTeaserItemHeight = await page
      .locator(".home-teaser__item")
      .first()
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(firstTeaserItemHeight).toBeGreaterThanOrEqual(44);

    if (viewport.width < 768) {
      await expect(page.locator(".home-cursor")).toBeHidden();
      await expect(page.locator(".home-teaser__items")).toHaveCSS(
        "overflow-x",
        "auto",
      );
    }
  }
});

test("scopes the editorial Studio chrome without restyling other routes", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Route chrome is covered once in desktop Chromium.",
  );

  await page.goto("/studio");
  await expect(page.locator(".site-header--studio")).toBeVisible();
  await expect(page.locator(".site-footer--studio")).toBeVisible();

  await page.goto("/");
  await expect(page.locator(".site-header--home")).toBeVisible();
  await expect(page.locator(".site-header--studio")).toHaveCount(0);

  await page.goto("/hall-of-fame");
  await expect(page.locator(".site-header--hall")).toBeVisible();
  await expect(page.locator(".site-footer--hall")).toBeVisible();
  await expect(page.locator(".site-header--studio")).toHaveCount(0);
  await expect(page.locator(".site-footer--studio")).toHaveCount(0);

  await page.goto("/daily-winners");
  await expect(page.locator(".site-header--winners")).toBeVisible();
  await expect(page.locator(".site-footer--winners")).toBeVisible();
  await expect(page.locator(".site-header--hall")).toHaveCount(0);
  await expect(page.locator(".site-footer--hall")).toHaveCount(0);
});
