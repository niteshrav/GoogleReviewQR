import { expect, test } from "@playwright/test";
import { goToAdminBusinesses } from "./helpers/admin";

/**
 * Admin businesses — TDD acceptance for create / edit / QR export.
 */
test.describe("admin businesses @tdd", () => {
  test.describe.configure({ mode: "serial" });

  test("create business appears in the list and review page loads", async ({ page }) => {
    const stamp = Date.now();
    const name = `E2E Cafe ${stamp}`;
    const slug = `e2e-cafe-${stamp}`;

    await goToAdminBusinesses(page);

    const createForm = page.locator("form").filter({
      has: page.getByRole("button", { name: /create business/i }),
    });

    await createForm.getByLabel(/^business name$/i).fill(name);
    await createForm.getByLabel(/^slug$/i).fill(slug);
    await createForm.getByLabel(/^owner email$/i).fill(`owner-${stamp}@example.com`);
    await createForm.getByLabel(/owner whatsapp/i).fill("+919876543299");
    await createForm
      .getByLabel(/google review url/i)
      .fill("https://search.google.com/local/writereview?placeid=E2E_PLACE");
    await createForm.getByRole("button", { name: /create business/i }).click();

    const card = page.locator("article").filter({ hasText: name });
    await expect(card.getByRole("heading", { name })).toBeVisible({ timeout: 15_000 });
    await expect(card.getByText(`/${slug}`, { exact: true })).toBeVisible();

    await page.goto(`/r/${slug}`);
    await expect(page.getByRole("heading", { name: /how was your experience/i })).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
  });

  test("edit business updates owner email on the card", async ({ page }) => {
    await goToAdminBusinesses(page);

    const cafeCard = page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: /^cafe edelweiss$/i }) })
      .first();
    await expect(cafeCard).toBeVisible();
    await cafeCard.scrollIntoViewIfNeeded();

    await cafeCard.getByRole("button", { name: /^edit$/i }).click();

    const editArticle = page.locator("article").filter({
      has: page.getByRole("heading", { name: /edit cafe edelweiss/i }),
    });
    await expect(editArticle).toBeVisible({ timeout: 10_000 });

    const updatedEmail = `edelweiss-e2e-${Date.now()}@example.com`;
    await editArticle.locator("#ownerEmail").fill(updatedEmail);

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/admin/businesses/") &&
          response.request().method() === "PUT" &&
          response.ok(),
      ),
      editArticle.getByRole("button", { name: /update business/i }).click(),
    ]);

    const updatedCard = page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: /^cafe edelweiss$/i }) })
      .first();
    await expect(updatedCard.getByText(updatedEmail)).toBeVisible({ timeout: 15_000 });
  });

  test("download QR returns a PNG for Cafe Edelweiss", async ({ page }) => {
    await goToAdminBusinesses(page);

    const cafeCard = page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: /^cafe edelweiss$/i }) })
      .first();
    await expect(cafeCard).toBeVisible();
    await expect(cafeCard.getByAltText(/qr code for cafe edelweiss/i)).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await cafeCard.getByRole("link", { name: /download qr/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/cafe-edelweiss-qr\.png/i);

    const failure = await download.failure();
    expect(failure).toBeNull();

    const stream = await download.createReadStream();
    expect(stream).toBeTruthy();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const bytes = Buffer.concat(chunks);
    expect(bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      true,
    );
  });
});
