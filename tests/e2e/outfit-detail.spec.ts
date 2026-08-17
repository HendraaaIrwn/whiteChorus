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

test("opens an Instagram-first framed share dialog before sharing", async ({
  page,
}) => {
  await openFirstLook(page);
  const actions = page.locator(".look-detail__actions");
  const shareButton = actions.getByRole("button", { name: /SHARE OUTFIT/ });
  await expect(shareButton).toBeVisible();
  await expect(
    actions.getByRole("button", { name: /DOWNLOAD IMAGE/ }),
  ).toBeVisible();

  await shareButton.click();
  const dialog = page.getByRole("dialog", { name: "SHARE YOUR LOOK" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: /Framed White Chorus Look/i }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "SHARE TO INSTAGRAM" }),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: /COPY LINK/ })).toBeVisible();
  for (const platform of ["WHATSAPP", "FACEBOOK", "X"]) {
    await expect(
      dialog.getByRole("link", { name: platform, exact: true }),
    ).toBeVisible();
  }
  const currentOutfitPath = new URL(page.url()).pathname;
  const facebookIntent = new URL(
    (await dialog
      .getByRole("link", { name: "FACEBOOK", exact: true })
      .getAttribute("href"))!,
  );
  const xIntent = new URL(
    (await dialog
      .getByRole("link", { name: "X", exact: true })
      .getAttribute("href"))!,
  );
  const whatsappIntent = new URL(
    (await dialog
      .getByRole("link", { name: "WHATSAPP", exact: true })
      .getAttribute("href"))!,
  );
  expect(facebookIntent.hostname).toBe("www.facebook.com");
  expect(new URL(facebookIntent.searchParams.get("u")!).pathname).toBe(
    currentOutfitPath,
  );
  expect(xIntent.hostname).toBe("twitter.com");
  expect(xIntent.searchParams.get("text")).toMatch(/^Rate White Chorus Look #/);
  expect(new URL(xIntent.searchParams.get("url")!).pathname).toBe(
    currentOutfitPath,
  );
  expect(whatsappIntent.hostname).toBe("wa.me");
  expect(whatsappIntent.searchParams.get("text")).toContain(currentOutfitPath);
  await expect(dialog).not.toContainText("TELEGRAM");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await dialog.getByRole("button", { name: "CANCEL" }).click();
  await expect(dialog).toBeHidden();
  await expect(shareButton).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("shares the framed PNG through the native file share path", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Native file payload is covered once in desktop Chromium.",
  );
  await page.addInitScript(() => {
    const calls: Array<Record<string, unknown>> = [];
    Object.defineProperty(window, "__whiteChorusShareCalls", {
      configurable: true,
      value: calls,
    });
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: (data: ShareData) => Boolean(data.files?.length),
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        const file = data.files?.[0];
        calls.push({
          fileCount: data.files?.length ?? 0,
          fileName: file?.name,
          fileType: file?.type,
          title: data.title,
          text: data.text,
          url: data.url,
        });
        await new Promise((resolve) => setTimeout(resolve, 250));
      },
    });
  });

  await openFirstLook(page);
  const shareButton = page.getByRole("button", { name: /SHARE OUTFIT/ });
  await shareButton.click();
  await expect(
    page.getByRole("img", { name: /Framed White Chorus Look/i }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (
          window as unknown as Window & {
            __whiteChorusShareCalls: Array<Record<string, unknown>>;
          }
        ).__whiteChorusShareCalls,
    ),
  ).toEqual([]);

  const instagramButton = page
    .locator(".share-dialog__primary-actions .button")
    .first();
  await instagramButton.click();
  await expect(instagramButton).toBeDisabled();
  await instagramButton.click({ force: true });
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(
    await page.evaluate(
      () =>
        (
          window as unknown as Window & {
            __whiteChorusShareCalls: Array<Record<string, unknown>>;
          }
        ).__whiteChorusShareCalls,
    ),
  ).toEqual([
    expect.objectContaining({
      fileCount: 1,
      fileName: expect.stringMatching(/^white-chorus-.+\.png$/),
      fileType: "image/png",
      title: expect.stringMatching(/^White Chorus Look #/),
      text: expect.stringMatching(/^Rate White Chorus Look #/),
      url: expect.stringMatching(/^https?:\/\/.+\/outfits\//),
    }),
  ]);
  await expect(shareButton).toBeFocused();
});

test("saves the framed image when native file sharing is unavailable", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Download fallback is covered once in desktop Chromium.",
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => false,
    });
  });

  await openFirstLook(page);
  await page.getByRole("button", { name: /SHARE OUTFIT/ }).click();
  await expect(
    page.getByRole("img", { name: /Framed White Chorus Look/i }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "SHARE TO INSTAGRAM" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^white-chorus-.+\.png$/);
  await expect(
    page.getByText("IMAGE SAVED — OPEN INSTAGRAM TO SHARE"),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("copies the public outfit URL once and confirms success", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Clipboard behavior is covered once in Chromium.",
  );
  await page.addInitScript(() => {
    const writes: string[] = [];
    Object.defineProperty(window, "__whiteChorusClipboardWrites", {
      configurable: true,
      value: writes,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          writes.push(value);
          await new Promise((resolve) => setTimeout(resolve, 200));
        },
      },
    });
  });

  await openFirstLook(page);
  await page.getByRole("button", { name: /SHARE OUTFIT/ }).click();
  await expect(
    page.getByRole("img", { name: /Framed White Chorus Look/i }),
  ).toBeVisible();
  const copyButton = page.getByRole("button", { name: "COPY LINK" });
  await copyButton.click();
  await expect(copyButton).toBeDisabled();
  await copyButton.click({ force: true });
  await expect(page.getByText("LINK COPIED")).toBeVisible();

  const writes = await page.evaluate(
    () =>
      (
        window as unknown as Window & {
          __whiteChorusClipboardWrites: string[];
        }
      ).__whiteChorusClipboardWrites,
  );
  expect(writes).toHaveLength(1);
  expect(new URL(writes[0]).pathname).toBe(new URL(page.url()).pathname);
});

