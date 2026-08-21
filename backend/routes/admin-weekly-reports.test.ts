import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@backend/lib/auth/require-admin", () => ({
  isAdminAuthorizedFromHeader: vi.fn(),
}));

vi.mock("@backend/lib/reports/send-weekly-reports", () => ({
  sendWeeklyReports: vi.fn(),
}));

import { isAdminAuthorizedFromHeader } from "@backend/lib/auth/require-admin";
import { sendWeeklyReports } from "@backend/lib/reports/send-weekly-reports";
import { sendAdminWeeklyReport } from "@backend/routes/admin-weekly-reports";

describe("sendAdminWeeklyReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthorized", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockResolvedValue(false);

    const response = await sendAdminWeeklyReport(
      new Request("http://localhost/api/admin/weekly-reports", { method: "POST" }),
    );

    expect(response.status).toBe(401);
  });

  it("forces a report for one business", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockResolvedValue(true);
    vi.mocked(sendWeeklyReports).mockResolvedValue({
      window: {
        start: new Date("2026-08-07T00:00:00.000Z"),
        end: new Date("2026-08-14T00:00:00.000Z"),
      },
      sent: 1,
      results: [{ businessId: "biz-1", slug: "cafe", sent: true }],
    });

    const response = await sendAdminWeeklyReport(
      new Request("http://localhost/api/admin/weekly-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: "biz-1", force: true }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sent).toBe(1);
    expect(sendWeeklyReports).toHaveBeenCalledWith({ force: true, businessId: "biz-1" });
  });
});
