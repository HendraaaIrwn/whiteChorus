import { expect, test, type Page } from "@playwright/test";

async function mockGuestSession(page: Page) {
  await page.route("**/api/guest/session", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { expiresAt: "2026-08-09T00:00:00.000Z" },
      }),
    });
  });
}

test("keeps the editorial landing content usable without legacy runtimes", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "DRESS THE CHORUS YOUR WAY." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "START DRESSING" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "EXPLORE HALL OF FAME" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "HOW THE CHORUS COMES TOGETHER." }),
  ).toBeVisible();
  await expect(page.locator(".hero-person")).toHaveCount(2);
  await expect(page.locator(".hero-stage__background")).toHaveAttribute(
    "src",
    /background-01\.webp/,
  );
  await expect(page.locator(".hero-person--a img")).toHaveAttribute(
    "src",
    /emir-look-01\.webp/,
  );
  await expect(page.locator(".hero-person--b img")).toHaveAttribute(
    "src",
    /friska-look-01\.webp/,
  );
  expect(pageErrors).toEqual([]);
});

test("hydrates the Studio footer scroll target without Motion errors", async ({
  page,
}) => {
  const targetRefErrors: string[] = [];
  page.on("pageerror", (error) => {
    if (error.message.includes("Target ref is defined but not hydrated")) {
      targetRefErrors.push(error.message);
    }
  });

  await page.goto("/studio");
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );

  expect(targetRefErrors).toEqual([]);
});

test("keeps the Studio CTA blue wave spaced without moving the white wave", async ({
  page,
}) => {
  await page.goto("/studio");

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    const footer = page
      .locator(".site-footer--studio")
      .filter({ visible: true });
    await footer.scrollIntoViewIfNeeded();

    const link = footer.getByRole("link", {
      name: /ENTER THE HALL OF FAME ↗/i,
    });
    const beforeHover = await footer.evaluate((element) => {
      const linkElement = element.querySelector<HTMLElement>(
        ".studio-editorial-footer__link",
      )!;
      const heading = linkElement.getBoundingClientRect();
      const wave = element
        .querySelector(".studio-editorial-footer__doodle--wave")!
        .getBoundingClientRect();
      const linkStyle = getComputedStyle(linkElement);
      const layer = element.querySelector<HTMLElement>(
        ".studio-editorial-footer__doodles",
      )!;
      const doodles = [...layer.querySelectorAll("svg")];

      return {
        doodleCount: doodles.length,
        doodlesHaveSingleOpenPath: doodles.every(
          (doodle) =>
            doodle.querySelectorAll("path").length === 1 &&
            !doodle.querySelector("polygon, polyline, line"),
        ),
        headingBounds: heading.toJSON(),
        headingFontSize: Number.parseFloat(linkStyle.fontSize),
        headingLineHeight: linkStyle.lineHeight,
        headingLines: linkElement.querySelectorAll("span").length,
        textDecorationColor: linkStyle.textDecorationColor,
        textDecorationLine: linkStyle.textDecorationLine,
        textUnderlineOffset: Number.parseFloat(linkStyle.textUnderlineOffset),
        whiteWaveBounds: wave.toJSON(),
        layerPointerEvents: getComputedStyle(layer).pointerEvents,
        layerZIndex: Number.parseInt(getComputedStyle(layer).zIndex, 10),
        linkZIndex: Number.parseInt(linkStyle.zIndex, 10),
      };
    });

    expect(beforeHover.doodleCount).toBe(3);
    expect(beforeHover.doodlesHaveSingleOpenPath).toBe(true);
    expect(beforeHover.textDecorationLine).toContain("underline");
    expect(beforeHover.textUnderlineOffset).toBeGreaterThanOrEqual(16);
    expect(beforeHover.textUnderlineOffset).toBeLessThanOrEqual(24);
    expect(beforeHover.layerPointerEvents).toBe("none");
    expect(beforeHover.layerZIndex).toBeLessThan(beforeHover.linkZIndex);

    await expect(link).toBeVisible();
    await link.hover();

    const afterHover = await footer.evaluate((element) => {
      const linkElement = element.querySelector<HTMLElement>(
        ".studio-editorial-footer__link",
      )!;
      const heading = linkElement.getBoundingClientRect();
      const wave = element
        .querySelector(".studio-editorial-footer__doodle--wave")!
        .getBoundingClientRect();
      const linkStyle = getComputedStyle(linkElement);

      return {
        headingBounds: heading.toJSON(),
        headingFontSize: Number.parseFloat(linkStyle.fontSize),
        headingLineHeight: linkStyle.lineHeight,
        headingLines: linkElement.querySelectorAll("span").length,
        textDecorationColor: linkStyle.textDecorationColor,
        textUnderlineOffset: Number.parseFloat(linkStyle.textUnderlineOffset),
        whiteWaveBounds: wave.toJSON(),
      };
    });

    expect(afterHover.textDecorationColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(afterHover.textUnderlineOffset).toBe(
      beforeHover.textUnderlineOffset,
    );
    expect(afterHover.headingBounds).toEqual(beforeHover.headingBounds);
    expect(afterHover.headingFontSize).toBe(beforeHover.headingFontSize);
    expect(afterHover.headingLineHeight).toBe(beforeHover.headingLineHeight);
    expect(afterHover.headingLines).toBe(beforeHover.headingLines);
    expect(afterHover.whiteWaveBounds).toEqual(beforeHover.whiteWaveBounds);
  }
});

