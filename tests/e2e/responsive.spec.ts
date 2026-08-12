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

const homepageViewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1536, height: 1024 },
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
        page.locator(".item-rail").filter({ visible: true }),
      ).toHaveCSS("overflow-x", "auto");
    } else {
      await expect(page.getByText("STUDIO · AUTO-SAVED")).toBeVisible();
    }

    const categoryTabs = page
      .locator(".category-tabs")
      .filter({ visible: true });
    const categoryGeometry = await categoryTabs.evaluate((element) => {
      const rail = element.getBoundingClientRect();
      const wardrobe = element
        .closest(".studio-wardrobe")!
        .getBoundingClientRect();
      const tabs = [...element.querySelectorAll("button")].map((tab) => {
        const bounds = tab.getBoundingClientRect();
        const label = tab.querySelector("span")!.getBoundingClientRect();
        return {
          clientWidth: tab.clientWidth,
          fontSize: Number.parseFloat(getComputedStyle(tab).fontSize),
          labelLeft: label.left,
          labelRight: label.right,
          left: bounds.left,
          right: bounds.right,
          scrollWidth: tab.scrollWidth,
          top: bounds.top,
        };
      });
      return {
        clientWidth: element.clientWidth,
        overflowX: getComputedStyle(element).overflowX,
        scrollWidth: element.scrollWidth,
        tabs,
        railLeft: rail.left,
        railRight: rail.right,
        wardrobeLeft: wardrobe.left,
        wardrobeRight: wardrobe.right,
      };
    });
    expect(categoryGeometry.tabs).toHaveLength(6);
    expect(categoryGeometry.overflowX).toBe("auto");
    expect(categoryGeometry.railLeft).toBeGreaterThanOrEqual(
      categoryGeometry.wardrobeLeft,
    );
    expect(categoryGeometry.railRight).toBeLessThanOrEqual(
      categoryGeometry.wardrobeRight,
    );
    expect(categoryGeometry.tabs[0]!.left).toBeCloseTo(
      categoryGeometry.railLeft,
      0,
    );
    expect(
      categoryGeometry.tabs.every(({ fontSize }) => fontSize >= 12),
      `${viewport.width}px category labels must use the enlarged type treatment`,
    ).toBe(true);
    expect(
      categoryGeometry.tabs.every(
        ({ labelLeft, labelRight }) =>
          labelLeft >= categoryGeometry.railLeft - 1 &&
          labelRight <= categoryGeometry.railRight + 1,
      ) || categoryGeometry.overflowX === "auto",
      `${viewport.width}px category labels must remain readable or horizontally scrollable`,
    ).toBe(true);
    const categoryTops = categoryGeometry.tabs.map(({ top }) => top);
    expect(
      Math.max(...categoryTops) - Math.min(...categoryTops),
      `${viewport.width}px outfit categories must stay in one row`,
    ).toBeLessThanOrEqual(1);
    const categoryGaps = categoryGeometry.tabs
      .slice(1)
      .map(({ left }, index) => left - categoryGeometry.tabs[index]!.right);
    expect(
      Math.max(...categoryGaps) - Math.min(...categoryGaps),
      `${viewport.width}px category spacing must remain consistent`,
    ).toBeLessThanOrEqual(1);
    if (categoryGeometry.scrollWidth <= categoryGeometry.clientWidth + 1) {
      expect(categoryGeometry.tabs.at(-1)!.right).toBeLessThanOrEqual(
        categoryGeometry.railRight + 1,
      );
    }

    await expect(page.getByRole("tab", { name: "BACKGROUND" })).toHaveCount(0);

    const backgroundRail = page
      .locator("#main-content .background-carousel__rail")
      .filter({ visible: true });
    await expect(backgroundRail).toHaveCSS("overflow-x", "auto");
    await expect(
      backgroundRail.getByRole("radio"),
      "the permanent carousel must contain five backgrounds",
    ).toHaveCount(5);
    const backgroundGeometry = await backgroundRail
      .getByRole("radio")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            bottom: bounds.bottom,
            height: bounds.height,
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
            width: bounds.width,
          };
        }),
      );
    const backgroundWidths = backgroundGeometry.map(({ width }) => width);
    const backgroundHeights = backgroundGeometry.map(({ height }) => height);
    const backgroundTops = backgroundGeometry.map(({ top }) => top);
    expect(backgroundHeights.every((height) => height >= 44)).toBe(true);
    expect(
      Math.max(...backgroundWidths) - Math.min(...backgroundWidths),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.max(...backgroundHeights) - Math.min(...backgroundHeights),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.max(...backgroundTops) - Math.min(...backgroundTops),
    ).toBeLessThanOrEqual(1);
    expect(
      backgroundGeometry
        .slice(1)
        .every(
          ({ left }, index) => left - backgroundGeometry[index]!.right >= 11,
        ),
      `${viewport.width}px background cards must remain separated in one row`,
    ).toBe(true);

    const outfitGeometry = await page
      .locator("#main-content .item-rail [role='radio']")
      .filter({ visible: true })
      .first()
      .evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const panelBounds = element
          .closest(".item-panel")!
          .getBoundingClientRect();
        return {
          height: bounds.height,
          panelBottomGap: panelBounds.bottom - bounds.bottom,
          panelHeight: panelBounds.height,
          width: bounds.width,
        };
      });
    expect(
      Math.min(...backgroundWidths),
      `${viewport.width}px background choices must remain visually dominant`,
    ).toBeGreaterThanOrEqual(viewport.width < 768 ? 127 : 139);
    expect(
      Math.min(...backgroundWidths),
      `${viewport.width}px backgrounds must be wider than compact outfit cards`,
    ).toBeGreaterThan(outfitGeometry.width * 1.25);
    expect(
      outfitGeometry.width,
      `${viewport.width}px outfit cards must keep the compact treatment`,
    ).toBeLessThanOrEqual(112);
    expect(
      outfitGeometry.height,
      `${viewport.width}px outfit cards must remain comfortably tappable`,
    ).toBeGreaterThanOrEqual(112);
    if (viewport.width >= 1200) {
      expect(
        outfitGeometry.height / outfitGeometry.panelHeight,
        `${viewport.width}px outfit cards must fill their available wardrobe row`,
      ).toBeGreaterThan(0.9);
      expect(
        outfitGeometry.panelBottomGap,
        `${viewport.width}px outfit cards must leave minimal lower dead space`,
      ).toBeLessThanOrEqual(6);
    }

    if (viewport.width >= 768 && viewport.width < 1200) {
      const stageBounds = await page
        .getByRole("region", { name: "Character stage" })
        .filter({ visible: true })
        .evaluate((element) => element.getBoundingClientRect().toJSON());
      expect(stageBounds.top).toBeLessThan(viewport.height * 0.45);
      expect(stageBounds.bottom).toBeLessThanOrEqual(viewport.height + 1);
      expect(stageBounds.height).toBeGreaterThan(viewport.height * 0.55);
      expect(stageBounds.height).toBeLessThan(viewport.height * 0.7);
    }

    const coreGeometry = await page.evaluate(() => {
      const bounds = (selector: string) =>
        document.querySelector(selector)!.getBoundingClientRect().toJSON();
      return {
        action: bounds(".studio-action-dock"),
        stage: bounds(".studio-stage-panel"),
        wardrobe: bounds(".studio-wardrobe"),
      };
    });

    if (viewport.width >= 900) {
      expect(
        coreGeometry.stage.right,
        `${viewport.width}px stage must end before the wardrobe begins`,
      ).toBeLessThanOrEqual(coreGeometry.wardrobe.left + 1);
      expect(
        coreGeometry.action.top,
        `${viewport.width}px actions must sit below the wardrobe`,
      ).toBeGreaterThanOrEqual(coreGeometry.wardrobe.bottom - 1);
      expect(
        coreGeometry.action.top - coreGeometry.wardrobe.bottom,
        `${viewport.width}px wardrobe and actions need deliberate separation`,
      ).toBeGreaterThanOrEqual(24);
      expect(
        coreGeometry.action.top - coreGeometry.wardrobe.bottom,
        `${viewport.width}px wardrobe and actions must remain visually connected`,
      ).toBeLessThanOrEqual(32);
      expect(
        Math.abs(coreGeometry.action.bottom - coreGeometry.stage.bottom),
        `${viewport.width}px controls must align with the preview bottom edge`,
      ).toBeLessThanOrEqual(1);
      expect(
        coreGeometry.wardrobe.height / coreGeometry.stage.height,
        `${viewport.width}px wardrobe must fill the control composition`,
      ).toBeGreaterThan(0.7);
    } else {
      expect(coreGeometry.stage.top).toBeLessThan(coreGeometry.wardrobe.top);
      expect(coreGeometry.wardrobe.top).toBeLessThan(coreGeometry.action.top);
      expect(
        coreGeometry.action.top - coreGeometry.wardrobe.bottom,
        `${viewport.width}px stacked actions need responsive separation`,
      ).toBeGreaterThanOrEqual(viewport.width >= 768 ? 18 : 14);
      expect(
        coreGeometry.action.top - coreGeometry.wardrobe.bottom,
        `${viewport.width}px stacked actions must remain visually connected`,
      ).toBeLessThanOrEqual(viewport.width >= 768 ? 22 : 18);
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

  await page.addInitScript(() => {
    const trackedWindow = window as typeof window & { homeLayoutShift: number };
    trackedWindow.homeLayoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!shift.hadRecentInput) trackedWindow.homeLayoutShift += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.setViewportSize(homepageViewports[0]);
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeEnabled();

  for (const viewport of homepageViewports) {
    await page.setViewportSize(viewport);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${viewport.width}px homepage must not overflow horizontally`,
    ).toBe(true);

    const heroWave = page
      .locator(".home-hero > .home-hero__wave-layer")
      .filter({ visible: true });
    const waveGeometry = await heroWave.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const pinkPath = element.querySelector<SVGPathElement>(
        ".home-hero__wave-pink",
      )!;
      const pathLength = pinkPath.getTotalLength();
      return {
        left: bounds.left,
        right: bounds.right,
        width: bounds.width,
        pathLength,
        drawStartX: pinkPath.getPointAtLength(0).x,
        drawEndX: pinkPath.getPointAtLength(pathLength).x,
        fill: getComputedStyle(pinkPath).fill,
        strokeLinecap: getComputedStyle(pinkPath).strokeLinecap,
        strokeWidth: getComputedStyle(pinkPath).strokeWidth,
        vectorEffect: getComputedStyle(pinkPath).vectorEffect,
        waveOpacity: getComputedStyle(element).opacity,
        waveTransform: getComputedStyle(element).transform,
        svgOverflow: getComputedStyle(
          element.querySelector(".home-hero__wave")!,
        ).overflow,
        stageOverflow: getComputedStyle(
          document.querySelector(".home-hero__stage")!,
        ).overflow,
      };
    });
    expect(waveGeometry.width / viewport.width).toBeGreaterThanOrEqual(1.1);
    expect(waveGeometry.width / viewport.width).toBeLessThanOrEqual(1.2);
    expect(waveGeometry.left).toBeLessThan(0);
    expect(waveGeometry.right).toBeGreaterThan(viewport.width);
    expect(waveGeometry.pathLength).toBeGreaterThan(1_000);
    expect(waveGeometry.drawStartX).toBeLessThan(0);
    expect(waveGeometry.drawEndX).toBeGreaterThan(1_200);
    expect(waveGeometry.fill).toBe("none");
    expect(waveGeometry.strokeLinecap).toBe("round");
    expect(Number.parseFloat(waveGeometry.strokeWidth)).toBeGreaterThanOrEqual(
      viewport.width < 768 ? 160 : 112,
    );
    expect(waveGeometry.vectorEffect).toBe("none");
    expect(waveGeometry.waveOpacity).toBe("1");
    expect(waveGeometry.waveTransform).toBe("none");
    expect(waveGeometry.svgOverflow).toBe("visible");
    expect(waveGeometry.stageOverflow).toBe("visible");
    await expect(
      page.locator(".home-hero__wave-pink").filter({ visible: true }),
    ).toHaveAttribute("stroke", "url(#home-hero-pink-wave-gradient)");
    await expect(
      page.locator(".home-hero__wave-cyan").filter({ visible: true }),
    ).toHaveAttribute("mask", "url(#home-hero-cyan-path-reveal)");
    await expect(page.locator(".home-hero__wave-track")).toHaveCount(0);

    const actionWidths = await page
      .locator(".home-action")
      .filter({ visible: true })
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

    const finalCta = page
      .locator(".home-final-cta")
      .filter({ visible: true })
      .last();
    const finalCtaGeometry = await finalCta.evaluate((section) => {
      const bounds = (selector: string) => {
        const element = section.querySelector<HTMLElement>(selector)!;
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      };
      const visual = section.querySelector<HTMLElement>(
        ".home-final-cta__visual",
      )!;
      const supportingCopy = section.querySelector<HTMLElement>(
        ".home-final-cta__action > span",
      )!;
      const title = section.querySelector<HTMLElement>(
        ".home-final-cta__title",
      )!;
      const titleLineHeight = Number.parseFloat(
        getComputedStyle(title).lineHeight,
      );
      const characterImages = section.querySelectorAll<HTMLElement>(
        ".home-final-cta__characters img",
      );

      return {
        container: bounds(".home-container"),
        copy: bounds(".home-final-cta__copy"),
        title: bounds(".home-final-cta__title"),
        visual: bounds(".home-final-cta__visual"),
        characters: bounds(".home-final-cta__characters"),
        visualOverflow: getComputedStyle(visual).overflow,
        visualClipPath: getComputedStyle(visual).clipPath,
        titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
        emirTranslateX: new DOMMatrix(
          getComputedStyle(characterImages[0]!).transform,
        ).e,
        friskaTranslateX: new DOMMatrix(
          getComputedStyle(characterImages[1]!).transform,
        ).e,
        titleVisualLineCount: Array.from(
          title.querySelectorAll<HTMLElement>(".home-mask-line"),
        ).reduce(
          (lineCount, line) =>
            lineCount +
            Math.round(line.getBoundingClientRect().height / titleLineHeight),
          0,
        ),
        supportingCopyFits:
          supportingCopy.scrollWidth <= supportingCopy.clientWidth + 1,
      };
    });

    if (viewport.width >= 768) {
      expect(
        finalCtaGeometry.copy.right,
        `${viewport.width}px final CTA columns must stay separated`,
      ).toBeLessThanOrEqual(finalCtaGeometry.visual.left + 1);
      expect(
        finalCtaGeometry.title.right,
        `${viewport.width}px final CTA headline must not enter the artwork`,
      ).toBeLessThanOrEqual(finalCtaGeometry.visual.left + 1);
      if (viewport.width >= 1200) {
        expect(
          Math.abs(finalCtaGeometry.visual.right - viewport.width),
          `${viewport.width}px final artwork must reach the viewport edge`,
        ).toBeLessThanOrEqual(1);
        expect(finalCtaGeometry.visualOverflow).toBe("visible");
        expect(
          finalCtaGeometry.characters.width / viewport.width,
        ).toBeGreaterThan(1.05);
        expect(
          finalCtaGeometry.friskaTranslateX /
            Math.abs(finalCtaGeometry.emirTranslateX),
        ).toBeCloseTo(25 / 18, 2);
      } else {
        expect(
          Math.abs(
            finalCtaGeometry.visual.right - finalCtaGeometry.container.right,
          ),
          `${viewport.width}px final artwork must align to the container edge`,
        ).toBeLessThanOrEqual(1);
        expect(finalCtaGeometry.visualOverflow).toBe("hidden");
      }
      expect(finalCtaGeometry.visual.width / viewport.width).toBeGreaterThan(
        0.27,
      );
    } else {
      expect(
        finalCtaGeometry.copy.bottom,
        `${viewport.width}px final CTA artwork must follow the complete copy block`,
      ).toBeLessThanOrEqual(finalCtaGeometry.visual.top + 1);
      expect(
        Math.abs(finalCtaGeometry.visual.right - viewport.width),
        `${viewport.width}px final artwork must align to the viewport edge`,
      ).toBeLessThanOrEqual(1);
      expect(finalCtaGeometry.visual.width / viewport.width).toBeGreaterThan(
        0.9,
      );
      expect(finalCtaGeometry.titleVisualLineCount).toBe(4);
      expect(
        finalCtaGeometry.characters.width / finalCtaGeometry.visual.width,
      ).toBeGreaterThan(2.1);
      expect(finalCtaGeometry.visualOverflow).toBe("visible");
      expect(finalCtaGeometry.visualClipPath).not.toBe("none");
    }

    expect(finalCtaGeometry.visual.height).toBeGreaterThanOrEqual(360);
    expect(
      finalCtaGeometry.characters.width / finalCtaGeometry.visual.width,
    ).toBeGreaterThan(1.7);
    expect(
      finalCtaGeometry.characters.height / finalCtaGeometry.visual.height,
    ).toBeGreaterThan(2);
    expect(finalCtaGeometry.titleFontSize).toBeGreaterThanOrEqual(52);
    expect(finalCtaGeometry.supportingCopyFits).toBe(true);

    if (viewport.width < 768) {
      await expect(page.locator(".home-cursor").first()).toBeHidden();
      await expect(page.locator(".home-teaser__items").first()).toHaveCSS(
        "overflow-x",
        "auto",
      );
    }

    const homeFooter = page
      .locator(".site-footer--home")
      .filter({ visible: true });
    await expect(homeFooter).toBeVisible();
    await expect(homeFooter.locator("nav").getByRole("link")).toHaveCount(4);
  }

  const finalCharacters = page
    .locator(".home-final-cta")
    .filter({ visible: true })
    .last()
    .locator(".home-final-cta__characters img");
  await expect(finalCharacters).toHaveCount(2);
  await expect(finalCharacters.first()).toHaveAttribute("src", /emir-look-01/);
  await expect(finalCharacters.last()).toHaveAttribute("src", /friska-look-01/);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(
    page.locator(".home-hero__wave-pink").filter({ visible: true }),
  ).toHaveCSS("stroke-dashoffset", "0px");

  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { homeLayoutShift: number }).homeLayoutShift,
    ),
    "homepage loading and hero motion must not cause layout shift",
  ).toBe(0);
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
