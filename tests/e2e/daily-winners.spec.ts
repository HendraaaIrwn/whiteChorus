import { expect, test, type Page, type Route } from "@playwright/test";

const winnerViewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
] as const;

function rankingPayload({
  swapped = false,
  eligible = false,
}: {
  swapped?: boolean;
  eligible?: boolean;
} = {}) {
  const lookA = {
    id: "live-look-a",
    rank: swapped ? 2 : 1,
    shortCode: "LIVEA001",
    thumbnailUrl: "",
    ratingAverage: 4.82,
    ratingCount: 8,
    weightedScore: swapped ? 4.41 : 4.62,
    eligible: true,
    ratingsNeeded: 0,
    publishedAt: "2026-08-09T01:00:00.000Z",
  };
  const lookB = {
    id: "live-look-b",
    rank: swapped ? 1 : 2,
    shortCode: "LIVEB002",
    thumbnailUrl: "",
    ratingAverage: 4.91,
    ratingCount: eligible ? 5 : 4,
    weightedScore: swapped ? 4.7 : 4.52,
    eligible,
    ratingsNeeded: eligible ? 0 : 1,
    publishedAt: "2026-08-09T02:00:00.000Z",
  };
  return {
    ok: true,
    data: {
      winners: [],
      ranking: {
        dayKey: "2026-08-09",
        dayStart: "2026-08-08T17:00:00.000Z",
        dayEnd: "2099-08-09T17:00:00.000Z",
        generatedAt: swapped
          ? "2026-08-09T08:31:00.000Z"
          : "2026-08-09T08:30:00.000Z",
        timeZone: "Asia/Jakarta",
        minimumRatings: 5,
        items: swapped ? [lookB, lookA] : [lookA, lookB],
      },
    },
  };
}

async function fulfillRanking(
  route: Route,
  options?: Parameters<typeof rankingPayload>[0],
) {
  await route.fulfill({
    contentType: "application/json",
    body: JSON.stringify(rankingPayload(options)),
  });
}

async function installStableRanking(page: Page) {
  await page.route("**/api/daily-winners", (route) => fulfillRanking(route));
}

test("separates Daily Competition from the live provisional race", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Editorial structure is covered once in desktop Chromium.",
  );
  await installStableRanking(page);
  await page.goto("/daily-winners");
  const visiblePage = page.locator(".winner-page:visible");

  await expect(
    visiblePage.getByRole("heading", { level: 1, name: "DAILY WINNER" }),
  ).toBeVisible();
  await expect(page.locator(".winner-stage")).toHaveCount(0);
  await expect(page.getByText("FINAL", { exact: true })).toHaveCount(0);
  await expect(page.getByText("PROVISIONAL", { exact: true })).toHaveCount(0);
  await expect(visiblePage.getByText("02 · CURRENT COMPETITION")).toBeVisible();
  await expect(
    visiblePage.getByRole("heading", { level: 2, name: "LIVE RANKING" }),
  ).toBeVisible();
  await expect(visiblePage.getByText("LIVE · PROVISIONAL")).toBeVisible();
  await expect(page.locator(".site-header--winners:visible")).toBeVisible();
  await expect(page.locator(".site-footer--winners:visible")).toBeVisible();
  await expect(visiblePage.locator(".winner-hero-scene__doodle")).toHaveCount(
    3,
  );

  const sectionSurfaces = await page.evaluate(() => ({
    competition: getComputedStyle(
      document.querySelector<HTMLElement>(".winner-hero-scene")!,
    ).backgroundColor,
    ranking: getComputedStyle(
      document.querySelector<HTMLElement>(".live-ranking")!,
    ).backgroundColor,
  }));
  expect(sectionSurfaces.competition).toBe("rgb(65, 88, 134)");
  expect(sectionSurfaces.ranking).toBe("rgb(253, 246, 236)");

  const archive = visiblePage.locator(".winner-archive");
  if (await archive.count()) {
    await expect(archive.getByText("03 · COMPLETED DAYS")).toBeVisible();
    await expect(archive.locator(".winner-archive__index").first()).toHaveText(
      "01",
    );
  }
  await expect(visiblePage.locator(".winner-cta .winner-label")).toHaveText(
    /^(03|04) · YOUR NEXT LOOK$/,
  );
  await expect(visiblePage.locator(".winner-cta__layout > svg")).toHaveCount(1);
  await expect(visiblePage.locator(".winner-cta__spark")).toHaveCount(1);

  const liveLeader = visiblePage.locator(".live-ranking__item").first();
  await expect(liveLeader.getByText("CURRENT LEADER")).toBeVisible();
  await expect(liveLeader).not.toContainText("WINNER");
  const leaderDetailHref = await liveLeader
    .locator(".live-ranking__link")
    .getAttribute("href");
  const leaderDetailUrl = new URL(leaderDetailHref!, "http://localhost");
  expect(leaderDetailUrl.searchParams.get("from")).toBe("daily-winner");
  expect(leaderDetailUrl.searchParams.get("returnTo")).toBe("/daily-winners");
  await expect(
    liveLeader.locator("dd").getByText("4.620", { exact: true }),
  ).toBeVisible();
  await expect(
    liveLeader.locator("dd").getByText("4.82", { exact: true }),
  ).toBeVisible();
  await expect(
    liveLeader.locator("dd").getByText("8", { exact: true }),
  ).toBeVisible();
  await expect(liveLeader.getByText("ELIGIBLE", { exact: true })).toBeVisible();

  const second = visiblePage.locator(".live-ranking__item").nth(1);
  await expect(second.locator(".live-ranking__eligibility")).toHaveText(
    "NEEDS 1 MORE RATING",
  );
  await expect(second).not.toContainText("0 RATINGS");

  await visiblePage.getByText("HOW THE RANKING WORKS").click();
  await expect(
    visiblePage.getByText(/Eligibility begins at 5 ratings/),
  ).toBeVisible();
});

