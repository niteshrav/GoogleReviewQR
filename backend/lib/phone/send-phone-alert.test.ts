import { beforeEach, describe, expect, it, vi } from "vitest";

const getEnv = vi.fn();
const sendLogPhoneAlert = vi.fn();
const sendTwilioSms = vi.fn();
const sendTwilioWhatsApp = vi.fn();

vi.mock("@backend/lib/env", () => ({
  getEnv: () => getEnv(),
}));

vi.mock("@backend/lib/phone/twilio", () => ({
  sendLogPhoneAlert: (...args: unknown[]) => sendLogPhoneAlert(...args),
  sendTwilioSms: (...args: unknown[]) => sendTwilioSms(...args),
  sendTwilioWhatsApp: (...args: unknown[]) => sendTwilioWhatsApp(...args),
}));

import { sendPhoneAlert } from "@backend/lib/phone/send-phone-alert";

describe("sendPhoneAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendTwilioSms.mockResolvedValue({ sid: "SM1" });
    sendTwilioWhatsApp.mockResolvedValue({ sid: "WA1" });
  });

  it("uses the SMS template when WhatsApp fails", async () => {
    getEnv.mockReturnValue({
      ALERT_PHONE_MODE: "twilio",
      TWILIO_WHATSAPP_FROM: "whatsapp:+14155238886",
      TWILIO_SMS_FROM: "+14155550100",
    });
    sendTwilioWhatsApp.mockRejectedValue(new Error("WA down"));

    const channel = await sendPhoneAlert({
      ownerWhatsApp: "+919876543210",
      ownerSmsPhone: "+919876543211",
      message: "whatsapp body",
      smsMessage: "sms body",
    });

    expect(channel).toBe("sms");
    expect(sendTwilioSms).toHaveBeenCalledWith("+919876543211", "sms body");
  });
});
