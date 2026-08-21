import { describe, expect, it } from "vitest";
import { feedbackToCsv } from "@backend/lib/csv/feedback-csv";

describe("feedbackToCsv", () => {
  it("escapes commas and quotes in comments", () => {
    const csv = feedbackToCsv([
      {
        createdAt: "2026-08-10T10:00:00.000Z",
        rating: 2,
        comment: 'Slow, "cold" food',
        customerName: "Priya",
        customerPhone: "+919876543210",
        clickedGoogle: false,
        alertSentAt: "2026-08-10T10:01:00.000Z",
        alertChannel: "whatsapp",
      },
    ]);

    expect(csv).toContain("createdAt,rating,comment");
    expect(csv).toContain('"Slow, ""cold"" food"');
    expect(csv).toContain("Priya");
    expect(csv).toContain("whatsapp");
  });
});