test("smoothly positions the live ranking below the sticky header", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Anchor motion and sticky-header geometry are covered once in Chromium.",
  );
  await installStableRanking(page);
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/daily-winners");

    await page.getByRole("link", { name: /FOLLOW THE LIVE RANKING/ }).click();
    await expect(page).toHaveURL(/#live-ranking-title$/);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const header = Array.from(
            document.querySelectorAll<HTMLElement>(".site-header--winners"),
          ).find((element) => element.getClientRects().length)!;
          const title = Array.from(
            document.querySelectorAll<HTMLElement>("#live-ranking-title"),
          ).find(
            (element) =>
              element.closest<HTMLElement>(".winner-page")?.getClientRects()
                .length,
          )!;
          return Math.round(
            title.getBoundingClientRect().top -
              header.getBoundingClientRect().bottom,
          );
        }),
      )
      .toBeGreaterThanOrEqual(20);
    await expect(
      page.locator(".winner-page:visible #live-ranking-title"),
    ).toBeFocused();
  }
});

test("uses the homepage footer bottom design and motion system", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Footer motion parity is covered once in Chromium.",
  );
  await installStableRanking(page);
  await page.goto("/daily-winners");

  const footer = page.locator(".site-footer--winners:visible");
  await expect(footer).toHaveAttribute("data-footer-motion", "enabled");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByText("THE RACE CONTINUES")).toBeVisible();
  await expect(footer.getByRole("link", { name: "HOME" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "DRESS UP" })).toBeVisible();
  await expect(
    footer.getByRole("link", { name: "HALL OF FAME" }),
  ).toBeVisible();
  await expect(footer.getByText("ANONYMOUS BY DESIGN.")).toHaveCount(0);
  await expect(footer.getByText("WHITE CHORUS © 2026")).toBeVisible();
  await expect(footer.locator("[data-footer-title-reveal]")).toBeVisible();
  await expect(footer.locator("[data-footer-wave-reveal]")).toHaveCount(1);
  await expect(footer.locator("[data-footer-spark-reveal]")).toHaveCount(1);

  const readBottomContract = async (footerSelector: string) =>
    page.locator(footerSelector).evaluate((element) => {
      const nav = element.querySelector<HTMLElement>(".editorial-footer__nav")!;
      const link = nav.querySelector<HTMLElement>("a")!;
      const meta = element.querySelector<HTMLElement>(
        ".editorial-footer__meta",
      )!;
      const music = meta.querySelector<HTMLElement>(".music-control")!;
      const linkStyle = getComputedStyle(link);
      const underlineStyle = getComputedStyle(link, "::after");
      const metaStyle = getComputedStyle(meta);
      const musicStyle = getComputedStyle(music);
      const navStyle = getComputedStyle(nav);

      return {
        link: {
          fontSize: linkStyle.fontSize,
          fontWeight: linkStyle.fontWeight,
          letterSpacing: linkStyle.letterSpacing,
          minHeight: linkStyle.minHeight,
        },
        meta: {
          alignItems: metaStyle.alignItems,
          display: metaStyle.display,
          fontSize: metaStyle.fontSize,
          fontWeight: metaStyle.fontWeight,
          gap: metaStyle.gap,
          justifyContent: metaStyle.justifyContent,
          letterSpacing: metaStyle.letterSpacing,
        },
        music: {
          borderRadius: musicStyle.borderRadius,
          borderWidth: musicStyle.borderWidth,
          minHeight: musicStyle.minHeight,
          padding: musicStyle.padding,
          transition: musicStyle.transition,
        },
        nav: {
          display: navStyle.display,
          gap: navStyle.gap,
          gridColumn: navStyle.gridColumn,
        },
        underline: {
          bottom: underlineStyle.bottom,
          height: underlineStyle.height,
          transition: underlineStyle.transition,
        },
      };
    });

  const winnerBottomContract = await readBottomContract(
    ".site-footer--winners:visible",
  );
  const waveGeometry = await footer
    .locator(".winner-editorial-footer > svg")
    .evaluate((wave) => {
      const bounds = wave.getBoundingClientRect();

      return {
        right: bounds.right,
        strokeWidth: Number.parseFloat(getComputedStyle(wave).strokeWidth),
        viewportWidth: window.innerWidth,
      };
    });
  expect(waveGeometry.strokeWidth).toBeGreaterThanOrEqual(6);
  expect(waveGeometry.right).toBeGreaterThanOrEqual(waveGeometry.viewportWidth);

  await page.goto("/");
  const homeFooter = page.locator(".site-footer--home:visible");
  await homeFooter.scrollIntoViewIfNeeded();
  await expect(homeFooter).toBeVisible();
  await expect(winnerBottomContract).toEqual(
    await readBottomContract(".site-footer--home:visible"),
  );
});

