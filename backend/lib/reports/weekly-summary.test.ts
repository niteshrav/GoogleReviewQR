import { describe, expect, it } from "vitest";
import {
  formatWeeklyReportMessage,
  getLastSevenDaysWindow,
  summarizeFeedbackWeek,
} from "@backend/lib/reports/weekly-summary";

describe("weekly summary", () => {
  it("counts only items inside the 7-day window", () => {
    const end = new Date("2026-08-14T12:00:00.000Z");
    const { start } = getLastSevenDaysWindow(end);

    const summary = summarizeFeedbackWeek(
      [
        {
          createdAt: new Date("2026-08-13T10:00:00.000Z"),
          rating: 2,
          clickedGoogle: false,
          alertSentAt: new Date("2026-08-13T10:01:00.000Z"),
        },
        {
          createdAt: new Date("2026-08-12T10:00:00.000Z"),
          rating: null,
          clickedGoogle: true,
          alertSentAt: null,
        },
        {
          createdAt: new Date("2026-07-01T10:00:00.000Z"),
          rating: 1,
          clickedGoogle: false,
          alertSentAt: null,
        },
      ],
      { start, end },
    );

    expect(summary.totalEntries).toBe(2);
    expect(summary.googleClicks).toBe(1);
    expect(summary.privateFeedback).toBe(1);
    expect(summary.lowRatings).toBe(1);
    expect(summary.alertsSent).toBe(1);
    expect(summary.averageRating).toBe(2);
  });

  it("formats an owner-facing weekly message", () => {
    const message = formatWeeklyReportMessage("Cafe Edelweiss", {
      start: new Date("2026-08-07T00:00:00.000Z"),
      end: new Date("2026-08-14T00:00:00.000Z"),
      totalEntries: 12,
      googleClicks: 8,
      privateFeedback: 4,
      lowRatings: 1,
      alertsSent: 1,
      averageRating: 4.2,
    });

    expect(message).toContain("TrustTap weekly report — Cafe Edelweiss");
    expect(message).toContain("Google review taps: 8");
    expect(message).toContain("Private feedback: 4");
    expect(message).toContain("Upgrade to Premium");
  });

  it("mentions same-day support on Premium reports", () => {
    const message = formatWeeklyReportMessage(
      "Cafe Edelweiss",
      {
        start: new Date("2026-08-07T00:00:00.000Z"),
        end: new Date("2026-08-14T00:00:00.000Z"),
        totalEntries: 1,
        googleClicks: 1,
        privateFeedback: 0,
        lowRatings: 0,
        alertsSent: 0,
        averageRating: null,
      },
      "premium",
    );

    expect(message).toContain("Premium support");
    expect(message).not.toContain("Upgrade to Premium");
  });
});
