import { DuplicateSlugError, BusinessNotFoundError } from "@database/errors";
import { isAdminAuthorizedFromHeader } from "@backend/lib/auth/require-admin";
import { businessService } from "@backend/lib/services/index";
import { jsonError, jsonOk } from "@backend/lib/http";
import { z } from "zod";
import { googleReviewUrlSchema, slugSchema, businessInputSchema } from "@backend/lib/validators";

const updateBusinessSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    slug: slugSchema.optional(),
    ownerEmail: z.string().trim().email().optional(),
    ownerWhatsApp: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{7,14}$/, "WhatsApp number must be E.164-ish digits")
      .optional()
      .or(z.literal("")),
    ownerSmsPhone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{7,14}$/, "SMS phone must be E.164-ish digits")
      .optional()
      .or(z.literal("")),
    googleReviewUrl: googleReviewUrlSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "No update fields provided");

function unauthorized() {
  return jsonError("Unauthorized", 401);
}

export async function listAdminBusinesses(request: Request) {
  if (!isAdminAuthorizedFromHeader(request)) {
    return unauthorized();
  }

  const businesses = await businessService.listBusinesses();
  return jsonOk({ businesses });
}

export async function createAdminBusiness(request: Request) {
  if (!isAdminAuthorizedFromHeader(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = businessInputSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid business payload", 400);
  }

  try {
    const business = await businessService.createBusiness(parsed.data);
    return jsonOk({ business }, 201);
  } catch (error) {
    if (error instanceof DuplicateSlugError) {
      return jsonError(error.message, 409);
    }
    throw error;
  }
}


export async function updateAdminBusiness(request: Request, id: string) {
  if (!isAdminAuthorizedFromHeader(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = updateBusinessSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid update payload", 400);
  }

  try {
    const business = await businessService.updateBusiness(id, parsed.data);
    return jsonOk({ business });
  } catch (error) {
    if (error instanceof BusinessNotFoundError) {
      return jsonError(error.message, 404);
    }
    throw error;
  }
}

export async function deactivateAdminBusiness(request: Request, id: string) {
  if (!isAdminAuthorizedFromHeader(request)) {
    return unauthorized();
  }

  try {
    const business = await businessService.deactivateBusiness(id);
    return jsonOk({ business });
  } catch (error) {
    if (error instanceof BusinessNotFoundError) {
      return jsonError(error.message, 404);
    }
    throw error;
  }
}

export async function deleteAdminBusiness(request: Request, id: string) {
  if (!isAdminAuthorizedFromHeader(request)) {
    return unauthorized();
  }

  try {
    const business = await businessService.deleteBusiness(id);
    return jsonOk({ business });
  } catch (error) {
    if (error instanceof BusinessNotFoundError) {
      return jsonError(error.message, 404);
    }
    throw error;
  }
}