test("animates only actual ranking and eligibility changes from the API", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Live data transitions are covered once in desktop Chromium.",
  );
  let requestCount = 0;
  await page.route("**/api/daily-winners", async (route) => {
    requestCount += 1;
    await fulfillRanking(route, {
      swapped: requestCount > 1,
      eligible: requestCount > 1,
    });
  });
  await page.goto("/daily-winners");
  await expect(page.locator(".live-ranking__item").first()).toContainText(
    "LIVEA001",
  );

  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(page.locator(".live-ranking__item").first()).toContainText(
    "LIVEB002",
  );
  await expect(page.locator(".live-ranking__item").first()).toContainText(
    "4.700",
  );
  await expect(page.locator(".live-ranking__item").first()).toContainText(
    "ELIGIBLE",
  );
});

test("marks the last verified ranking when a refresh fails", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Recovery state is covered once in desktop Chromium.",
  );
  let requestCount = 0;
  let failRefresh = false;
  await page.route("**/api/daily-winners", async (route) => {
    requestCount += 1;
    if (!failRefresh) return fulfillRanking(route);
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: "{}",
    });
  });
  await page.goto("/daily-winners");
  const visiblePage = page.locator(".winner-page:visible");
  await expect(visiblePage.getByText("UPDATED", { exact: true })).toBeVisible();
  await expect.poll(() => requestCount).toBeGreaterThan(0);

  failRefresh = true;
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(
    visiblePage.getByText("LAST VERIFIED", { exact: true }),
  ).toBeVisible();
  await expect(visiblePage.getByText("Reconnect pending")).toBeVisible();
});

