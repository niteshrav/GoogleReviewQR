import type { BillingPlan } from "@database/types";
import { subscriptionPlanRepository } from "@database/index";

/** Fallback amounts when catalog row is missing (keeps invoices working). */
export const SETUP_FEE_INR = 2999;

export const PLAN_MONTHLY_INR: Record<string, number> = {
  pilot: 0,
  core: 499,
  premium: 999,
};

export function monthlyFeeForPlan(plan: BillingPlan): number {
  return PLAN_MONTHLY_INR[plan] ?? 0;
}

export function planLabel(plan: BillingPlan): string {
  const fee = monthlyFeeForPlan(plan);
  if (plan === "premium") {
    return `Premium ₹${fee}/mo`;
  }
  if (plan === "core") {
    return `Core ₹${fee}/mo`;
  }
  if (plan === "pilot") {
    return "Pilot (free)";
  }
  if (fee === 0) {
    return `${plan} (free)`;
  }
  return `${plan} ₹${fee}/mo`;
}

export function premiumIncludes(): string[] {
  return ["Weekly owner report (WhatsApp + email)", "Priority support from Commiters"];
}

export async function resolvePlanPricing(planKey: BillingPlan): Promise<{
  key: string;
  name: string;
  label: string;
  monthlyInr: number;
  setupFeeInr: number;
  features: string[];
}> {
  const row = await subscriptionPlanRepository.findByKey(planKey);
  if (row) {
    const monthlyInr = row.priceInr;
    const label =
      monthlyInr === 0 ? `${row.name} (free)` : `${row.name} ₹${monthlyInr}/mo`;
    return {
      key: row.key,
      name: row.name,
      label,
      monthlyInr,
      setupFeeInr: row.setupFeeInr,
      features: row.features,
    };
  }

  const monthlyInr = monthlyFeeForPlan(planKey);
  return {
    key: planKey,
    name: planKey,
    label: planLabel(planKey),
    monthlyInr,
    setupFeeInr: SETUP_FEE_INR,
    features: planKey === "premium" ? premiumIncludes() : [],
  };
}
