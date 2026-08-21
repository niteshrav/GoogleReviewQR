import {
  DuplicatePlanKeyError,
  SubscriptionPlanNotFoundError,
} from "@database/index";
import { isAdminAuthorizedFromHeader } from "@backend/lib/auth/require-admin";
import { jsonError, jsonOk } from "@backend/lib/http";
import { subscriptionPlanService } from "@backend/lib/services/index";
import {
  subscriptionPlanInputSchema,
  subscriptionPlanUpdateSchema,
} from "@backend/lib/validators";

function unauthorized() {
  return jsonError("Unauthorized", 401);
}

function serializePlan(plan: {
  id: string;
  key: string;
  name: string;
  tagline: string | null;
  priceInr: number;
  setupFeeInr: number;
  features: string[];
  highlighted: boolean;
  isPublic: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

export async function listPublicPlans() {
  const plans = await subscriptionPlanService.listPublicPlans();
  return jsonOk({ plans: plans.map(serializePlan) });
}

export async function listAdminPlans(request: Request) {
  if (!(await isAdminAuthorizedFromHeader(request))) {
    return unauthorized();
  }

  const plans = await subscriptionPlanService.listPlans();
  return jsonOk({ plans: plans.map(serializePlan) });
}

export async function createAdminPlan(request: Request) {
  if (!(await isAdminAuthorizedFromHeader(request))) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = subscriptionPlanInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid plan payload", 400);
  }

  try {
    const plan = await subscriptionPlanService.createPlan({
      key: parsed.data.key,
      name: parsed.data.name,
      tagline: parsed.data.tagline?.trim() || null,
      priceInr: parsed.data.priceInr,
      setupFeeInr: parsed.data.setupFeeInr,
      features: parsed.data.features,
      highlighted: parsed.data.highlighted,
      isPublic: parsed.data.isPublic,
      sortOrder: parsed.data.sortOrder,
    });
    return jsonOk({ plan: serializePlan(plan) }, 201);
  } catch (error) {
    if (error instanceof DuplicatePlanKeyError) {
      return jsonError(error.message, 409);
    }
    throw error;
  }
}

export async function updateAdminPlan(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthorizedFromHeader(request))) {
    return unauthorized();
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = subscriptionPlanUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid plan payload", 400);
  }

  const data = {
    ...parsed.data,
    tagline:
      parsed.data.tagline === undefined
        ? undefined
        : parsed.data.tagline === "" || parsed.data.tagline === null
          ? null
          : parsed.data.tagline,
  };

  try {
    const plan = await subscriptionPlanService.updatePlan(id, data);
    return jsonOk({ plan: serializePlan(plan) });
  } catch (error) {
    if (error instanceof SubscriptionPlanNotFoundError) {
      return jsonError(error.message, 404);
    }
    throw error;
  }
}

export async function deleteAdminPlan(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthorizedFromHeader(request))) {
    return unauthorized();
  }

  const { id } = await context.params;

  try {
    await subscriptionPlanService.deletePlan(id);
    return jsonOk({ ok: true });
  } catch (error) {
    if (error instanceof SubscriptionPlanNotFoundError) {
      return jsonError(error.message, 404);
    }
    throw error;
  }
}