test("shows and refreshes the current daily ranking", async ({ page }) => {
  await page.route("**/api/daily-winners", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          winners: [],
          ranking: {
            dayKey: "2026-08-08",
            dayStart: "2026-08-07T17:00:00.000Z",
            dayEnd: "2026-08-08T17:00:00.000Z",
            generatedAt: "2026-08-08T08:30:00.000Z",
            timeZone: "Asia/Jakarta",
            minimumRatings: 5,
            items: [
              {
                id: "live-look",
                rank: 1,
                shortCode: "LIVE0001",
                thumbnailUrl: "",
                ratingAverage: 4.8,
                ratingCount: 8,
                weightedScore: 4.62,
                eligible: true,
                ratingsNeeded: 0,
                publishedAt: "2026-08-08T01:00:00.000Z",
              },
            ],
          },
        },
      }),
    });
  });

  await page.goto("/daily-winners");
  await expect(
    page.getByRole("heading", { name: "DAILY WINNER" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "LIVE RANKING" }),
  ).toBeVisible();
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(page.getByText("ANONYMOUS #LIVE0001")).toBeVisible();
  await expect(page.getByText("ELIGIBLE", { exact: true })).toBeVisible();
});

test("runs the landing intro once and preserves the root audio element", async ({
  page,
}) => {
  await mockGuestSession(page);
  await page.goto("/");
  await expect(
    page.locator("[data-landing-intro='played']").filter({ visible: true }),
  ).toBeVisible();

  await page.evaluate(() => {
    (
      window as typeof window & { __whiteChorusAudio?: HTMLAudioElement | null }
    ).__whiteChorusAudio = document.querySelector("audio");
  });

  await page.getByRole("button", { name: "START DRESSING" }).first().click();
  await page.getByRole("button", { name: "ENTER SILENTLY" }).click();
  await expect(page).toHaveURL(/\/studio$/);
  expect(
    await page.evaluate(
      () =>
        (
          window as typeof window & {
            __whiteChorusAudio?: HTMLAudioElement | null;
          }
        ).__whiteChorusAudio === document.querySelector("audio"),
    ),
  ).toBe(true);

  await page.getByRole("link", { name: "White Chorus home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-landing-intro='skipped']")).toBeVisible();
});

test("enters with music and preserves the playback preference", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: () => Promise.resolve(),
    });
  });
  await mockGuestSession(page);
  await page.goto("/");

  await page.getByRole("button", { name: "START DRESSING" }).first().click();
  await page.getByRole("button", { name: "ENTER WITH MUSIC" }).click();

  await expect(page).toHaveURL(/\/studio$/);
  await expect(
    page.getByRole("button", { name: "Mute background music" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("white-chorus:music-preference"),
      ),
    )
    .toBe("playing");

  await page.getByRole("link", { name: "White Chorus home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("button", { name: "Mute background music" }),
  ).toBeVisible();
});

test("closes the audio dialog with Escape and returns focus", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "START DRESSING" }).first();
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("uses static, functional feedback when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "DRESS THE CHORUS YOUR WAY." }),
  ).toBeVisible();
  await expect(
    page.locator(".hero-person--a").filter({ visible: true }),
  ).toHaveCSS("opacity", "1");
  await expect(
    page.locator(".hero-person--b").filter({ visible: true }),
  ).toHaveCSS("opacity", "1");
  await expect(
    page.locator(".hero-heading").filter({ visible: true }),
  ).toHaveCSS("transform", "none");
});

