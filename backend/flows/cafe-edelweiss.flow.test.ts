import { beforeEach, describe, expect, it, vi } from "vitest";
import { CAFE_EDELWEISS } from "@backend/lib/fixtures/pilot-businesses";
import { runCafeEdelweissFlow } from "@backend/flows/cafe-edelweiss.flow";

/**
 * TDD — Cafe Edelweiss complete seeded flow
 */
describe("Cafe Edelweiss complete seeded flow", () => {
  const sendOwnerAlertFn = vi.fn().mockResolvedValue({
    phoneDelivered: true,
    emailDelivered: true,
  });

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
      sendOwnerAlertFn,
    });

    expect(result.business).toMatchObject({
      slug: "cafe-edelweiss",
      name: "Cafe Edelweiss",
      ownerEmail: "owner@example.com",
      ownerWhatsApp: "+919876543210",
      isActive: true,
    });
    expect(result.googleReviewUrl).toContain("writereview?placeid=");

    expect(result.googleClick.feedbackId).toBeTruthy();
    expect(result.googleClick.clickedGoogle).toBe(true);
    expect(result.googleClick.rating).toBeNull();

    expect(result.privateFeedback.feedbackId).toBeTruthy();
    expect(result.privateFeedback.rating).toBe(2);
    expect(result.privateFeedback.comment).toBe("Coffee was good but service was slow");
    expect(result.privateFeedback.alertSentAt).toBeInstanceOf(Date);
    expect(sendOwnerAlertFn).toHaveBeenCalledTimes(1);
    expect(sendOwnerAlertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerEmail: "owner@example.com",
        ownerWhatsApp: "+919876543210",
        businessName: "Cafe Edelweiss",
        rating: 2,
        comment: "Coffee was good but service was slow",
      }),
    );

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

    expect(result.googleCtaAlwaysVisible).toBe(true);
  });

  it("does not alert when the same seeded customer leaves 5 stars", async () => {
    const result = await runCafeEdelweissFlow({
      seed: CAFE_EDELWEISS,
      customer: {
        rating: 5,
        comment: "Loved it",
      },
      sendOwnerAlertFn,
      skipGoogleClick: true,
    });

    expect(result.privateFeedback.rating).toBe(5);
    expect(result.privateFeedback.alertSentAt).toBeNull();
    expect(sendOwnerAlertFn).not.toHaveBeenCalled();
    expect(result.googleCtaAlwaysVisible).toBe(true);
  });
});
