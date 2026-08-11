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
    page.getByRole("heading", { name: "STYLE EMIR & FRISKA" }),
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

  await page.getByRole("tab", { name: "BACKGROUND" }).click();

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
  const backgroundTab = page.getByRole("tab", { name: "BACKGROUND" });
  await expect(backgroundTab).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() =>
      backgroundTab.evaluate((element) => {
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