test("enters silently and restores a saved studio draft", async ({ page }) => {
  await mockGuestSession(page);

  await page.goto("/");
  await page.getByRole("button", { name: "START DRESSING" }).first().click();
  await page.getByRole("button", { name: "ENTER SILENTLY" }).click();

  await expect(page).toHaveURL(/\/studio$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "YOUR STAGE · TWO VOICES",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "DRESS EMIR" }).locator("img"),
  ).toHaveAttribute("src", /emir-icon\.webp/);
  await expect(
    page.getByRole("button", { name: "DRESS FRISKA" }).locator("img"),
  ).toHaveAttribute("src", /friska-icon\.webp/);
  await page.getByRole("tab", { name: "ONE-PIECE" }).click();
  await page.getByRole("radio", { name: /one piece 02/i }).click();
  await expect(
    page.getByRole("radio", { name: /selected: one piece 02/i }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(
    page
      .getByRole("radio", { name: /selected: one piece 02/i })
      .locator(".item-check"),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("white-chorus:dress-up-draft:v2"),
      ),
    )
    .toContain('"onePieceId":"a-one-piece-02"');

  await page.reload();
  await page.getByRole("tab", { name: "ONE-PIECE" }).click();
  await expect(
    page.getByRole("radio", { name: /selected: one piece 02/i }),
  ).toHaveAttribute("aria-checked", "true");

  await page.evaluate(() => {
    const draft = JSON.parse(
      window.localStorage.getItem("white-chorus:dress-up-draft:v2")!,
    ) as { characterA: { topId: string } };
    draft.characterA.topId = "a-hair-01";
    window.localStorage.setItem(
      "white-chorus:dress-up-draft:v2",
      JSON.stringify(draft),
    );
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("white-chorus:dress-up-draft:v2"),
      ),
    )
    .toContain('"topId":"a-top-01"');
});

test("uses straight, uniform geometry for the styling workspace", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/studio");

  await expect(
    page.getByRole("region", { name: "Character stage" }),
  ).toBeVisible();

  const geometry = await page.evaluate(() => {
    const visible = (selector: string) =>
      [...document.querySelectorAll(selector)].find((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.width > 0 && bounds.height > 0;
      })!;
    const rotation = (element: Element) => {
      const transform = getComputedStyle(element).transform;
      if (transform === "none") return 0;
      const matrix = new DOMMatrixReadOnly(transform);
      return Math.atan2(matrix.b, matrix.a);
    };
    const support = visible(".studio-stage-panel");
    const stage = support.querySelector(".studio-stage__art")!;
    const rail = visible(".item-rail");
    const cards = [...rail.querySelectorAll("button")];
    const switchers = [
      ...support.querySelectorAll(".character-switcher button"),
    ];
    const actionDock = visible(".studio-action-dock");
    const actions = [...actionDock.querySelectorAll(".studio-action")];

    return {
      stage: {
        borderRadius: getComputedStyle(stage).borderRadius,
        clipPath: getComputedStyle(stage).clipPath,
        rotation: rotation(stage),
        supportRotation: rotation(support),
      },
      cards: cards.map((card) => ({
        borderRadius: getComputedStyle(card).borderRadius,
        height: card.getBoundingClientRect().height,
        rotation: rotation(card),
        width: card.getBoundingClientRect().width,
      })),
      switchRotations: switchers.map(rotation),
      actions: actions.map((action) => ({
        borderRadius: getComputedStyle(action).borderRadius,
        hasHomeAction: action.classList.contains("home-action"),
        labelCount: action.querySelectorAll(".button__label-stack > span")
          .length,
        rotation: rotation(action),
      })),
    };
  });

  expect(geometry.stage.borderRadius).toBe("32px");
  expect(geometry.stage.clipPath).toBe("none");
  expect(Math.abs(geometry.stage.rotation)).toBeLessThan(0.001);
  expect(Math.abs(geometry.stage.supportRotation)).toBeLessThan(0.001);

  expect(geometry.cards.length).toBeGreaterThan(1);
  expect(
    new Set(geometry.cards.map(({ borderRadius }) => borderRadius)),
  ).toEqual(new Set(["18px"]));
  expect(
    Math.max(...geometry.cards.map(({ width }) => width)) -
      Math.min(...geometry.cards.map(({ width }) => width)),
  ).toBeLessThanOrEqual(1);
  expect(
    Math.max(...geometry.cards.map(({ height }) => height)) -
      Math.min(...geometry.cards.map(({ height }) => height)),
  ).toBeLessThanOrEqual(1);
  expect(
    geometry.cards.every(({ rotation }) => Math.abs(rotation) < 0.001),
  ).toBe(true);
  expect(
    geometry.switchRotations.every((rotation) => Math.abs(rotation) < 0.001),
  ).toBe(true);
  expect(geometry.actions).toHaveLength(3);
  expect(
    geometry.actions.every(
      ({ borderRadius, hasHomeAction, labelCount, rotation }) =>
        borderRadius === "0px" &&
        hasHomeAction &&
        labelCount === 2 &&
        Math.abs(rotation) < 0.001,
    ),
  ).toBe(true);
});

