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
    SMTP_USER: "noreply@commiters.in",
    SMTP_PASS: "secret",
    SMTP_FROM: "FeedbackFlow <noreply@commiters.in>",
  })),
}));

import { buildWhatsAppLink, sendLowRatingAlert } from "@backend/lib/email/smtp";

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with encoded alert text", () => {
    const link = buildWhatsAppLink(
      "+919876543210",
      "Cafe Edelweiss",
      2,
      "Food was good but service was slow",
    );

    expect(link.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    expect(decodeURIComponent(link.split("text=")[1] ?? "")).toContain("Cafe Edelweiss");
    expect(decodeURIComponent(link.split("text=")[1] ?? "")).toContain("Rating: 2/5");
  });

  it("omits comment detail gracefully when comment absent", () => {
    const link = buildWhatsAppLink("+919876543210", "Cafe Edelweiss", 1, null);
    expect(decodeURIComponent(link.split("text=")[1] ?? "")).toContain("Comment: No comment");
  });
});

describe("sendLowRatingAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends email with correct subject and body", async () => {
    await sendLowRatingAlert({
      to: "owner@example.com",
      businessName: "Cafe Edelweiss",
      rating: 2,
      comment: "Slow service",
      timestamp: new Date("2026-07-20T10:00:00.000Z"),
      whatsAppLink: null,
    });

    expect(sendMail).toHaveBeenCalledOnce();
    const payload = sendMail.mock.calls[0]?.[0];
    expect(payload.to).toBe("owner@example.com");
    expect(payload.subject).toBe("Low feedback — Cafe Edelweiss — 2/5");
    expect(payload.text).toContain("Rating: 2/5");
    expect(payload.text).toContain("Slow service");
    expect(payload.text).not.toContain("WhatsApp:");
  });

  it("includes wa.me link when ownerWhatsApp set", async () => {
    await sendLowRatingAlert({
      to: "owner@example.com",
      businessName: "Cafe Edelweiss",
      rating: 1,
      comment: null,
      timestamp: new Date("2026-07-20T10:00:00.000Z"),
      whatsAppLink: "https://wa.me/919876543210?text=hi",
    });

    const payload = sendMail.mock.calls[0]?.[0];
    expect(payload.text).toContain("WhatsApp: https://wa.me/919876543210?text=hi");
  });
});
