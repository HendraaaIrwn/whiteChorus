import { expect, test } from "@playwright/test";

test("enters silently and restores a saved studio draft", async ({ page }) => {
  await page.route("**/api/guest/session", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { expiresAt: "2026-08-09T00:00:00.000Z" },
      }),
    });
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "DRESS. CREATE. CHORUS." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ENTER SILENTLY" }).click();

  await expect(page).toHaveURL(/\/studio$/);
  await expect(
    page.getByRole("heading", { name: "STYLE EMIR & FRISKA" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "ONE-PIECE" }).click();
  await page.getByRole("radio", { name: "ONE PIECE 02" }).click();
  await expect(
    page.getByRole("radio", { name: "ONE PIECE 02" }),
  ).toHaveAttribute("aria-checked", "true");
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("white-chorus:dress-up-draft:v1"),
      ),
    )
    .toContain('"onePieceId":"a-one-piece-02"');

  await page.reload();
  await page.getByRole("tab", { name: "ONE-PIECE" }).click();
  await expect(
    page.getByRole("radio", { name: "ONE PIECE 02" }),
  ).toHaveAttribute("aria-checked", "true");

  await page.evaluate(() => {
    const draft = JSON.parse(
      window.localStorage.getItem("white-chorus:dress-up-draft:v1")!,
    ) as { characterA: { topId: string } };
    draft.characterA.topId = "a-hair-01";
    window.localStorage.setItem(
      "white-chorus:dress-up-draft:v1",
      JSON.stringify(draft),
    );
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("white-chorus:dress-up-draft:v1"),
      ),
    )
    .toContain('"topId":"a-top-01"');
});

test("reports an audio failure without blocking studio entry", async ({
  page,
}) => {
  await page.route("**/api/guest/session", async (route) => {
    await route.fulfill({ contentType: "application/json", body: "{}" });
  });
  await page.route("**/audio/white-chorus-theme.mp3", async (route) => {
    await route.abort();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "ENTER WITH MUSIC" }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(
    page.getByRole("button", { name: "Music unavailable" }),
  ).toBeVisible();
});
