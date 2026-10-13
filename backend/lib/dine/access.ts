import {
  ADMIN_SESSION_COOKIE,
  resolveOwnerBusinessId,
  verifyAdminSecret,
} from "@backend/lib/auth/admin";
import { businessRepository } from "@database/index";
import { getEnv } from "@backend/lib/env";
import { isSeededLoginSecret } from "@backend/lib/fixtures/seeded-login-credentials";

export const DINEPRO_PLAN_KEY = "dinepro";

/** Platform admin's chosen restaurant; ignored for owner sessions. */
export const DINEPRO_SELECTED_COOKIE = "dinepro_business";

type DineAccessContext = {
  ownerBusinessId: string | null;
  isPlatform: boolean;
  selectedBusinessId?: string | null;
};

function readCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function sessionFromRequest(request: Request): string | undefined {
  return readCookie(request, ADMIN_SESSION_COOKIE);
}

export async function listDineProRestaurants() {
  const businesses = await businessRepository.findAll();
  return businesses
    .filter((b) => b.isActive && b.plan === DINEPRO_PLAN_KEY)
    .map((b) => ({ id: b.id, name: b.name, slug: b.slug }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Seeded demo logins (non-production only) already get global access in classic admin. */
export function isPlatformAdmin(session: string | undefined): boolean {
  if (!session) return false;
  const expected = process.env.ADMIN_SECRET;
  if (expected && session === expected) return true;
  return isSeededLoginSecret(session);
}

export async function requireDineSession(request: Request): Promise<
  DineAccessContext & { session: string }
> {
  const session = sessionFromRequest(request);
  if (!(await verifyAdminSecret(session))) {
    throw new DineAuthError("Unauthorized", 401);
  }
  const isPlatform = isPlatformAdmin(session);
  const ownerBusinessId = isPlatform ? null : await resolveOwnerBusinessId(session);
  const selectedBusinessId = isPlatform ? (readCookie(request, DINEPRO_SELECTED_COOKIE) ?? null) : null;
  return { session: session!, ownerBusinessId, isPlatform, selectedBusinessId };
}

export async function assertBusinessAccess(
  ctx: DineAccessContext,
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
  ctx: DineAccessContext,
  requestedId?: string | null,
): Promise<string> {
  if (ctx.isPlatform) {
    if (requestedId) {
      await assertDineProBusiness(requestedId);
      return requestedId;
    }
    const restaurants = await listDineProRestaurants();
    if (restaurants.length === 0) {
      throw new DineAuthError(
        "No DinePro restaurants yet. In Admin → Businesses, set a business's plan to DinePro.",
        404,
      );
    }
    return (restaurants.find((r) => r.id === ctx.selectedBusinessId) ?? restaurants[0]).id;
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