test("keeps the editorial ranking readable at every acceptance width", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "The exact responsive matrix runs once in Chromium.",
  );
  await installStableRanking(page);
  await page.goto("/daily-winners");

  for (const viewport of winnerViewports) {
    await page.setViewportSize(viewport);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${viewport.width}px Daily Winner must not overflow horizontally`,
    ).toBe(true);

    const visibleDoodleCount = await page
      .locator(".winner-page:visible .winner-hero-scene__doodle")
      .evaluateAll(
        (doodles) =>
          doodles.filter(
            (doodle) => getComputedStyle(doodle).display !== "none",
          ).length,
      );
    expect(visibleDoodleCount).toBe(
      viewport.width >= 1200 ? 3 : viewport.width >= 768 ? 2 : 1,
    );

    const eligibilityHeight = await page
      .locator(".live-ranking__eligibility")
      .first()
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(eligibilityHeight).toBeGreaterThanOrEqual(44);

    const cta = page.locator(".winner-page:visible .winner-cta__action");
    const ctaSize = await cta.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      height: element.getBoundingClientRect().height,
    }));
    expect(ctaSize.scrollWidth).toBeLessThanOrEqual(ctaSize.clientWidth + 1);
    expect(ctaSize.height).toBeGreaterThanOrEqual(44);

    if (viewport.width < 768) {
      await expect(
        page.locator(".winner-page:visible > .winner-cursor"),
      ).toBeHidden();
      const metricsColumns = await page
        .locator(".live-ranking__metrics")
        .first()
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns);
      expect(metricsColumns.split(" ").length).toBe(3);
    }
  }
});

test("uses VIEW, OPEN, and DRESS cursor contexts on fine pointers", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Fine-pointer cursor contexts are covered once in desktop Chromium.",
  );
  await installStableRanking(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/daily-winners");
  const cursor = page.locator(".winner-page:visible > .winner-cursor");

  await page.locator(".live-ranking__link").first().hover();
  await expect(cursor).toHaveAttribute("data-label", "VIEW");
  await page
    .locator(".winner-page:visible")
    .getByText("HOW THE RANKING WORKS")
    .hover();
  await expect(cursor).toHaveAttribute("data-label", "OPEN");
  await page.locator(".winner-page:visible .winner-cta__action").hover();
  await expect(cursor).toHaveAttribute("data-label", "DRESS");
  await expect(
    page.locator(
      ".winner-page:visible .winner-cta__action .entry-audio-gate__hover",
    ),
  ).toHaveCSS("background-color", "rgb(254, 187, 117)");
});

test("keeps live data static and the native cursor under reduced motion", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Reduced motion is covered once in Chromium.",
  );
  await installStableRanking(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/daily-winners");
  await expect(
    page.locator(".winner-page:visible > .winner-cursor"),
  ).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(
    /winner-custom-cursor-ready/,
  );
  await expect(page.locator(".live-ranking__item").first()).toContainText(
    "LIVEA001",
  );
  await page.getByRole("link", { name: /FOLLOW THE LIVE RANKING/ }).click();
  await expect(page).toHaveURL(/#live-ranking-title$/);
  await expect(
    page.locator(".winner-page:visible #live-ranking-title"),
  ).toBeFocused();

  const footer = page.locator(".site-footer--winners:visible");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.locator("[data-footer-title-reveal]")).toBeVisible();
});

test("keeps native touch behavior and readable ranking metrics on mobile", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chrome",
    "Touch behavior runs in the mobile Chrome device context.",
  );
  await installStableRanking(page);
  await page.goto("/daily-winners");
  await expect(page.locator("html")).not.toHaveClass(
    /winner-custom-cursor-ready/,
  );
  await expect(
    page.locator(".winner-page:visible > .winner-cursor"),
  ).toBeHidden();
  await expect(page.locator(".live-ranking__metrics").first()).toBeVisible();
  await expect(page.locator(".live-ranking__eligibility").first()).toHaveText(
    "ELIGIBLE",
  );
});

test("opens the existing audio choice from the final Dress-Up CTA", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Shared audio-gate behavior is covered once in desktop Chromium.",
  );
  await installStableRanking(page);
  await page.goto("/daily-winners");
  const cta = page.locator(".winner-page:visible .winner-cta__action");
  await cta.click();
  await expect(
    page.getByRole("heading", { name: "HOW SHOULD THE CHORUS BEGIN?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ENTER WITH MUSIC" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ENTER SILENTLY" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(cta).toBeFocused();
});
