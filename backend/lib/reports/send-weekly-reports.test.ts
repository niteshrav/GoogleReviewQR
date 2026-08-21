import { beforeEach, describe, expect, it, vi } from "vitest";

const sendPhoneAlert = vi.fn();
const sendWeeklyReportEmail = vi.fn();
const listBusinesses = vi.fn();
const getBusinessById = vi.fn();
const updateBusiness = vi.fn();
const listFeedbackForBusiness = vi.fn();

vi.mock("@backend/lib/phone/send-phone-alert", () => ({
  sendPhoneAlert: (...args: unknown[]) => sendPhoneAlert(...args),
}));

vi.mock("@backend/lib/email/smtp", () => ({
  sendWeeklyReportEmail: (...args: unknown[]) => sendWeeklyReportEmail(...args),
}));

vi.mock("@backend/lib/services/index", () => ({
  businessService: {
    listBusinesses: () => listBusinesses(),
    getBusinessById: (id: string) => getBusinessById(id),
    updateBusiness: (...args: unknown[]) => updateBusiness(...args),
  },
  feedbackService: {
    listFeedbackForBusiness: (id: string) => listFeedbackForBusiness(id),
  },
}));

import { sendWeeklyReports } from "@backend/lib/reports/send-weekly-reports";

const cafe = {
  id: "biz-1",
  slug: "cafe-edelweiss",
  name: "Cafe Edelweiss",
  ownerEmail: "owner@example.com",
  ownerWhatsApp: "+919876543210",
  ownerSmsPhone: null,
  isActive: true,
  plan: "premium",
  lastWeeklyReportAt: new Date("2026-08-13T00:00:00.000Z"),
};

describe("sendWeeklyReports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendPhoneAlert.mockResolvedValue("whatsapp");
    sendWeeklyReportEmail.mockResolvedValue(undefined);
    updateBusiness.mockResolvedValue(cafe);
    listFeedbackForBusiness.mockResolvedValue([]);
  });

  it("skips a business that already received a report this week", async () => {
    listBusinesses.mockResolvedValue([cafe]);

    const result = await sendWeeklyReports({ now: new Date("2026-08-14T12:00:00.000Z") });

    expect(result.sent).toBe(0);
    expect(sendPhoneAlert).not.toHaveBeenCalled();
  });

  it("sends immediately when force is true", async () => {
    getBusinessById.mockResolvedValue(cafe);

    const result = await sendWeeklyReports({
      now: new Date("2026-08-14T12:00:00.000Z"),
      force: true,
      businessId: "biz-1",
    });

    expect(result.sent).toBe(1);
    expect(sendPhoneAlert).toHaveBeenCalledOnce();
    expect(sendWeeklyReportEmail).toHaveBeenCalledOnce();
    expect(updateBusiness).toHaveBeenCalledWith("biz-1", {
      lastWeeklyReportAt: new Date("2026-08-14T12:00:00.000Z"),
    });
  });
});
