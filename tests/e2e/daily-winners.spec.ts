import {
  expect,
  test,
  type Locator,
  type Page,
  type Route,
} from "@playwright/test";

const winnerViewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
] as const;

const winnerDetailViewports = [
  { width: 320, height: 780 },
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
  page = 1,
  totalItems = 12,
  totalPages = 2,
}: {
  swapped?: boolean;
  eligible?: boolean;
  page?: number;
  totalItems?: number;
  totalPages?: number;
} = {}) {
  const rankOffset = (page - 1) * 10;
  const lookA = {
    id: `live-look-a-page-${page}`,
    rank: rankOffset + (swapped ? 2 : 1),
    shortCode: page === 1 ? "LIVEA001" : `PAGE${page}A01`,
    thumbnailUrl: "",
    ratingAverage: 4.82,
    ratingCount: 8,
    weightedScore: swapped ? 4.41 : 4.62,
    eligible: true,
    ratingsNeeded: 0,
    publishedAt: "2026-08-09T01:00:00.000Z",
  };
  const lookB = {
    id: `live-look-b-page-${page}`,
    rank: rankOffset + (swapped ? 1 : 2),
    shortCode: page === 1 ? "LIVEB002" : `PAGE${page}B02`,
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
      latestWinner: null,
      completedDays: [],
      ranking: {
        dayKey: "2026-08-09",
        dayStart: "2026-08-08T17:00:00.000Z",
        dayEnd: "2099-08-09T17:00:00.000Z",
        generatedAt: swapped
          ? "2026-08-09T08:31:00.000Z"
          : "2026-08-09T08:30:00.000Z",
        timeZone: "Asia/Jakarta",
        minimumRatings: 5,
        page,
        pageSize: 10,
        totalItems,
        totalPages,
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
  await page.route("**/api/daily-winners*", (route) => {
    const requestedPage = Number(
      new URL(route.request().url()).searchParams.get("page") ?? 1,
    );
    return fulfillRanking(route, { page: requestedPage });
  });
}

async function openFinalizedWinnerDetail(page: Page) {
  await installStableRanking(page);
  await page.goto("/daily-winners");
  const latest = page
    .locator(".winner-page .winner-latest")
    .filter({ visible: true })
    .last();
  const latestLink = latest
    .locator(".winner-latest__link")
    .filter({ visible: true })
    .last();
  await expect(latestLink).toBeVisible();

  const href = await latestLink.getAttribute("href");
  const identity = await latest.locator(".winner-latest__copy h2").innerText();
  const weighted = await latest
    .locator(".winner-latest__metric--primary dd")
    .innerText();
  const debugPlaceholder =
    (await latest.getByText("DEBUG PREVIEW · PRESENTATION ONLY").count()) > 0;

  expect(href).toMatch(/^\/daily-winners\/\d{4}-\d{2}-\d{2}$/);
  await page.goto(href!);
  await expect(page.locator(".winner-detail-page:visible")).toBeVisible();

  return {
    debugPlaceholder,
    shortCode: identity.match(/#(\S+)/)?.[1] ?? "",
    weightedScore: weighted.match(/\d+\.\d{3}/)?.[0] ?? "",
  };
}

async function expectWinnerHeadingRevealed(detail: Locator) {
  await expect
    .poll(() =>
      detail.locator(".winner-detail__title-wrap").evaluate((node) => {
        const line = node.querySelector<HTMLElement>(".home-mask-line > span");
        return {
          clipped: getComputedStyle(node).clipPath.includes("100%"),
          lineTransform: line ? getComputedStyle(line).transform : null,
        };
      }),
    )
    .toEqual({ clipped: false, lineTransform: "none" });
}

test("presents a finalized winner as an editorial feature", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Finalized winner semantics are covered once in desktop Chromium.",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  const winner = await openFinalizedWinnerDetail(page);
  const detail = page.locator(".winner-detail-page:visible");

  await expect(
    detail.getByRole("heading", { level: 1, name: "LOOK OF THE DAY" }),
  ).toBeVisible();
  await expectWinnerHeadingRevealed(detail);
  await expect(detail.getByText(/^DAILY WINNER · /)).toBeVisible();
  await expect(detail.getByText("DAILY WINNER", { exact: true })).toBeVisible();
  await expect(
    detail.getByRole("heading", {
      level: 2,
      name: `LOOK #${winner.shortCode}`,
    }),
  ).toBeVisible();
  await expect(detail.locator(".winner-detail__identity time")).toHaveAttribute(
    "datetime",
    /^\d{4}-\d{2}-\d{2}$/,
  );
  await expect(
    detail.getByText("FINAL AVERAGE", { exact: true }),
  ).toBeVisible();
  await expect(
    detail.getByText("FINAL RATINGS", { exact: true }),
  ).toBeVisible();
  await expect(
    detail.getByText("FINAL WEIGHTED SCORE", { exact: true }),
  ).toBeVisible();
  await expect(detail.locator(".winner-detail__stats dd").last()).toHaveText(
    winner.weightedScore,
  );

  if (winner.debugPlaceholder) {
    await expect(detail.getByText("4.8 ★", { exact: true })).toBeVisible();
    await expect(detail.locator(".winner-detail__stats dd").nth(1)).toHaveText(
      "27",
    );
    await expect(
      detail.getByText("DEBUG PREVIEW · PRESENTATION ONLY"),
    ).toBeVisible();
  }

  await expect(
    detail.getByRole("link", { name: "BACK TO DAILY WINNERS" }),
  ).toHaveAttribute("href", "/daily-winners");
  await expect(
    detail.getByRole("link", { name: "BACK TO STUDIO" }),
  ).toHaveAttribute("href", "/studio");
  await expect(page.locator(".site-footer--winners:visible")).toBeVisible();
  await expect(detail.locator(".share-actions")).toHaveCount(0);
  await expect(detail.locator(".winner-detail__related")).toHaveCount(0);

  await detail.getByRole("link", { name: "BACK TO DAILY WINNERS" }).hover();
  await expect(detail.locator(".winner-cursor")).toHaveAttribute(
    "data-label",
    "OPEN",
  );
  await detail.getByRole("link", { name: "BACK TO STUDIO" }).hover();
  await expect(detail.locator(".winner-cursor")).toHaveAttribute(
    "data-label",
    "DRESS",
  );
});

test("keeps the finalized winner hierarchy responsive", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "The finalized winner responsive matrix runs once in Chromium.",
  );
  await openFinalizedWinnerDetail(page);

  for (const viewport of winnerDetailViewports) {
    await page.setViewportSize(viewport);
    const geometry = await page.evaluate(() => {
      const box = (selector: string) => {
        const rect = document.querySelector(selector)!.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          height: rect.height,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          width: rect.width,
        };
      };
      return {
        action: box(".winner-detail__actions"),
        badge: box(".daily-winner-badge"),
        identity: box(".winner-detail__identity"),
        information: box(".winner-detail__information"),
        stage: box(".winner-detail__stage"),
        stats: box(".winner-detail__stats"),
        title: box(".winner-detail__title"),
        overflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });

    expect(
      geometry.overflow,
      `${viewport.width}px detail must not overflow horizontally`,
    ).toBe(false);
    expect(
      geometry.stage.width / geometry.stage.height,
      `${viewport.width}px artwork must retain a 3:4 frame`,
    ).toBeCloseTo(0.75, 2);

    if (viewport.width >= 768) {
      expect(geometry.stage.left).toBeLessThan(geometry.information.left);
      expect(geometry.stage.width).toBeGreaterThan(geometry.information.width);
    } else {
      expect(geometry.title.bottom).toBeLessThan(geometry.stage.top);
      expect(geometry.stage.bottom).toBeLessThan(geometry.badge.top);
      expect(geometry.badge.bottom).toBeLessThan(geometry.identity.top);
      expect(geometry.identity.bottom).toBeLessThan(geometry.stats.top);
      expect(geometry.stats.bottom).toBeLessThan(geometry.action.top);
    }
  }
});

