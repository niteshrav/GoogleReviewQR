import {
  ADMIN_SESSION_COOKIE,
  resolveOwnerBusinessId,
  verifyAdminSecret,
} from "@backend/lib/auth/admin";
import { businessRepository } from "@database/index";
import { getEnv } from "@backend/lib/env";

export const DINEPRO_PLAN_KEY = "dinepro";

export function sessionFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function isPlatformAdmin(session: string | undefined): boolean {
  if (!session) return false;
  const expected = process.env.ADMIN_SECRET;
  if (expected && session === expected) return true;
  return false;
}

export async function requireDineSession(request: Request): Promise<{
  session: string;
  ownerBusinessId: string | null;
  isPlatform: boolean;
}> {
  const session = sessionFromRequest(request);
  if (!(await verifyAdminSecret(session))) {
    throw new DineAuthError("Unauthorized", 401);
  }
  const isPlatform = isPlatformAdmin(session);
  const ownerBusinessId = isPlatform ? null : await resolveOwnerBusinessId(session);
  return { session: session!, ownerBusinessId, isPlatform };
}

export async function assertBusinessAccess(
  ctx: { ownerBusinessId: string | null; isPlatform: boolean },
  businessId: string,
): Promise<void> {
  if (ctx.isPlatform) return;
  if (!ctx.ownerBusinessId || ctx.ownerBusinessId !== businessId) {
    throw new DineAuthError("Forbidden", 403);
  }
}

export async function assertDineProBusiness(businessId: string) {
  const business = await businessRepository.findById(businessId);
  if (!business || !business.isActive) {
    throw new DineAuthError("Business not found", 404);
  }
  if (business.plan !== DINEPRO_PLAN_KEY) {
    throw new DineAuthError("DinePro plan required", 403);
  }
  return business;
}

export async function resolveAccessibleDineBusinessId(
  ctx: { ownerBusinessId: string | null; isPlatform: boolean },
  requestedId?: string | null,
): Promise<string> {
  if (ctx.isPlatform) {
    if (!requestedId) {
      throw new DineAuthError("businessId required", 400);
    }
    await assertDineProBusiness(requestedId);
    return requestedId;
  }
  if (!ctx.ownerBusinessId) {
    throw new DineAuthError("Forbidden", 403);
  }
  if (requestedId && requestedId !== ctx.ownerBusinessId) {
    throw new DineAuthError("Forbidden", 403);
  }
  await assertDineProBusiness(ctx.ownerBusinessId);
  return ctx.ownerBusinessId;
}

export function buildTableQrUrl(
  restaurantSlug: string,
  branchSlug: string,
  tableSlug: string,
  baseUrl = getEnv().BASE_URL,
): string {
  return `${baseUrl.replace(/\/$/, "")}/dine/${restaurantSlug}/${branchSlug}/${tableSlug}`;
}

export class DineAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
