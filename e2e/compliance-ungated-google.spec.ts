import { expect, test } from "@playwright/test";

/**
 * Compliance acceptance: Google review must never be gated by rating path.
 */
test.describe("compliance ungated Google CTA @tdd", () => {
  test("landing Google CTA is present without rating", async ({ page }) => {
    await page.goto("/r/cafe-edelweiss");
    await expect(page.getByRole("button", { name: /leave a google review/i })).toBeVisible();
  });

  test("thank-you path still offers Google after low private rating", async ({ page }) => {
    await page.goto("/r/cafe-edelweiss/feedback");
    await page.getByRole("radio", { name: "1 star" }).click();
    await page.getByRole("button", { name: /send privately/i }).click();

    await expect(page.getByRole("heading", { name: /noted.*take it from here/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /also leave a google review/i }),
    ).toBeVisible();
  });
});