test("uses the framed share image for outfit social metadata", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Outfit social metadata is covered once in Chromium.",
  );

  const href = await openFirstLook(page);
  const outfitId = new URL(href, page.url()).pathname.split("/").at(-1);
  const expectedImagePath = `/api/outfits/${outfitId}/share-image`;
  const ogImageUrl = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  const twitterImageUrl = await page
    .locator('meta[name="twitter:image"]')
    .getAttribute("content");

  expect(new URL(ogImageUrl!).pathname).toBe(expectedImagePath);
  expect(new URL(twitterImageUrl!).pathname).toBe(expectedImagePath);
});

test("shows share loading, error, retry, Escape, and backdrop behavior", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Share dialog failure and dismissal states run once in Chromium.",
  );
  let requestCount = 0;
  await page.route("**/api/outfits/*/share-image", async (route) => {
    requestCount += 1;
    if (requestCount === 1) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ ok: false }),
      });
      return;
    }
    await route.continue();
  });

  await openFirstLook(page);
  const shareButton = page.getByRole("button", { name: /SHARE OUTFIT/ });
  await shareButton.click();
  const dialog = page.getByRole("dialog", { name: "SHARE YOUR LOOK" });
  await expect(dialog.locator(".share-dialog__skeleton")).toBeVisible();
  await expect(dialog.getByText("PREVIEW UNAVAILABLE")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "SHARE TO INSTAGRAM" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "RETRY" }).click();
  await expect(
    dialog.getByRole("img", { name: /Framed White Chorus Look/i }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(shareButton).toBeFocused();

  await shareButton.click();
  await expect(dialog).toBeVisible();
  await dialog.evaluate((element: HTMLDialogElement) => element.click());
  await expect(dialog).toBeHidden();
  await expect(shareButton).toBeFocused();
});

test("keeps the framed share dialog inside every acceptance viewport", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "The share-dialog responsive matrix runs once in Chromium.",
  );
  await page.setViewportSize(detailViewports[0]);
  await openFirstLook(page);

  for (const viewport of detailViewports) {
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: /SHARE OUTFIT/ }).click();
    const dialog = page.getByRole("dialog", { name: "SHARE YOUR LOOK" });
    await expect(
      dialog.getByRole("img", { name: /Framed White Chorus Look/i }),
    ).toBeVisible();
    const panel = await dialog.locator(".share-dialog__panel").boundingBox();
    expect(panel).not.toBeNull();
    expect(panel!.x).toBeGreaterThanOrEqual(0);
    expect(panel!.y).toBeGreaterThanOrEqual(0);
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(viewport.width);
    expect(panel!.height).toBeLessThanOrEqual(viewport.height);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport.width);
    await dialog.getByRole("button", { name: "CANCEL" }).click();
    await expect(dialog).toBeHidden();
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
