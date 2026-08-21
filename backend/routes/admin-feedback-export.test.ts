import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@backend/lib/auth/require-admin", () => ({
  isAdminAuthorizedFromHeader: vi.fn(),
}));

vi.mock("@backend/lib/services/index", () => ({
  feedbackService: {
    listFeedbackForBusiness: vi.fn(),
  },
}));

import { isAdminAuthorizedFromHeader } from "@backend/lib/auth/require-admin";
import { feedbackService } from "@backend/lib/services/index";
import { exportAdminFeedbackCsv } from "@backend/routes/admin-feedback-export";

describe("exportAdminFeedbackCsv", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns CSV for authorized requests", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockResolvedValue(true);
    vi.mocked(feedbackService.listFeedbackForBusiness).mockResolvedValue([
      {
        createdAt: new Date("2026-08-10T10:00:00.000Z"),
        rating: 5,
        comment: "Great",
        customerName: null,
        customerPhone: null,
        clickedGoogle: false,
        alertSentAt: null,
        alertChannel: null,
      },
    ] as never);

    const response = await exportAdminFeedbackCsv(
      new Request("http://localhost/api/admin/feedback/export?businessId=biz-1"),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(body).toContain("Great");
  });

  it("returns 401 when unauthorized", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockResolvedValue(false);

    const response = await exportAdminFeedbackCsv(
      new Request("http://localhost/api/admin/feedback/export?businessId=biz-1"),
    );

    expect(response.status).toBe(401);
  });
});
