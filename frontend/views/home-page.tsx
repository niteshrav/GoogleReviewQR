import { subscriptionPlanService } from "@backend/lib/services/index";
import { LandingPage } from "@frontend/components/landing/landing-page";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let plans: Awaited<ReturnType<typeof subscriptionPlanService.listPublicPlans>> = [];

  try {
    plans = await subscriptionPlanService.listPublicPlans();
  } catch (error) {
    console.error("[home] failed to load public plans", error);
  }

  return (
    <LandingPage
      plans={plans.map((plan) => ({
        key: plan.key,
        name: plan.name,
        tagline: plan.tagline,
        priceInr: plan.priceInr,
        setupFeeInr: plan.setupFeeInr,
        features: plan.features,
        highlighted: plan.highlighted,
      }))}
    />
  );
}