test("uses the compact wardrobe hierarchy and text-only category tabs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/studio");
  await page.getByRole("radio", { name: /choose hair 01/i }).click();
  await expect(
    page.getByRole("radio", { name: /selected: hair 01/i }),
  ).toHaveAttribute("aria-checked", "true");

  const surfaces = await page.evaluate(() => {
    const wardrobe = document.querySelector<HTMLElement>(".studio-wardrobe")!;
    const tabs = wardrobe.querySelector<HTMLElement>(".category-tabs")!;
    const activeTab = tabs.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]',
    )!;
    const inactiveTab = tabs.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="false"]',
    )!;
    const activeIndicator = activeTab.querySelector<HTMLElement>(
      ".category-tab__indicator",
    )!;
    const selectedCard = wardrobe.querySelector<HTMLElement>(
      '.item-rail [role="radio"][aria-checked="true"]',
    )!;
    const unselectedCard = wardrobe.querySelector<HTMLElement>(
      '.item-rail [role="radio"][aria-checked="false"]',
    )!;
    const pageSurface = document.querySelector<HTMLElement>(".studio-page")!;
    const heading = wardrobe.querySelector<HTMLElement>(
      ".studio-wardrobe__heading",
    )!;
    const backgroundCarousel = wardrobe.querySelector<HTMLElement>(
      ".background-carousel",
    )!;
    const itemPanel = wardrobe.querySelector<HTMLElement>(".item-panel")!;

    const style = (element: Element) => getComputedStyle(element);

    return {
      pageBackground: style(pageSurface).backgroundColor,
      panelBackground: style(wardrobe).backgroundColor,
      panelBorderStyle: style(wardrobe).borderStyle,
      panelBorderWidth: style(wardrobe).borderWidth,
      panelRadius: style(wardrobe).borderRadius,
      panelLayer: style(wardrobe).boxShadow,
      tabRailBackground: style(tabs).backgroundColor,
      tabRailBorderWidth: style(tabs).borderWidth,
      activeTabBackground: style(activeTab).backgroundColor,
      inactiveTabBackground: style(inactiveTab).backgroundColor,
      activeTabColor: style(activeTab).color,
      activeTabBorderStyle: style(activeTab).borderStyle,
      activeTabBorderWidth: style(activeTab).borderWidth,
      inactiveTabColor: style(inactiveTab).color,
      activeIndicatorBorderColor: style(activeIndicator).borderTopColor,
      activeIndicatorBorderStyle: style(activeIndicator).borderTopStyle,
      activeIndicatorBorderWidth: style(activeIndicator).borderTopWidth,
      selectedCardBackground: style(selectedCard).backgroundColor,
      unselectedCardBackground: style(unselectedCard).backgroundColor,
      unselectedCardBorderStyle: style(unselectedCard).borderStyle,
      unselectedCardBorderWidth: style(unselectedCard).borderWidth,
      tabCount: tabs.querySelectorAll('[role="tab"]').length,
      hierarchy: [heading, backgroundCarousel, tabs, itemPanel].map(
        (element) => element.getBoundingClientRect().top,
      ),
    };
  });

  expect(surfaces.panelBackground).not.toBe(surfaces.pageBackground);
  expect(surfaces.panelBorderStyle).toBe("solid");
  expect(surfaces.panelBorderWidth).toBe("1px");
  expect(surfaces.panelRadius).toBe("22px");
  expect(surfaces.panelLayer).not.toBe("none");
  expect(surfaces.tabRailBackground).not.toBe(surfaces.panelBackground);
  expect(surfaces.tabRailBorderWidth).toBe("0px");
  expect(surfaces.activeTabBackground).toBe(surfaces.inactiveTabBackground);
  expect(surfaces.activeTabBackground).toBe("rgba(0, 0, 0, 0)");
  expect(surfaces.activeTabColor).not.toBe(surfaces.inactiveTabColor);
  expect(surfaces.activeTabBorderStyle).toBe("none");
  expect(surfaces.activeTabBorderWidth).toBe("0px");
  expect(surfaces.activeIndicatorBorderStyle).toBe("dashed");
  expect(surfaces.activeIndicatorBorderWidth).toBe("3px");
  expect(surfaces.activeIndicatorBorderColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(surfaces.unselectedCardBackground).not.toBe(surfaces.panelBackground);
  expect(surfaces.selectedCardBackground).not.toBe(
    surfaces.unselectedCardBackground,
  );
  expect(surfaces.unselectedCardBorderStyle).toBe("solid");
  expect(surfaces.unselectedCardBorderWidth).toBe("1px");
  expect(surfaces.tabCount).toBe(6);
  expect(surfaces.hierarchy).toEqual(
    [...surfaces.hierarchy].sort((a, b) => a - b),
  );
  await expect(
    page.locator("#main-content").getByText("WARDROBE · EMIR", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("DRAFT SAVES AUTOMATICALLY")).toHaveCount(0);
  await expect(
    page.locator(".background-carousel__rail").getByRole("radio"),
  ).toHaveCount(5);
});

