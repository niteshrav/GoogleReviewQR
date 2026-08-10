import { expect, test } from "@playwright/test";

const adminSecret = process.env.E2E_ADMIN_SECRET ?? process.env.ADMIN_SECRET ?? "local-dev-admin-secret";

test.describe("admin access @tdd", () => {
  test("login page is reachable", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible();
    await expect(page.getByLabel(/admin secret/i)).toBeVisible();
  });

  test("valid admin secret reaches admin home", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/admin secret/i).fill(adminSecret);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByText(/businesses|feedback|trusttap/i).first()).toBeVisible();
  });

  test("invalid admin secret stays on login with error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/admin secret/i).fill("definitely-wrong-secret");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid admin secret/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
