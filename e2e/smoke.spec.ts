import { expect, test } from "@playwright/test";

test.describe("smoke @tdd", () => {
  test("health endpoint reports ok", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = (await response.json()) as { status?: string; service?: string };
    expect(body.status).toBe("ok");
    expect(body.service).toBe("Prooflyn");
  });

  test("home page loads Prooflyn brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel(/Prooflyn/i).first()).toBeVisible();
  });
});