test("gives inactive category tabs restrained palette hover feedback", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Fine-pointer hover feedback runs in desktop Chromium.",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/studio");

  const activeTab = page.getByRole("tab", { name: "HAIR" });
  const inactiveTab = page.getByRole("tab", { name: "TOP" });
  const activeColor = await activeTab.evaluate(
    (element) => getComputedStyle(element).color,
  );
  const inactiveColor = await inactiveTab.evaluate(
    (element) => getComputedStyle(element).color,
  );

  await inactiveTab.hover();

  await expect
    .poll(() =>
      inactiveTab.evaluate((element) => getComputedStyle(element).color),
    )
    .not.toBe(inactiveColor);
  await expect
    .poll(() =>
      inactiveTab.evaluate(
        (element) =>
          new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeLessThan(-0.9);
  await expect(activeTab).toHaveCSS("color", activeColor);
  await expect(activeTab.locator(".category-tab__indicator")).toHaveCSS(
    "border-top-style",
    "dashed",
  );
});

test("keeps the background carousel available without duplicating its cards", async ({
  page,
}) => {
  await page.goto("/studio");

  const hairTab = page.getByRole("tab", { name: "HAIR" });
  await expect(hairTab).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("radio", { name: /choose mint room background/i })
    .click();
  await expect(hairTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "HAIR" })).toBeVisible();
  await expect(
    page.locator('.studio-stage__background[src*="background-02.webp"]'),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "BACKGROUND" })).toHaveCount(0);
  await expect(
    page.locator("#main-content #studio-item-panel").filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: /background/i }),
    "background choices should exist only in the permanent carousel",
  ).toHaveCount(5);
});

test("gives background cards polished hover and press feedback", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Pointer choreography runs in desktop Chromium.",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/studio");

  const card = page
    .locator("#main-content .background-carousel__rail [role='radio']")
    .filter({ visible: true })
    .nth(1);
  await expect(card).toHaveAccessibleName(/choose mint room background/i);
  const before = await card.evaluate((element) => ({
    border: getComputedStyle(element).borderColor,
  }));

  await card.hover();
  await expect
    .poll(() =>
      card.evaluate(
        (element) =>
          new DOMMatrixReadOnly(getComputedStyle(element).transform).a,
      ),
    )
    .toBeGreaterThan(1.02);
  await expect
    .poll(() =>
      card.evaluate(
        (element) =>
          new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeLessThanOrEqual(-4);

  const hovered = await card.evaluate((element) => ({
    border: getComputedStyle(element).borderColor,
    matrix: new DOMMatrixReadOnly(getComputedStyle(element).transform),
  }));
  expect(hovered.border).not.toBe(before.border);
  expect(hovered.matrix.a).toBeGreaterThan(1.02);
  expect(hovered.matrix.m42).toBeLessThanOrEqual(-4);

  const bounds = await card.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await page.mouse.down();
  await expect
    .poll(() =>
      card.evaluate(
        (element) =>
          new DOMMatrixReadOnly(getComputedStyle(element).transform).a,
      ),
    )
    .toBeLessThan(1);
  await page.mouse.up();
  await expect(card).toHaveAttribute("aria-checked", "true");
});

