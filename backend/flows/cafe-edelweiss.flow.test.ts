import { beforeEach, describe, expect, it, vi } from "vitest";
import { CAFE_EDELWEISS } from "@backend/lib/fixtures/pilot-businesses";
import { runCafeEdelweissFlow } from "@backend/flows/cafe-edelweiss.flow";

/**
 * TDD — Cafe Edelweiss complete seeded flow
 *
 * Scenario (pilot seed):
 *   Customer scans QR → /r/cafe-edelweiss
 *   → taps Google review (logged)
 *   → submits private 2★ feedback with comment
 *   → owner gets email alert (+ WhatsApp deep link)
 *   → admin sees both events in feedback log
 *   → Google CTA never gated by rating
 */
describe("Cafe Edelweiss complete seeded flow", () => {
  const sendAlert = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs the full happy path for the seeded cafe-edelweiss pilot", async () => {
    const result = await runCafeEdelweissFlow({
      seed: CAFE_EDELWEISS,
      customer: {
        rating: 2,
        comment: "Coffee was good but service was slow",
      },
      sendAlert,
    });

    // 1. Landing resolves active seeded business
    expect(result.business).toMatchObject({
      slug: "cafe-edelweiss",
      name: "Cafe Edelweiss",
      ownerEmail: "owner@example.com",
      ownerWhatsApp: "+919876543210",
      isActive: true,
    });
    expect(result.googleReviewUrl).toContain("writereview?placeid=");

    // 2. Google click logged without rating/alert payload of its own
    expect(result.googleClick.feedbackId).toBeTruthy();
    expect(result.googleClick.clickedGoogle).toBe(true);
    expect(result.googleClick.rating).toBeNull();

    // 3. Private low rating triggers exactly one owner alert (Google click does not)
    expect(result.privateFeedback.feedbackId).toBeTruthy();
    expect(result.privateFeedback.rating).toBe(2);
    expect(result.privateFeedback.comment).toBe("Coffee was good but service was slow");
    expect(result.privateFeedback.alertSentAt).toBeInstanceOf(Date);
    expect(sendAlert).toHaveBeenCalledTimes(1);
    expect(sendAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        businessName: "Cafe Edelweiss",
        rating: 2,
        comment: "Coffee was good but service was slow",
        whatsAppLink: expect.stringContaining("https://wa.me/919876543210"),
      }),
    );

    // 4. Admin feedback log shows Google click + private feedback (newest first)
    expect(result.adminLog).toHaveLength(2);
    expect(result.adminLog[0]).toMatchObject({
      rating: 2,
      clickedGoogle: false,
      comment: "Coffee was good but service was slow",
    });
    expect(result.adminLog[1]).toMatchObject({
      rating: null,
      clickedGoogle: true,
    });

    // 5. Compliance: Google CTA still offered after low rating (no gating)
    expect(result.googleCtaAlwaysVisible).toBe(true);
  });

  it("does not alert when the same seeded customer leaves 5 stars", async () => {
    const result = await runCafeEdelweissFlow({
      seed: CAFE_EDELWEISS,
      customer: {
        rating: 5,
        comment: "Loved it",
      },
      sendAlert,
      skipGoogleClick: true,
    });

    expect(result.privateFeedback.rating).toBe(5);
    expect(result.privateFeedback.alertSentAt).toBeNull();
    expect(sendAlert).not.toHaveBeenCalled();
    expect(result.googleCtaAlwaysVisible).toBe(true);
  });
});
