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

test("separates the finalized spotlight from the live provisional race", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Editorial structure is covered once in desktop Chromium.",
  );
  await installStableRanking(page);
  await page.goto("/daily-winners");

  await expect(
    page.getByRole("heading", { level: 1, name: "DAILY WINNER" }),
  ).toBeVisible();
  await expect(page.getByText("02 · FINAL SPOTLIGHT")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "LIVE RANKING" }),
  ).toBeVisible();
  await expect(page.getByText("LIVE · PROVISIONAL")).toBeVisible();
  await expect(page.locator(".site-header--winners")).toBeVisible();
  await expect(page.locator(".site-footer--winners")).toBeVisible();

  const liveLeader = page.locator(".live-ranking__item").first();
  await expect(liveLeader.getByText("CURRENT LEADER")).toBeVisible();
  await expect(liveLeader).not.toContainText("WINNER");
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

  const second = page.locator(".live-ranking__item").nth(1);
  await expect(second.locator(".live-ranking__eligibility")).toHaveText(
    "NEEDS 1 MORE RATING",
  );
  await expect(second).not.toContainText("0 RATINGS");

  await page.getByText("HOW THE RANKING WORKS").click();
  await expect(page.getByText(/Eligibility begins at 5 ratings/)).toBeVisible();
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
  await page.route("**/api/daily-winners", async (route) => {
    requestCount += 1;
    if (requestCount === 1) return fulfillRanking(route);
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: "{}",
    });
  });
  await page.goto("/daily-winners");
  await expect(page.getByText("UPDATED", { exact: true })).toBeVisible();

  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(page.getByText("LAST VERIFIED", { exact: true })).toBeVisible();
  await expect(page.getByText("Reconnect pending")).toBeVisible();
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

    const eligibilityHeight = await page
      .locator(".live-ranking__eligibility")
      .first()
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(eligibilityHeight).toBeGreaterThanOrEqual(44);

    const cta = page.locator(".winner-cta__action");
    const ctaSize = await cta.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      height: element.getBoundingClientRect().height,
    }));
    expect(ctaSize.scrollWidth).toBeLessThanOrEqual(ctaSize.clientWidth + 1);
    expect(ctaSize.height).toBeGreaterThanOrEqual(44);

    if (viewport.width < 768) {
      await expect(page.locator(".winner-cursor")).toBeHidden();
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
  const cursor = page.locator(".winner-cursor");

  await page.locator(".live-ranking__image").first().hover();
  await expect(cursor).toHaveAttribute("data-label", "VIEW");
  await page.getByText("HOW THE RANKING WORKS").hover();
  await expect(cursor).toHaveAttribute("data-label", "OPEN");
  await page.locator(".winner-cta__action").hover();
  await expect(cursor).toHaveAttribute("data-label", "DRESS");
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
  await expect(page.locator(".winner-cursor")).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(
    /winner-custom-cursor-ready/,
  );
  await expect(page.locator(".live-ranking__item").first()).toContainText(
    "LIVEA001",
  );
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
  await expect(page.locator(".winner-cursor")).toBeHidden();
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
  await page.locator(".winner-cta__action").click();
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
  await expect(page.locator(".winner-cta__action")).toBeFocused();
});
