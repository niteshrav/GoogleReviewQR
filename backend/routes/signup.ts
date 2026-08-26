import { NextResponse } from "next/server";
import { z } from "zod";
import { DuplicateSlugError } from "@database/index";
import {
  ADMIN_SESSION_COOKIE,
  createOwnerSessionToken,
  hashAccessSecret,
} from "@backend/lib/auth/admin";
import { resolvePlanPricing } from "@backend/lib/billing/manual-pricing";
import { getEnv } from "@backend/lib/env";
import { jsonError, jsonOk, noStoreHeaders } from "@backend/lib/http";
import {
  fetchRazorpayPayment,
  isRazorpayConfigured,
  mapRazorpayMethod,
  verifyRazorpayPaymentSignature,
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

const signupSchema = z
  .object({
    planKey: billingPlanSchema,
    name: z.string().trim().min(2).max(120),
    slug: slugSchema,
    ownerEmail: z.string().trim().email(),
    ownerWhatsApp: phoneFieldSchema,
    ownerSmsPhone: phoneFieldSchema,
    googleReviewUrl: googleReviewUrlSchema,
    password: z.string().min(8).max(72),
    paymentMethod: z.enum(["cash", "razorpay"]),
    cashReceiptNote: z.string().trim().max(200).optional().or(z.literal("")),
    razorpayOrderId: z.string().trim().min(5).max(64).optional().or(z.literal("")),
    razorpayPaymentId: z.string().trim().min(5).max(64).optional().or(z.literal("")),
    razorpaySignature: z.string().trim().min(10).max(256).optional().or(z.literal("")),
  })
  .refine((data) => Boolean(data.ownerWhatsApp?.trim() || data.ownerSmsPhone?.trim()), {
    message: "Provide WhatsApp or SMS phone",
    path: ["ownerWhatsApp"],
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "cash" && !data.cashReceiptNote?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cashReceiptNote"],
        message: "Add a short cash payment note / receipt id",
      });
    }
    if (data.paymentMethod === "razorpay") {
      if (!data.razorpayOrderId?.trim() || !data.razorpayPaymentId?.trim() || !data.razorpaySignature?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["razorpayPaymentId"],
          message: "Complete Razorpay payment before finishing signup",
        });
      }
    }
  });

export async function completeSignup(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid signup payload", 400);
  }

  const data = parsed.data;
  const plan =
    (await subscriptionPlanService.getByKey(data.planKey)) ??
    (await resolvePlanPricing(data.planKey).then((pricing) => ({
      key: pricing.key,
      name: pricing.name,
      priceInr: pricing.monthlyInr,
      setupFeeInr: pricing.setupFeeInr,
      isPublic: true,
    })));

  if (!plan) {
    return jsonError("Selected plan was not found", 404);
  }

  if ("isPublic" in plan && plan.isPublic === false) {
    return jsonError("Selected plan is not available for signup", 400);
  }

  const monthlyInr = "priceInr" in plan ? plan.priceInr : 0;
  const setupFeeInr = "setupFeeInr" in plan ? plan.setupFeeInr : 2999;
  const dueNowInr = setupFeeInr + monthlyInr;

  let paidNow = false;
  let billingStatus: "paid" | "invoiced" = "invoiced";
  let paymentReference = "";
  let paymentMethodStored: string = data.paymentMethod;

  if (data.paymentMethod === "cash") {
    paidNow = false;
    billingStatus = "invoiced";
    paymentReference = data.cashReceiptNote!.trim();
    paymentMethodStored = "cash";
  } else {
    if (!isRazorpayConfigured()) {
      return jsonError("Online payment is not configured on the server.", 503);
    }

    const orderId = data.razorpayOrderId!.trim();
    const paymentId = data.razorpayPaymentId!.trim();
    const signature = data.razorpaySignature!.trim();

    const signatureOk = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!signatureOk) {
      return jsonError("Payment verification failed. Do not refresh — contact support with payment id.", 400);
    }

    let payment;
    try {
      payment = await fetchRazorpayPayment(paymentId);
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : "Could not verify payment with Razorpay", 502);
    }

    if (payment.order_id !== orderId) {
      return jsonError("Payment does not match this order.", 400);
    }

    if (payment.status !== "captured" && payment.status !== "authorized") {
      return jsonError(`Payment not successful (status: ${payment.status}).`, 400);
    }

    const expectedPaise = Math.round(dueNowInr * 100);
    if (payment.amount !== expectedPaise) {
      return jsonError("Paid amount does not match plan total.", 400);
    }

    paidNow = true;
    billingStatus = "paid";
    paymentMethodStored = mapRazorpayMethod(payment.method);
    paymentReference = paymentId;
  }

  const sessionToken = createOwnerSessionToken();
  const now = new Date();

  try {
    const business = await businessService.createBusiness({
      name: data.name,
      slug: data.slug,
      ownerEmail: data.ownerEmail,
      ownerWhatsApp: data.ownerWhatsApp || "",
      ownerSmsPhone: data.ownerSmsPhone || "",
      googleReviewUrl: data.googleReviewUrl,
      plan: data.planKey,
      billingStatus,
      setupFeePaid: paidNow,
    });

    await businessService.updateBusiness(business.id, {
      paymentMethod: paymentMethodStored,
      paymentReference,
      paymentAmountInr: dueNowInr,
      paymentReceivedAt: paidNow ? now : null,
      lastInvoiceSentAt: now,
      ownerAccessSecret: hashAccessSecret(data.password),
      ownerSessionToken: sessionToken,
      setupFeePaid: paidNow,
      billingStatus,
    });

    const response = NextResponse.json(
      {
        ok: true,
        next: "/admin",
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          plan: data.planKey,
          billingStatus,
          dueNowInr,
        },
        payment: {
          method: paymentMethodStored,
          amountInr: dueNowInr,
          status: paidNow ? "completed" : "recorded_pending_cash",
          reference: paymentReference,
          upiVpa: getEnv().UPI_VPA || undefined,
        },
      },
      { status: 201, headers: noStoreHeaders() },
    );

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    if (error instanceof DuplicateSlugError) {
      return jsonError("That business slug is already taken. Choose another.", 409);
    }
    throw error;
  }
}

export async function getSignupPlan(request: Request) {
  const url = new URL(request.url);
  const planKey = url.searchParams.get("plan") ?? "core";
  const parsed = billingPlanSchema.safeParse(planKey);
  if (!parsed.success) {
    return jsonError("Invalid plan", 400);
  }

  const razorpayEnabled = isRazorpayConfigured();

  const plan = await subscriptionPlanService.getByKey(parsed.data);
  if (!plan || !plan.isPublic) {
    const pricing = await resolvePlanPricing(parsed.data);
    return jsonOk({
      plan: {
        key: pricing.key,
        name: pricing.name,
        tagline: null,
        priceInr: pricing.monthlyInr,
        setupFeeInr: pricing.setupFeeInr,
        features: pricing.features,
        dueNowInr: pricing.setupFeeInr + pricing.monthlyInr,
      },
      upiVpa: getEnv().UPI_VPA || "",
      razorpayEnabled,
    });
  }

  return jsonOk({
    plan: {
      key: plan.key,
      name: plan.name,
      tagline: plan.tagline,
      priceInr: plan.priceInr,
      setupFeeInr: plan.setupFeeInr,
      features: plan.features,
      dueNowInr: plan.setupFeeInr + plan.priceInr,
    },
    upiVpa: getEnv().UPI_VPA || "",
    razorpayEnabled,
  });
}
