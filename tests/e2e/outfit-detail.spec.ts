import { expect, test, type Page } from "@playwright/test";

const detailViewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
] as const;

async function firstLookHref(page: Page) {
  await page.goto("/hall-of-fame");
  const firstLook = page.locator(".hall-look__media-link").first();
  await expect(firstLook).toBeVisible();
  const href = await firstLook.getAttribute("href");
  expect(href).toMatch(/^\/outfits\//);
  return href!;
}

async function openFirstLook(page: Page) {
  const href = await firstLookHref(page);
  await page.goto(href);
  await expect(page.locator("[data-look-detail-page]")).toBeVisible();
  return href;
}

test("renders one editorial look before rating, Related Looks, and the shared editorial footer", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Editorial structure is covered once in desktop Chromium.",
  );

  await openFirstLook(page);

  await expect(
    page.getByRole("heading", { level: 1, name: /^Look #/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: /complete White Chorus outfit composition/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/RATE THIS LOOK|THE RATING/)).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "RELATED LOOKS" }),
  ).toBeVisible();
  const relatedCount = await page
    .locator(".look-detail__related-grid .hall-look")
    .count();
  expect(relatedCount).toBeGreaterThan(0);
  expect(relatedCount).toBeLessThanOrEqual(4);
  await expect(page.locator(".site-header--hall")).toBeVisible();
  const footer = page.locator(".site-footer--hall.site-footer--editorial");
  await expect(footer).toBeVisible();
  await expect(footer.locator(".home-label")).toHaveText("05 · THE LAST LOOK");
  await expect(footer.locator("[data-footer-title-reveal]")).toBeVisible();
  await expect(footer.locator("[data-footer-wave-reveal]")).toHaveCount(1);
  await expect(footer.locator("[data-footer-spark-reveal]")).toHaveCount(3);
  await expect(footer.getByRole("link")).toHaveText([
    "HOME",
    "DRESS UP",
    "HALL OF FAME",
    "DAILY WINNERS",
  ]);
  await expect(page.locator(".hall-cta")).toHaveCount(0);
  await expect(
    page.locator(".look-detail__hero + .look-detail__related"),
  ).toBeVisible();
});

test("uses explicit Hall, Daily Winner, and direct-access back contexts", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Origin-aware navigation is covered once in desktop Chromium.",
  );

  await page.goto("/hall-of-fame?sort=newest&page=1");
  const hallLink = page.locator(".hall-look__media-link").first();
  await expect(hallLink).toBeVisible();
  const hallHref = await hallLink.getAttribute("href");
  const hallUrl = new URL(hallHref!, "http://localhost");
  expect(hallUrl.searchParams.get("from")).toBe("hall-of-fame");
  expect(hallUrl.searchParams.get("returnTo")).toBe(
    "/hall-of-fame?sort=newest&page=1",
  );

  await hallLink.click();
  const backLink = page.locator(".look-detail__back");
  await expect(backLink).toHaveText(/BACK TO HALL OF FAME/);
  await expect(backLink).toHaveAttribute(
    "href",
    "/hall-of-fame?sort=newest&page=1",
  );
  await backLink.click();
  await expect(page).toHaveURL(/\/hall-of-fame\?sort=newest&page=1$/);

  const directPath = hallUrl.pathname;
  await page.goto(`${directPath}?from=daily-winner&returnTo=%2Fdaily-winners`);
  await expect(backLink).toHaveText(/BACK TO DAILY WINNER/);
  await expect(backLink).toHaveAttribute("href", "/daily-winners");
  await backLink.click();
  await expect(page).toHaveURL(/\/daily-winners$/);

  await page.goto(directPath);
  await expect(backLink).toHaveText(/BACK TO HALL OF FAME/);
  await expect(backLink).toHaveAttribute("href", "/hall-of-fame");
});

test("preserves the original source while opening another related look", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Related navigation context is covered once in desktop Chromium.",
  );

  const firstHref = await firstLookHref(page);
  await page.goto(firstHref);
  const relatedLink = page
    .locator(".look-detail__related .hall-look__media-link")
    .first();
  test.skip(
    (await relatedLink.count()) === 0,
    "No real related look available.",
  );

  const relatedHref = await relatedLink.getAttribute("href");
  const relatedUrl = new URL(relatedHref!, "http://localhost");
  expect(relatedUrl.pathname).not.toBe(
    new URL(firstHref, "http://localhost").pathname,
  );
  expect(relatedUrl.searchParams.get("from")).toBe("hall-of-fame");
  expect(relatedUrl.searchParams.get("returnTo")).toBe(
    "/hall-of-fame?sort=newest&page=1",
  );

  await relatedLink.click();
  await expect(page.locator("[data-look-detail-page]")).toBeVisible();
  await expect(page.locator(".look-detail__back")).toHaveAttribute(
    "href",
    "/hall-of-fame?sort=newest&page=1",
  );
});

