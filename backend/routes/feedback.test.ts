import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@backend/lib/services/index", () => ({
  feedbackService: {
    submitPrivateFeedback: vi.fn(),
  },
}));

vi.mock("@backend/lib/env", () => ({
  getEnv: vi.fn(() => ({
    RATE_LIMIT_FEEDBACK_MAX: 10,
    RATE_LIMIT_FEEDBACK_WINDOW_SECONDS: 3600,
    COMMENT_MAX_CHARS: 1000,
  })),
}));

import { feedbackService } from "@backend/lib/services/index";
import { submitFeedback } from "@backend/routes/feedback";

describe("submitFeedback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 for valid feedback", async () => {
    vi.mocked(feedbackService.submitPrivateFeedback).mockResolvedValue({
      feedbackId: "fb-1",
      businessId: "biz-1",
    });

    const response = await submitFeedback(
      new Request("http://localhost/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "127.0.0.1",
        },
        body: JSON.stringify({
          businessSlug: "cafe-edelweiss",
          rating: 2,
          comment: "Slow service",
        }),
      }),
    );

    expect(response.status).toBe(201);
  });

  it("returns 404 when business is missing", async () => {
    vi.mocked(feedbackService.submitPrivateFeedback).mockResolvedValue(null);

    const response = await submitFeedback(
      new Request("http://localhost/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: "missing",
          rating: 2,
        }),
      }),
    );

    expect(response.status).toBe(404);
  });

  it("returns 400 when honeypot is filled", async () => {
    const response = await submitFeedback(
      new Request("http://localhost/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: "cafe-edelweiss",
          rating: 2,
          honeypot: "bot",
        }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