test("shows finalized winner content immediately under reduced motion", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Reduced-motion winner detail behavior is covered once in Chromium.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFinalizedWinnerDetail(page);
  const detail = page.locator(".winner-detail-page:visible");

  await expect(
    detail.getByRole("heading", { level: 1, name: "LOOK OF THE DAY" }),
  ).toBeVisible();
  await expectWinnerHeadingRevealed(detail);
  await expect(detail.locator(".winner-detail__stage")).toBeVisible();
  await expect(detail.locator(".winner-detail__stats")).toBeVisible();
  await expect(detail.locator(".winner-cursor")).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(
    /winner-custom-cursor-ready/,
  );
});

test("presents latest winner, active ranking, completed days, and CTA in order", async ({
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
    visiblePage.getByRole("heading", {
      level: 1,
      name: "LATEST DAILY WINNER",
    }),
  ).toBeVisible();
  await expect(visiblePage.getByText("01 · LATEST DAILY WINNER")).toBeVisible();
  await expect(visiblePage.locator(".winner-latest__media")).toHaveCount(1);
  await expect(
    visiblePage.locator(".winner-latest__metric--primary"),
  ).toContainText("FINAL WEIGHTED SCORE");
  await expect(visiblePage.getByText("02 · CURRENT COMPETITION")).toBeVisible();
  await expect(
    visiblePage.getByRole("heading", { level: 2, name: "LIVE RANKING" }),
  ).toBeVisible();
  await expect(visiblePage.getByText("LIVE · PROVISIONAL")).toBeVisible();
  await expect(page.locator(".site-header--winners:visible")).toBeVisible();
  await expect(page.locator(".site-footer--winners:visible")).toBeVisible();

  const sectionSurfaces = await page.evaluate(() => ({
    latest: getComputedStyle(
      document.querySelector<HTMLElement>(".winner-latest")!,
    ).backgroundColor,
    ranking: getComputedStyle(
      document.querySelector<HTMLElement>(".live-ranking")!,
    ).backgroundColor,
  }));
  expect(sectionSurfaces.latest).toBe("rgb(65, 88, 134)");
  expect(sectionSurfaces.ranking).toBe("rgb(253, 246, 236)");

  const archive = visiblePage.locator(".winner-archive");
  await expect(archive.getByText("03 · COMPLETED DAYS")).toBeVisible();
  if (await archive.locator(".winner-archive__list").count()) {
    await expect(archive.locator(".winner-archive__index").first()).toHaveText(
      "01",
    );
  }
  await expect(visiblePage.locator(".winner-cta .winner-label")).toHaveText(
    "04 · YOUR NEXT LOOK",
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
  await page.route("**/api/daily-winners*", async (route) => {
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

test("paginates the active pool and keeps refreshes on the verified page", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Live ranking pagination behavior is covered once in desktop Chromium.",
  );
  const requestedPages: number[] = [];
  let clampToFirstPage = false;
  await page.route("**/api/daily-winners*", async (route) => {
    const requestedPage = Number(
      new URL(route.request().url()).searchParams.get("page") ?? 1,
    );
    requestedPages.push(requestedPage);
    await fulfillRanking(
      route,
      clampToFirstPage
        ? { page: 1, totalItems: 2, totalPages: 1 }
        : { page: requestedPage, totalItems: 22, totalPages: 3 },
    );
  });
  await page.goto("/daily-winners");

  const pagination = page.getByRole("navigation", {
    name: "Live ranking pages",
  });
  const pageTwo = pagination.getByRole("button", { name: "Ranking page 2" });
  await expect(pageTwo).toBeVisible();
  await pageTwo.click();
  await expect(page.locator(".live-ranking__item").first()).toContainText(
    "PAGE2A01",
  );
  await expect(
    page
      .locator(".live-ranking__item")
      .first()
      .locator(".live-ranking__position"),
  ).toHaveText("11");
  await expect(pageTwo).toHaveAttribute("aria-current", "page");
  expect(requestedPages).toContain(2);

  const requestCount = requestedPages.length;
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect.poll(() => requestedPages.length).toBeGreaterThan(requestCount);
  expect(requestedPages.at(-1)).toBe(2);

  clampToFirstPage = true;
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(page.locator(".live-ranking__item").first()).toContainText(
    "LIVEA001",
  );
  await expect(page.getByText("PAGE 01 OF 01", { exact: true })).toBeVisible();
  await expect(pagination).toHaveCount(0);
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
  await page.route("**/api/daily-winners*", async (route) => {
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

  const verifiedLook = visiblePage.locator(".live-ranking__item").first();
  await expect(verifiedLook).toContainText("LIVEA001");
  failRefresh = true;
  await visiblePage.getByRole("button", { name: "Ranking page 2" }).click();
  await expect(
    visiblePage.getByText("LAST VERIFIED", { exact: true }),
  ).toBeVisible();
  await expect(visiblePage.getByText("Reconnect pending")).toBeVisible();
  await expect(verifiedLook).toContainText("LIVEA001");
  await expect(
    visiblePage.getByRole("button", { name: "Ranking page 1" }),
  ).toHaveAttribute("aria-current", "page");
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
  const visiblePage = page
    .locator(".winner-page")
    .filter({ visible: true })
    .last();

  for (const viewport of winnerViewports) {
    await page.setViewportSize(viewport);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${viewport.width}px Daily Winner must not overflow horizontally`,
    ).toBe(true);

    const latestGeometry = await visiblePage.evaluate((root) => {
      const box = (selector: string) => {
        const rect = root.querySelector(selector)!.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          height: rect.height,
          left: rect.left,
          top: rect.top,
          width: rect.width,
        };
      };
      return {
        copy: box(".winner-latest__copy"),
        media: box(".winner-latest__media"),
        title: box(".winner-latest__title"),
      };
    });
    expect(
      latestGeometry.media.width / latestGeometry.media.height,
    ).toBeCloseTo(0.75, 2);
    if (viewport.width >= 768) {
      expect(latestGeometry.media.left).toBeLessThan(latestGeometry.copy.left);
      expect(latestGeometry.media.width).toBeGreaterThan(
        latestGeometry.copy.width,
      );
    } else {
      expect(latestGeometry.title.bottom).toBeLessThan(
        latestGeometry.media.top,
      );
      expect(latestGeometry.media.bottom).toBeLessThan(latestGeometry.copy.top);
    }

    const eligibilityHeight = await page
      .locator(".winner-page .live-ranking__eligibility")
      .filter({ visible: true })
      .first()
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(eligibilityHeight).toBeGreaterThanOrEqual(44);

    const pageButtonHeight = await visiblePage
      .getByRole("button", { name: "Ranking page 2" })
      .filter({ visible: true })
      .first()
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(pageButtonHeight).toBeGreaterThanOrEqual(44);

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
  await expect(
    page.getByRole("heading", { level: 1, name: "LATEST DAILY WINNER" }),
  ).toBeVisible();
  await expect(
    page.locator(".winner-latest__media").filter({ visible: true }).last(),
  ).toBeVisible();

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
