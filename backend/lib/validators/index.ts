import { z } from "zod";

const GOOGLE_REVIEW_URL_PATTERN =
  /^https:\/\/(search\.google\.com\/local\/writereview|g\.page\/r\/[^/]+\/review|maps\.google\.com\/)/;

const phoneFieldSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Phone number must be E.164-ish digits")
  .optional()
  .or(z.literal(""));

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens");

export const googleReviewUrlSchema = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://"), "Google review URL must use HTTPS")
  .refine(
    (url) => GOOGLE_REVIEW_URL_PATTERN.test(url),
    "Must be a valid Google review URL",
  );

export const billingPlanSchema = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Plan key must be lowercase alphanumeric with hyphens");
export const billingStatusSchema = z.enum(["trial", "invoiced", "paid", "overdue"]);
export const paymentReferenceSchema = z.string().trim().min(2).max(120);

export const subscriptionPlanInputSchema = z.object({
  key: billingPlanSchema,
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  priceInr: z.number().int().min(0).max(1_000_000),
  setupFeeInr: z.number().int().min(0).max(1_000_000).optional(),
  features: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
  highlighted: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const subscriptionPlanUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    tagline: z.string().trim().max(160).nullable().optional().or(z.literal("")),
    priceInr: z.number().int().min(0).max(1_000_000).optional(),
    setupFeeInr: z.number().int().min(0).max(1_000_000).optional(),
    features: z.array(z.string().trim().min(1).max(160)).min(1).max(12).optional(),
    highlighted: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(999).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "No update fields provided");

export const businessInputSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    slug: slugSchema,
    ownerEmail: z.string().trim().email(),
    ownerWhatsApp: phoneFieldSchema,
    ownerSmsPhone: phoneFieldSchema,
    googleReviewUrl: googleReviewUrlSchema,
    isActive: z.boolean().optional(),
    plan: billingPlanSchema.optional(),
    billingStatus: billingStatusSchema.optional(),
    setupFeePaid: z.boolean().optional(),
    lastInvoiceSentAt: z.coerce.date().nullable().optional(),
    paymentReceivedAt: z.coerce.date().nullable().optional(),
    paymentAmountInr: z.number().int().min(0).nullable().optional(),
    paymentReference: paymentReferenceSchema.nullable().optional().or(z.literal("")),
  })
  .refine((data) => Boolean(data.ownerWhatsApp?.trim() || data.ownerSmsPhone?.trim()), {
    message: "Provide owner WhatsApp or SMS phone for automated alerts",
    path: ["ownerWhatsApp"],
  });

export const feedbackInputSchema = z.object({
  businessSlug: slugSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
  customerName: z.string().trim().max(80).optional().or(z.literal("")),
  customerPhone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Phone / WhatsApp must be a valid number")
    .optional()
    .or(z.literal("")),
  honeypot: z.string().optional(),
});

export const googleClickInputSchema = z.object({
  businessSlug: slugSchema,
});

export type BusinessInput = z.infer<typeof businessInputSchema>;
export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
