import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@backend/lib/services/index", () => ({
  feedbackService: {
    logGoogleClick: vi.fn(),
  },
}));

import { feedbackService } from "@backend/lib/services/index";
import { logGoogleClick } from "@backend/routes/google-click";

describe("logGoogleClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 and creates feedback with clickedGoogle=true", async () => {
    vi.mocked(feedbackService.logGoogleClick).mockResolvedValue({ feedbackId: "fb-2" });

    const response = await logGoogleClick(
      new Request("http://localhost/api/google-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessSlug: "cafe-edelweiss" }),
      }),
    );

    expect(response.status).toBe(201);
    expect(feedbackService.logGoogleClick).toHaveBeenCalledWith("cafe-edelweiss");
  });

  it("returns 404 for unknown slug", async () => {
    vi.mocked(feedbackService.logGoogleClick).mockResolvedValue(null);

    const response = await logGoogleClick(
      new Request("http://localhost/api/google-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessSlug: "missing" }),
      }),
    );

    expect(response.status).toBe(404);
  });

  it("returns 400 for invalid payload", async () => {
    const response = await logGoogleClick(
      new Request("http://localhost/api/google-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
  });
});