test("reserves the editorial stage during a detail route transition", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "The route loading composition is covered once in Chromium.",
  );

  await page.route("**/outfits/**", async (route) => {
    if (route.request().headers().rsc === "1") {
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    await route.continue();
  });
  await page.goto("/hall-of-fame");
  await page.locator(".hall-look__media-link").first().click();

  await expect(page.locator(".look-detail-loading")).toBeVisible();
  await expect(page.locator(".look-detail-loading__stage")).toBeVisible();
  await expect(page.locator(".look-detail-loading__information")).toBeVisible();
  await expect(page.locator("[data-look-detail-page]")).toBeVisible();
});

test("keeps detail rating keyboard-operable with success and failure feedback", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Rating writes are intercepted once in desktop Chromium.",
  );

  await page.route("**/api/guest/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { guestId: "detail-e2e" } }),
    });
  });
  await page.route("**/api/outfits/*/rating", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { rating: { value: 5 }, aggregate: { average: 4.8, count: 21 } },
      }),
    });
  });

  await openFirstLook(page);
  const rating = page.locator(".look-detail__rating");
  const fiveStars = rating.getByRole("radio", {
    name: "Rate 5 out of 5 stars",
  });
  await fiveStars.focus();
  await page.keyboard.press("Space");
  await expect(fiveStars).toBeChecked();
  await expect(
    rating.getByText("Thanks ♡ Your rating is 5 out of 5."),
  ).toBeVisible();
  await expect(rating.getByText("4.8 ★")).toBeVisible();
  await expect(rating.getByText("21 ratings")).toBeVisible();

  await page.unroute("**/api/outfits/*/rating");
  await page.route("**/api/outfits/*/rating", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: { message: "Too many rating attempts. Try again later." },
      }),
    });
  });
  const twoStars = rating.getByRole("radio", {
    name: "Rate 2 out of 5 stars",
  });
  await twoStars.focus();
  await page.keyboard.press("Space");
  await expect(
    rating.getByText("Too many rating attempts. Try again later."),
  ).toBeVisible();
  await expect(fiveStars).toBeChecked();
  await expect(twoStars).not.toBeChecked();
});

test("preserves share channels and download without equal-weight action clutter", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Action disclosure is covered once in desktop Chromium.",
  );

  await openFirstLook(page);
  const actions = page.locator(".look-detail__actions");
  await expect(
    actions.getByRole("button", { name: /SHARE OUTFIT/ }),
  ).toBeVisible();
  await expect(
    actions.getByRole("button", { name: /DOWNLOAD IMAGE/ }),
  ).toBeVisible();

  await actions.getByText("MORE WAYS TO SHARE").click();
  await expect(
    actions.getByRole("button", { name: /COPY LINK/ }),
  ).toBeVisible();
  for (const platform of ["WHATSAPP", "FACEBOOK", "X", "TELEGRAM"]) {
    await expect(
      actions.getByRole("link", { name: platform, exact: true }),
    ).toBeVisible();
  }
});

