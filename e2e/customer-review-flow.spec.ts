import { expect, test } from "@playwright/test";

/**
 * Customer QR journey — written as product acceptance specs (TDD).
 * Red: fail if Google CTA is missing or feedback path breaks.
 * Green: landing + private feedback submit work on mobile viewport.
 */
test.describe("customer review flow @tdd", () => {
  test("landing shows ungated Google CTA and private feedback link", async ({ page }) => {
    await page.goto("/r/cafe-edelweiss");

    await expect(page.getByRole("heading", { name: /how was your experience/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /leave a google review/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /send private feedback/i })).toBeVisible();
    await expect(
      page.getByText(/google reviews are always available/i),
    ).toBeVisible();
  });

  test("private feedback submit shows thank-you and keeps Google CTA", async ({ page }) => {
    await page.goto("/r/cafe-edelweiss/feedback");

    await page.getByRole("radio", { name: "2 stars" }).click();
    await page.getByLabel(/what should we know/i).fill("E2E test — service was slow");
    await page.getByLabel(/whatsapp \/ phone/i).fill("+919876543210");
    await page.getByRole("button", { name: /send privately/i }).click();

    await expect(page.getByRole("heading", { name: /noted.*take it from here/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /also leave a google review/i }),
    ).toBeVisible();
  });

  test("feedback form rejects submit without a rating", async ({ page }) => {
    await page.goto("/r/cafe-edelweiss/feedback");

    await page.getByRole("button", { name: /send privately/i }).click();
    await expect(page.getByText(/please select a rating/i)).toBeVisible();
  });
});