test("gives wardrobe cards a restrained fine-pointer hover", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Hover choreography runs in desktop Chromium.",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/studio");

  const card = page.getByRole("radio", { name: /choose hair 01/i });
  const before = await card.evaluate((element) => ({
    border: getComputedStyle(element).borderColor,
    transform: getComputedStyle(element).transform,
  }));
  await card.hover();
  await expect
    .poll(() => card.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(before.transform);
  const hovered = await card.evaluate((element) => ({
    border: getComputedStyle(element).borderColor,
    bounds: element.getBoundingClientRect().toJSON(),
    matrix: new DOMMatrixReadOnly(getComputedStyle(element).transform),
    railBounds: element.parentElement!.getBoundingClientRect().toJSON(),
    zIndex: getComputedStyle(element).zIndex,
  }));
  expect(hovered.border).not.toBe(before.border);
  expect(hovered.matrix.a).toBeGreaterThan(1);
  expect(hovered.matrix.m42).toBeLessThan(0);
  expect(hovered.bounds.top).toBeGreaterThanOrEqual(hovered.railBounds.top);
  expect(hovered.bounds.right).toBeLessThanOrEqual(hovered.railBounds.right);
  expect(hovered.bounds.bottom).toBeLessThanOrEqual(hovered.railBounds.bottom);
  expect(hovered.bounds.left).toBeGreaterThanOrEqual(hovered.railBounds.left);
  expect(Number(hovered.zIndex)).toBeGreaterThanOrEqual(2);
});

test("matches the homepage hero CTA label motion", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Hover choreography runs in desktop Chromium.",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/studio");

  const randomize = page.getByRole("button", { name: "RANDOMIZE ALL" });
  const reset = page.getByRole("button", { name: "RESET ALL" });
  const publish = page.getByRole("button", {
    name: "PUBLISH TO HALL OF FAME",
  });

  await randomize.click();
  await expect(publish).toBeEnabled();
  await expect(randomize).toBeEnabled();

  for (const action of [randomize, reset, publish]) {
    await action.hover();
    await expect
      .poll(() =>
        action.evaluate((element) => {
          const labels = element.querySelectorAll<HTMLElement>(
            ".button__label-stack > span",
          );
          return [...labels].map((label) => {
            const transform = getComputedStyle(label).transform;
            return transform === "none"
              ? 0
              : new DOMMatrixReadOnly(transform).m42;
          });
        }),
      )
      .toEqual([expect.any(Number), 0]);
    const labelOffsets = await action.evaluate((element) => {
      const labels = element.querySelectorAll<HTMLElement>(
        ".button__label-stack > span",
      );
      return [...labels].map((label) => {
        const transform = getComputedStyle(label).transform;
        return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
      });
    });
    expect(labelOffsets[0]).toBeLessThan(-40);
    expect(Math.abs(labelOffsets[1] ?? Number.POSITIVE_INFINITY)).toBeLessThan(
      1,
    );
  }
});

test("keeps both characters visible while dressing only the active voice", async ({
  page,
}) => {
  await page.goto("/studio");

  await expect(
    page
      .locator('img[src*="/dress-up/character-a/base.webp"]')
      .filter({ visible: true }),
  ).toHaveCount(1);
  await expect(
    page
      .locator('img[src*="/dress-up/character-b/base.webp"]')
      .filter({ visible: true }),
  ).toHaveCount(1);

  const friska = page.getByRole("button", { name: "DRESS FRISKA" });
  await friska.click();
  await expect(friska).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: "TOP" }).click();
  await page.getByRole("radio", { name: /top 02/i }).click();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const draft = JSON.parse(
          window.localStorage.getItem("white-chorus:dress-up-draft:v2")!,
        ) as {
          characterA: { topId: string | null };
          characterB: { topId: string | null };
        };
        return [draft.characterA.topId, draft.characterB.topId];
      }),
    )
    .toEqual(["a-top-01", "b-top-02"]);
});

