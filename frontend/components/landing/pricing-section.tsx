export type PublicPlanCard = {
  key: string;
  name: string;
  tagline: string | null;
  priceInr: number;
  setupFeeInr: number;
  features: string[];
  highlighted: boolean;
};

type PricingSectionProps = {
  plans: PublicPlanCard[];
};

export function PricingSection({ plans }: PricingSectionProps) {
  if (plans.length === 0) {
    return null;
  }

  return (
    <section id="pricing" className="border-t border-border bg-white py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-sm font-semibold text-brand">Pricing</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Subscription plans</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Simple monthly plans for local businesses. Setup is billed once; manage plan assignment
          from the admin dashboard.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.key}
              className={`flex h-full flex-col rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] ${
                plan.highlighted
                  ? "border-brand ring-2 ring-brand/20"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.tagline ? (
                    <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
                  ) : null}
                </div>
                {plan.highlighted ? (
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                    Popular
                  </span>
                ) : null}
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
                {plan.priceInr === 0 ? "Free" : `₹${plan.priceInr}`}
                {plan.priceInr > 0 ? (
                  <span className="text-base font-medium text-muted">/mo</span>
                ) : null}
              </p>
              <p className="mt-1 text-xs text-muted">Setup fee ₹{plan.setupFeeInr}</p>

              <ul className="mt-6 flex-1 space-y-2 text-sm text-muted">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-brand">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`/get-started?plan=${encodeURIComponent(plan.key)}`}
                className={`mt-8 inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-brand text-white hover:bg-brand-dark"
                    : "border border-border bg-white text-foreground hover:bg-brand-soft"
                }`}
              >
                Get started
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
