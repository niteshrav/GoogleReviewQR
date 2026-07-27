import { beforeEach, describe, expect, it, vi } from "vitest";

const sendPhoneAlert = vi.fn();
const sendLowRatingAlert = vi.fn();

vi.mock("@backend/lib/phone/send-phone-alert", () => ({
  sendPhoneAlert: (...args: unknown[]) => sendPhoneAlert(...args),
}));

vi.mock("@backend/lib/email/smtp", () => ({
  sendLowRatingAlert: (...args: unknown[]) => sendLowRatingAlert(...args),
}));

import { sendOwnerAlert } from "@backend/lib/alerts/send-owner-alert";

describe("sendOwnerAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendPhoneAlert.mockResolvedValue(true);
    sendLowRatingAlert.mockResolvedValue(undefined);
  });

  it("sends phone first and email backup", async () => {
    const timestamp = new Date("2026-07-20T10:00:00.000Z");

    const result = await sendOwnerAlert({
      ownerEmail: "owner@example.com",
      ownerWhatsApp: "+919876543210",
      ownerSmsPhone: "+919876543211",
      businessName: "Cafe Edelweiss",
      rating: 2,
      comment: "Slow",
      timestamp,
    });

    expect(sendPhoneAlert).toHaveBeenCalledOnce();
    expect(sendLowRatingAlert).toHaveBeenCalledOnce();
    expect(result).toEqual({ phoneDelivered: true, emailDelivered: true });
  });

  it("still attempts email when phone fails", async () => {
    sendPhoneAlert.mockRejectedValue(new Error("WA down"));

    const result = await sendOwnerAlert({
      ownerEmail: "owner@example.com",
      ownerWhatsApp: "+919876543210",
      ownerSmsPhone: null,
      businessName: "Cafe",
      rating: 1,
      timestamp: new Date(),
    });

    expect(sendLowRatingAlert).toHaveBeenCalledOnce();
    expect(result.emailDelivered).toBe(true);
    expect(result.phoneDelivered).toBe(false);
  });
});