test("supports keyboard navigation for backgrounds and category tabs", async ({
  page,
}) => {
  await page.goto("/studio");

  const firstBackground = page.getByRole("radio", {
    name: /selected: dance floor background/i,
  });
  await firstBackground.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: /selected: mint room background/i }),
  ).toBeFocused();
  await expect(
    page.locator('.studio-stage__background[src*="background-02.webp"]'),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("white-chorus:dress-up-draft:v2"),
      ),
    )
    .toContain('"backgroundId":"background-02"');

  const hairTab = page.getByRole("tab", { name: "HAIR" });
  await hairTab.focus();
  await page.keyboard.press("End");
  const accessoryTab = page.getByRole("tab", { name: "ACCESSORIES" });
  await expect(accessoryTab).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() =>
      accessoryTab.evaluate((element) => {
        const tab = element.getBoundingClientRect();
        const rail = element.parentElement!.getBoundingClientRect();
        return tab.left >= rail.left - 1 && tab.right <= rail.right + 1;
      }),
    )
    .toBe(true);
});

test("randomizes and resets the full studio configuration", async ({
  page,
}) => {
  await page.goto("/studio");
  await page.getByRole("radio", { name: /hair 02/i }).click();
  await expect(
    page.getByRole("radio", { name: /selected: hair 02/i }),
  ).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "RESET ALL" }).click();
  await expect(page.getByText("The studio has been reset.")).toBeVisible();
  await expect(page.locator(".studio-production-layer")).toHaveCount(3);
  await expect(
    page.getByRole("radio", { name: /choose hair 01/i }),
  ).toHaveAttribute("aria-checked", "false");
  await expect(
    page.getByRole("button", { name: "PUBLISH TO HALL OF FAME" }),
  ).toBeDisabled();

  await page.evaluate(() => {
    const state = window as typeof window & {
      __studioRandomizeObserved?: boolean;
      __studioReactionObserved?: boolean;
    };
    state.__studioRandomizeObserved = false;
    state.__studioReactionObserved = false;
    const observer = new MutationObserver(() => {
      if (document.querySelector(".item-rail[data-randomizing='true']"))
        state.__studioRandomizeObserved = true;
      if (document.querySelector(".studio-randomize-reaction"))
        state.__studioReactionObserved = true;
    });
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  });
  await page.getByRole("button", { name: "RANDOMIZE ALL" }).click();
  await expect(page.getByText("A valid random look is ready.")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __studioRandomizeObserved?: boolean;
            }
          ).__studioRandomizeObserved,
      ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __studioReactionObserved?: boolean;
            }
          ).__studioReactionObserved,
      ),
    )
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "PUBLISH TO HALL OF FAME" }),
  ).toBeEnabled();
});

test("shows branded fallbacks when local studio artwork fails", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Network-level artwork fallbacks are covered once in desktop Chromium.",
  );
  await page.route(
    /\/dress-up\/(backgrounds\/background-01\.webp|character-a\/thumbnails\/a-hair-01\.webp)$/,
    async (route) =>
      route.fulfill({
        status: 404,
        contentType: "image/webp",
        body: "",
      }),
  );

  await page.goto("/studio");

  await expect(page.locator(".studio-stage__asset-fallback")).toContainText(
    "ARTWORK UNAVAILABLE",
  );
  await expect(page.locator(".item-thumbnail-fallback")).toHaveCount(1);
  await expect(
    page.getByText(/Some (studio|wardrobe) artwork could not load\./),
  ).toBeVisible();
});

test("reports an audio failure without blocking studio entry", async ({
  page,
}) => {
  await mockGuestSession(page);
  await page.route("**/audio/white-chorus-theme.mp3", async (route) => {
    await route.abort();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "START DRESSING" }).first().click();
  await page.getByRole("button", { name: "ENTER WITH MUSIC" }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(
    page.getByRole("button", { name: "Music unavailable" }),
  ).toBeVisible();
});

test("shows processing feedback and an accessible publish success dialog", async ({
  page,
}) => {
  await mockGuestSession(page);
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

  await expect(page.getByText("LOOK IS LIVE", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "YOUR LOOK IS IN THE HALL" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "VIEW YOUR LOOK" }).last(),
  ).toHaveAttribute("href", "/outfits/animated-look");
  await expect(
    page.getByRole("dialog").getByText("Publish complete. Your look is live."),
  ).toBeVisible();
  await page.getByRole("button", { name: "KEEP DRESSING" }).click();
  await expect(
    page.getByRole("button", { name: "PUBLISH TO HALL OF FAME" }),
  ).toBeFocused();
});

