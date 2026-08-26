import { createHmac } from "crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  isRazorpayConfigured,
  verifyRazorpayPaymentSignature,
} from "@backend/lib/payments/razorpay";

describe("razorpay payment helpers", () => {
  const originalId = process.env.RAZORPAY_KEY_ID;
  const originalSecret = process.env.RAZORPAY_KEY_SECRET;

  afterEach(() => {
    if (originalId === undefined) {
      delete process.env.RAZORPAY_KEY_ID;
    } else {
      process.env.RAZORPAY_KEY_ID = originalId;
    }
    if (originalSecret === undefined) {
      delete process.env.RAZORPAY_KEY_SECRET;
    } else {
      process.env.RAZORPAY_KEY_SECRET = originalSecret;
    }
  });

  it("reports when Razorpay keys are missing", () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    expect(isRazorpayConfigured()).toBe(false);
  });

  it("verifies a valid payment signature", () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_xxx";
    process.env.RAZORPAY_KEY_SECRET = "test_secret_key";
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";
    const signature = createHmac("sha256", "test_secret_key")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature,
      }),
    ).toBe(true);
  });

  it("rejects a tampered signature", () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_xxx";
    process.env.RAZORPAY_KEY_SECRET = "test_secret_key";

    expect(
      verifyRazorpayPaymentSignature({
        orderId: "order_ABC123",
        paymentId: "pay_XYZ789",
        signature: "not-a-real-signature",
      }),
    ).toBe(false);
  });
});
