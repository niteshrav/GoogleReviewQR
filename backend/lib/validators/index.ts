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

export const businessInputSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    slug: slugSchema,
    ownerEmail: z.string().trim().email(),
    ownerWhatsApp: phoneFieldSchema,
    ownerSmsPhone: phoneFieldSchema,
    googleReviewUrl: googleReviewUrlSchema,
    isActive: z.boolean().optional(),
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
