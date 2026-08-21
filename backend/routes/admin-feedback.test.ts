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
import { listAdminFeedback } from "@backend/routes/admin-feedback";

describe("admin-feedback routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthorized", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockResolvedValue(false);

    const response = await listAdminFeedback(
      new Request("http://localhost/api/admin/feedback?businessId=biz-1"),
    );

    expect(response.status).toBe(401);
  });

  it("returns feedback list for authorized request", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockResolvedValue(true);
    vi.mocked(feedbackService.listFeedbackForBusiness).mockResolvedValue([
      { id: "fb-1", rating: 2 },
    ] as never);

    const response = await listAdminFeedback(
      new Request("http://localhost/api/admin/feedback?businessId=biz-1"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.feedback).toHaveLength(1);
  });

  it("returns 400 when businessId missing", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockResolvedValue(true);

    const response = await listAdminFeedback(
      new Request("http://localhost/api/admin/feedback"),
    );

    expect(response.status).toBe(400);
  });
});
