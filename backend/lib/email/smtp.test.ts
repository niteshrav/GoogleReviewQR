import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn().mockResolvedValue({ messageId: "msg-1" });

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail })),
  },
}));

vi.mock("@backend/lib/env", () => ({
  getEnv: vi.fn(() => ({
    SMTP_HOST: "smtp.example.com",
    SMTP_PORT: 587,
    SMTP_USER: "noreply@commiters.com",
    SMTP_PASS: "secret",
    SMTP_FROM: "TrustTap <noreply@commiters.com>",
  })),
}));

import { sendLowRatingAlert } from "@backend/lib/email/smtp";

describe("sendLowRatingAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends backup email with correct subject and body", async () => {
    await sendLowRatingAlert({
      to: "owner@example.com",
      businessName: "Cafe Edelweiss",
      rating: 2,
      comment: "Slow service",
      timestamp: new Date("2026-07-20T10:00:00.000Z"),
    });

    expect(sendMail).toHaveBeenCalledOnce();
    const payload = sendMail.mock.calls[0]?.[0];
    expect(payload.to).toBe("owner@example.com");
    expect(payload.subject).toBe("Low feedback — Cafe Edelweiss — 2/5");
    expect(payload.text).toContain("email backup");
    expect(payload.text).toContain("Rating: 2/5");
    expect(payload.text).toContain("Slow service");
    expect(payload.text).not.toContain("wa.me");
  });
});