test("keeps the look dominant and unclipped at every acceptance width", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "The exact responsive matrix runs once in Chromium.",
  );

  await openFirstLook(page);
  await expect(page.locator(".look-detail__information")).toHaveCSS(
    "opacity",
    "1",
  );
  for (const viewport of detailViewports) {
    await page.setViewportSize(viewport);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${viewport.width}px Look Detail must not overflow horizontally`,
    ).toBe(true);

    const media = await page.locator(".look-detail__media-mask").boundingBox();
    expect(media).not.toBeNull();
    expect(media!.width / media!.height).toBeCloseTo(0.75, 1);
    const identity = await page
      .locator(".look-detail__identity h1")
      .boundingBox();
    const information = await page
      .locator(".look-detail__information")
      .boundingBox();
    expect(identity).not.toBeNull();
    expect(information).not.toBeNull();
    if (viewport.width >= 1200) {
      expect(media!.height).toBeGreaterThanOrEqual(viewport.height * 0.6);
      expect(media!.height).toBeLessThanOrEqual(viewport.height * 0.82);
    }

    if (viewport.width >= 768) {
      expect(media!.x + media!.width).toBeLessThanOrEqual(identity!.x);
      expect(media!.x + media!.width).toBeLessThanOrEqual(information!.x);
      expect(Math.abs(identity!.y - media!.y)).toBeLessThanOrEqual(2);
    } else {
      expect(media!.y + media!.height).toBeLessThanOrEqual(identity!.y);
      expect(identity!.y + identity!.height).toBeLessThanOrEqual(
        information!.y,
      );
    }

    const targetHeights = await page
      .locator(".look-detail__rating .star-rating label")
      .evaluateAll((labels) =>
        labels.map((label) => label.getBoundingClientRect().height),
      );
    expect(targetHeights).toHaveLength(5);
    expect(targetHeights.every((height) => height >= 44)).toBe(true);

    const relatedGrid = page.locator(".look-detail__related-grid");
    const relatedWidths = await relatedGrid
      .locator(".hall-look")
      .evaluateAll((cards) =>
        cards.map((card) => card.getBoundingClientRect().width),
      );
    expect(relatedWidths.length).toBeGreaterThan(0);
    expect(relatedWidths.length).toBeLessThanOrEqual(4);
    expect(
      Math.max(...relatedWidths) - Math.min(...relatedWidths),
    ).toBeLessThan(2);
    const gridColumnCount = await relatedGrid.evaluate(
      (grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length,
    );
    expect(gridColumnCount).toBe(
      viewport.width >= 1200 ? 4 : viewport.width >= 768 ? 2 : 1,
    );

    await testInfo.attach(`look-detail-${viewport.width}px`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  }
});

test("matches the homepage footer structure and typography contract", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Footer parity is covered once in desktop Chromium.",
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await openFirstLook(page);

  const readFooterContract = (selector: string) =>
    page.locator(selector).evaluate((footer) => {
      const title = footer.querySelector<HTMLElement>(
        ".home-editorial-footer__title",
      )!;
      const wave = footer.querySelector<SVGPathElement>("svg path")!;
      const nav = footer.querySelector<HTMLElement>(".editorial-footer__nav")!;
      const titleStyle = getComputedStyle(title);
      const navStyle = getComputedStyle(nav);
      return {
        title: {
          fontSize: titleStyle.fontSize,
          fontWeight: titleStyle.fontWeight,
          letterSpacing: titleStyle.letterSpacing,
          lineHeight: titleStyle.lineHeight,
        },
        nav: {
          display: navStyle.display,
          gap: navStyle.gap,
          gridColumn: navStyle.gridColumn,
        },
        wavePath: wave.getAttribute("d"),
      };
    });

  const detailFooter = page.locator(
    ".site-footer--hall.site-footer--editorial",
  );
  await detailFooter.scrollIntoViewIfNeeded();
  const detailContract = await readFooterContract(
    ".site-footer--hall.site-footer--editorial",
  );

  await page.goto("/");
  const homeFooter = page.locator(".site-footer--home");
  await homeFooter.scrollIntoViewIfNeeded();
  expect(detailContract).toEqual(
    await readFooterContract(".site-footer--home"),
  );
});

test("uses the Hall cursor only for fine pointers and disables it for reduced motion", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Cursor and reduced motion are covered once in desktop Chromium.",
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await openFirstLook(page);
  const cursor = page.locator(".hall-cursor");

  await page.locator(".look-detail__rating .star-rating label").first().hover();
  await expect(cursor).toHaveAttribute("data-label", "RATE");
  await page.getByRole("button", { name: /SHARE OUTFIT/ }).hover();
  await expect(cursor).toHaveAttribute("data-label", "SHARE");
  const relatedLink = page
    .locator(".look-detail__related .hall-look__media-link")
    .first();
  if (await relatedLink.count()) {
    await relatedLink.hover();
    await expect(cursor).toHaveAttribute("data-label", "VIEW");
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".hall-cursor")).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(
    /hall-custom-cursor-ready/,
  );
  await expect(page.locator(".look-detail__media-mask")).toBeVisible();
});

test("renders a deliberate not-found state without a broken stage", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "The missing-look route state is covered once in Chromium.",
  );

  await page.goto("/outfits/00000000-0000-0000-0000-000000000000");
  await expect(
    page.getByRole("heading", { name: "THIS LOOK COULD NOT BE FOUND." }),
  ).toBeVisible();
  await expect(page.locator(".look-detail__media-mask")).toHaveCount(0);
  await expect(page.locator(".site-header--hall")).toBeVisible();
  await expect(page.locator(".site-footer--hall")).toBeVisible();
});

test("renders the route error composition for an unexpected data failure", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "The unexpected route failure is covered once in Chromium.",
  );

  await page.goto("/outfits/not-a-valid-uuid");
  await expect(
    page.getByRole("heading", { name: "WE COULDN’T LOAD THIS LOOK." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "TRY AGAIN" })).toBeVisible();
  await expect(page.locator(".look-detail__media-mask")).toHaveCount(0);
  await expect(page.locator(".site-header--hall")).toBeVisible();
  await expect(page.locator(".site-footer--hall")).toBeVisible();
});
