import { expect, test } from "@playwright/test";

const hallViewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
] as const;

test("renders the editorial Hall sequence and route-scoped chrome", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Editorial structure is covered once in desktop Chromium.",
  );

  await page.goto("/hall-of-fame");

  await expect(
    page.getByRole("heading", { level: 1, name: "HALL OF FAME" }),
  ).toBeVisible();
  await expect(page.getByText("02 · DAILY SPOTLIGHT")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "ONE LOOK. ONE MOMENT. ONE SHARED WALL.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "YOU’VE SEEN THE CHORUS. NOW MAKE YOURS.",
    }),
  ).toBeVisible();
  await expect(page.locator(".site-header--hall")).toBeVisible();
  await expect(page.locator(".site-footer--hall")).toBeVisible();

  const sectionTops = await page
    .locator(".hall-hero, .hall-spotlight, .hall-collection, .hall-cta")
    .evaluateAll((sections) =>
      sections.map((section) => section.getBoundingClientRect().top + scrollY),
    );
  expect(sectionTops).toHaveLength(4);
  expect(sectionTops).toEqual(
    [...sectionTops].sort((left, right) => left - right),
  );
});

test("keeps Hall sort navigation in the URL", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "URL navigation is covered once in desktop Chromium.",
  );

  await page.goto("/hall-of-fame");
  await page.getByRole("link", { name: /TOP RATED/ }).click();
  await expect(page).toHaveURL(/\/hall-of-fame\?sort=top-rated&page=1$/);
  await expect(page.getByRole("link", { name: /TOP RATED/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("supports keyboard rating with isolated inline success", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Rating interaction is covered once without writing to the database.",
  );

  await page.route("**/api/guest/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { guestId: "e2e-guest" } }),
    });
  });
  await page.route("**/api/outfits/*/rating", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { rating: { value: 5 }, aggregate: { average: 4.9, count: 12 } },
      }),
    });
  });

  await page.goto("/hall-of-fame");
  const firstCard = page.locator(".hall-look").first();
  const fiveStars = firstCard.getByRole("radio", {
    name: "Rate 5 out of 5 stars",
  });
  await fiveStars.focus();
  await page.keyboard.press("Space");

  await expect(fiveStars).toBeChecked();
  await expect(firstCard.getByText("Thanks ♡")).toBeVisible();
  await expect(firstCard.getByText("4.9 ★")).toBeVisible();
  await expect(firstCard.getByText("12 ratings")).toBeVisible();
});

test("keeps rating API failures inside the active card", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Rating failure is covered once without writing to the database.",
  );

  await page.route("**/api/guest/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });
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

  await page.goto("/hall-of-fame");
  const firstCard = page.locator(".hall-look").first();
  const threeStars = firstCard.getByRole("radio", {
    name: "Rate 3 out of 5 stars",
  });
  await threeStars.focus();
  await page.keyboard.press("Space");

  await expect(
    firstCard.getByText("Too many rating attempts. Try again later."),
  ).toBeVisible();
  await expect(threeStars).not.toBeChecked();
});

test("exposes VIEW, RATE, OPEN, and DRESS cursor contexts", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Fine-pointer cursor contexts are covered once in desktop Chromium.",
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/hall-of-fame");
  const cursor = page.locator(".hall-cursor");

  await page.locator(".hall-look__media-link").first().hover();
  await expect(cursor).toHaveAttribute("data-label", "VIEW");

  await page.locator(".hall-look .star-rating label").first().hover();
  await expect(cursor).toHaveAttribute("data-label", "RATE");

  await page.getByRole("link", { name: /TRENDING/ }).hover();
  await expect(cursor).toHaveAttribute("data-label", "OPEN");

  await page.locator(".hall-cta__action").hover();
  await expect(cursor).toHaveAttribute("data-label", "DRESS");
});

test("keeps every acceptance width unclipped and rating targets touch-sized", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "The exact responsive matrix runs once in Chromium.",
  );

  await page.goto("/hall-of-fame");
  for (const viewport of hallViewports) {
    await page.setViewportSize(viewport);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${viewport.width}px Hall must not overflow horizontally`,
    ).toBe(true);

    const titleLines = await page
      .locator(".hall-hero__title .home-mask-line > span")
      .evaluateAll((lines) =>
        lines.map((line) => line.getBoundingClientRect().toJSON()),
      );
    expect(
      titleLines.every(
        ({ left, right }) => left >= -1 && right <= viewport.width + 1,
      ),
      `${viewport.width}px Hall title must remain inside the viewport`,
    ).toBe(true);

    const ratingTargetHeights = await page
      .locator(".hall-look .star-rating label")
      .evaluateAll((labels) =>
        labels.map((label) => label.getBoundingClientRect().height),
      );
    expect(ratingTargetHeights.length).toBeGreaterThan(0);
    expect(ratingTargetHeights.every((height) => height >= 44)).toBe(true);

    if (viewport.width <= 430) {
      await expect(page.locator(".hall-look__meta").first()).toBeVisible();
      await expect(
        page.locator(".hall-look__heading dl").first(),
      ).toBeVisible();
    }
  }
});

test("uses instant motion and native cursor when reduced motion is requested", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Reduced motion is covered once in Chromium.",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hall-of-fame");
  await expect(page.locator(".hall-cursor")).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(
    /hall-custom-cursor-ready/,
  );
  await expect(page.locator(".hall-hero__title")).toBeVisible();
});

test("keeps native touch behavior and visible metadata on mobile", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chrome",
    "Touch behavior runs in the mobile Chrome device context.",
  );

  await page.goto("/hall-of-fame");
  await expect(page.locator("html")).not.toHaveClass(
    /hall-custom-cursor-ready/,
  );
  await expect(page.locator(".hall-cursor")).toBeHidden();
  await expect(page.locator(".hall-look__meta").first()).toBeVisible();
});

test("renders empty and route error states without losing the Hall language", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Route states are covered once in Chromium.",
  );

  await page.goto("/hall-of-fame?page=999");
  await expect(
    page.getByRole("heading", { name: "NO LOOKS YET." }),
  ).toBeVisible();
  await expect(
    page.getByText("Be the first to make some noise."),
  ).toBeVisible();

  await page.goto("/hall-of-fame?sort=not-a-sort");
  await expect(
    page.getByRole("heading", { name: "WE COULDN’T LOAD THE LOOKS." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /TRY AGAIN/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /START DRESSING/ }),
  ).toBeVisible();
});

test("shows the Hall loading composition during a collection transition", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Loading transition is covered once in Chromium.",
  );

  await page.goto("/hall-of-fame");
  await page.route("**/hall-of-fame?*", async (route) => {
    if (route.request().headers().rsc === "1") {
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    await route.continue();
  });

  await page.getByRole("link", { name: /TRENDING/ }).click();
  await expect(page.locator(".hall-loading")).toBeVisible();
  await expect(page).toHaveURL(/sort=trending&page=1/);
});
