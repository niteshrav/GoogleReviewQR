import { expect, type Page } from "@playwright/test";

export const adminSecret =
  process.env.E2E_ADMIN_SECRET ?? process.env.ADMIN_SECRET ?? "local-dev-admin-secret";

/** Signs in and lands on /admin (not /admin/login). */
export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel(/admin secret/i).fill(adminSecret);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole("heading", { name: /admin login/i })).toHaveCount(0);
}

export async function goToAdminBusinesses(page: Page) {
  await loginAsAdmin(page);
  await page.goto("/admin/businesses");
  await expect(page).toHaveURL(/\/admin\/businesses/);
  await expect(page.getByRole("heading", { name: /^businesses$/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /create business/i })).toBeVisible();
}