test("freezes editing controls while the published look is rendering", async ({
  page,
}) => {
  await mockGuestSession(page);
  await page.route("**/api/outfits", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { url: "/outfits/frozen-look" },
      }),
    });
  });

  await page.goto("/studio");
  await page.getByRole("button", { name: "PUBLISH TO HALL OF FAME" }).click();

  await expect(
    page.getByRole("region", { name: "Character stage" }),
  ).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("button", { name: "DRESS EMIR" })).toBeDisabled();
  await expect(page.getByRole("tab", { name: "TOP" })).toBeDisabled();
  await expect(page.getByRole("radio", { name: /hair 01/i })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "RANDOMIZE ALL" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "RESET ALL" })).toBeDisabled();

  await expect(
    page.getByRole("heading", { name: "YOUR LOOK IS IN THE HALL" }),
  ).toBeVisible();
});

test("uses the Studio contextual cursor only on a ready fine pointer", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Cursor states are covered once with a desktop fine pointer.",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/studio");
  await page.mouse.move(40, 40);

  await expect(page.locator("html")).toHaveClass(/studio-custom-cursor-ready/);
  const cursor = page.locator(".studio-cursor").filter({ visible: true });

  const topTab = page.getByRole("tab", { name: "TOP" });
  await topTab.hover();
  await expect(cursor).toHaveAttribute("data-label", "SELECT");
  await topTab.click();

  await page.getByRole("radio", { name: /top 01/i }).hover();
  await expect(cursor).toHaveAttribute("data-label", "DRESS");

  await page.getByRole("button", { name: "PUBLISH TO HALL OF FAME" }).hover();
  await expect(cursor).toHaveAttribute("data-label", "SAVE");

  await page.getByRole("button", { name: "Open menu" }).hover();
  await expect(cursor).not.toHaveAttribute("data-label", "OPEN");
  await expect(cursor.locator("span")).toBeEmpty();
  await expect(cursor).toHaveCSS("width", "14px");
});

test("preserves the draft and skips celebration when publish fails", async ({
  page,
}) => {
  await mockGuestSession(page);
  await page.route("**/api/outfits", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: { message: "We could not create your final image." },
      }),
    });
  });

  await page.goto("/studio");
  await page.getByRole("button", { name: "PUBLISH TO HALL OF FAME" }).click();
  await expect(
    page.getByText("We could not create your final image."),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".publish-success-burst")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("white-chorus:dress-up-draft:v2"),
      ),
    )
    .not.toBeNull();
});

test("reveals and gates the Turnstile challenge when requested", async ({
  page,
}) => {
  await mockGuestSession(page);
  await page.route("**/api/outfits", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "TURNSTILE_REQUIRED",
          message: "Complete the security challenge to publish.",
        },
      }),
    });
  });

  await page.goto("/studio");
  const publish = page.getByRole("button", {
    name: "PUBLISH TO HALL OF FAME",
  });
  await publish.click();

  await expect(
    page.getByRole("region", { name: "Publish security" }),
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "not configured" }),
  ).toBeVisible();
  await expect(publish).toBeDisabled();
});

test("keeps repeated studio interactions usable with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/studio");

  const friska = page.getByRole("button", { name: "DRESS FRISKA" });
  await friska.click();
  await expect(friska).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("tab", { name: "ACCESSORIES" }).click();
  await page.getByRole("radio", { name: /accessory 03/i }).click();
  await expect(
    page.getByRole("radio", { name: /selected: accessory 03/i }),
  ).toHaveAttribute("aria-checked", "true");

  await page.getByRole("tab", { name: "HAIR" }).click();
  await page.getByRole("tab", { name: "ACCESSORIES" }).click();
  await expect(
    page.getByRole("radio", { name: /selected: accessory 03/i }),
  ).toHaveAttribute("aria-checked", "true");
});
