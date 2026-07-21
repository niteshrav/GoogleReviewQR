import { describe, expect, it, vi } from "vitest";
import { downloadAdminQr } from "@backend/routes/admin-qr";

vi.mock("@backend/lib/auth/require-admin", () => ({
  isAdminAuthorizedFromHeader: vi.fn(() => true),
}));

vi.mock("@backend/lib/services/index", () => ({
  businessService: {
    getBusinessBySlug: vi.fn(async (slug: string) =>
      slug === "cafe-demo"
        ? {
            id: "biz-1",
            slug: "cafe-demo",
            name: "Cafe Demo",
          }
        : null,
    ),
  },
}));

vi.mock("@backend/lib/env", () => ({
  getEnv: vi.fn(() => ({ BASE_URL: "https://feedbackflow.commiters.in" })),
}));

vi.mock("@backend/lib/qr/generate-qr", () => ({
  buildBusinessReviewUrl: vi.fn(
    (baseUrl: string, slug: string) => `${baseUrl}/r/${slug}`,
  ),
  generateQrPngBuffer: vi.fn(async () => Buffer.from("fake-png")),
}));

describe("downloadAdminQr", () => {
  it("returns PNG attachment for known business slug", async () => {
    const response = await downloadAdminQr(new Request("http://localhost"), "cafe-demo");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Content-Disposition")).toContain("cafe-demo-qr.png");
  });

  it("returns 404 for unknown slug", async () => {
    const response = await downloadAdminQr(new Request("http://localhost"), "missing");

    expect(response.status).toBe(404);
  });
});
