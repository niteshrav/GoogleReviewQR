import { z } from "zod";
import { DuplicateSlugError } from "@database/index";
import { resolvePlanPricing } from "@backend/lib/billing/manual-pricing";
import { getEnv } from "@backend/lib/env";
import { jsonError, jsonOk } from "@backend/lib/http";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from "@backend/lib/payments/razorpay";
import { businessService, subscriptionPlanService } from "@backend/lib/services/index";
import {
  billingPlanSchema,
  googleReviewUrlSchema,
  slugSchema,
} from "@backend/lib/validators";

const phoneFieldSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Phone number must be E.164-ish digits")
  .optional()
  .or(z.literal(""));

const createOrderSchema = z
  .object({
    planKey: billingPlanSchema,
    name: z.string().trim().min(2).max(120),
    slug: slugSchema,
    ownerEmail: z.string().trim().email(),
    ownerWhatsApp: phoneFieldSchema,
    ownerSmsPhone: phoneFieldSchema,
    googleReviewUrl: googleReviewUrlSchema,
    password: z.string().min(8).max(72),
  })
  .refine((data) => Boolean(data.ownerWhatsApp?.trim() || data.ownerSmsPhone?.trim()), {
    message: "Provide WhatsApp or SMS phone",
    path: ["ownerWhatsApp"],
  });

export async function createSignupPaymentOrder(request: Request) {
  if (!isRazorpayConfigured()) {
    return jsonError(
      "Online payment is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      503,
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid order payload", 400);
  }

  const data = parsed.data;

  const existing = await businessService.getBusinessBySlug(data.slug);
  if (existing) {
    return jsonError("That business slug is already taken. Choose another.", 409);
  }

  const plan =
    (await subscriptionPlanService.getByKey(data.planKey)) ??
    (await resolvePlanPricing(data.planKey).then((pricing) => ({
      key: pricing.key,
      name: pricing.name,
      priceInr: pricing.monthlyInr,
      setupFeeInr: pricing.setupFeeInr,
      isPublic: true,
    })));

  if (!plan || ("isPublic" in plan && plan.isPublic === false)) {
    return jsonError("Selected plan is not available for signup", 400);
  }

  const monthlyInr = "priceInr" in plan ? plan.priceInr : 0;
  const setupFeeInr = "setupFeeInr" in plan ? plan.setupFeeInr : 2999;
  const dueNowInr = setupFeeInr + monthlyInr;

  if (dueNowInr <= 0) {
    return jsonError("This plan has no payable amount. Use cash / offline signup.", 400);
  }

  try {
    const order = await createRazorpayOrder({
      amountInr: dueNowInr,
      receipt: `tt-${data.slug}`.slice(0, 40),
      notes: {
        planKey: data.planKey,
        slug: data.slug,
        ownerEmail: data.ownerEmail,
        product: "trusttap-signup",
      },
    });

    return jsonOk({
      orderId: order.id,
      amountInr: dueNowInr,
      amountPaise: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      planName: "name" in plan ? plan.name : data.planKey,
      prefill: {
        name: data.name,
        email: data.ownerEmail,
        contact: data.ownerWhatsApp || data.ownerSmsPhone || "",
      },
      description: `TrustTap ${"name" in plan ? plan.name : data.planKey} — setup + first month`,
      upiVpa: getEnv().UPI_VPA || "",
    });
  } catch (error) {
    if (error instanceof DuplicateSlugError) {
      return jsonError("That business slug is already taken. Choose another.", 409);
    }
    return jsonError(error instanceof Error ? error.message : "Could not start payment", 502);
  }
}
