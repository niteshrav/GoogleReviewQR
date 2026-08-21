import { describe, expect, it } from "vitest";
import { getLastNDaysWindow, pickCaseStudyQuote } from "@backend/lib/reports/case-study";

describe("case study helpers", () => {
  it("prefers a 4–5 star quote for the portfolio page", () => {
    const quote = pickCaseStudyQuote([
      {
        createdAt: new Date(),
        rating: 2,
        comment: "Cold coffee",
        clickedGoogle: false,
        alertSentAt: null,
      },
      {
        createdAt: new Date(),
        rating: 5,
        comment: "Best cafe in town",
        clickedGoogle: true,
        alertSentAt: null,
      },
    ]);

    expect(quote).toBe("Best cafe in town");
  });

  it("returns a 30-day window", () => {
    const now = new Date("2026-08-14T12:00:00.000Z");
    const { start, end } = getLastNDaysWindow(30, now);
    expect(end).toEqual(now);
    expect(end.getTime() - start.getTime()).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
