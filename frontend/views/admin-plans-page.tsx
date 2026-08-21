import { subscriptionPlanService } from "@backend/lib/services/index";
import { AdminPlansClient } from "@frontend/components/admin/admin-plans-client";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await subscriptionPlanService.listPlans();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Admin</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Subscription plans</h1>
        <p className="mt-2 text-sm text-muted">
          Create and edit plans shown on the homepage. Assign a plan key to each business from
          Businesses.
        </p>
      </div>

      <AdminPlansClient
        initialPlans={plans.map((plan) => ({
          id: plan.id,
          key: plan.key,
          name: plan.name,
          tagline: plan.tagline,
          priceInr: plan.priceInr,
          setupFeeInr: plan.setupFeeInr,
          features: plan.features,
          highlighted: plan.highlighted,
          isPublic: plan.isPublic,
          sortOrder: plan.sortOrder,
        }))}
      />
    </div>
  );
}
