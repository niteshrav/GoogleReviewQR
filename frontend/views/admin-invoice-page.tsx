import { notFound } from "next/navigation";
import { resolvePlanPricing } from "@backend/lib/billing/manual-pricing";
import { getEnv } from "@backend/lib/env";
import { businessService } from "@backend/lib/services/index";
import { InvoiceOnePager } from "@frontend/components/admin/invoice-one-pager";
import type { BillingPlan, BillingStatus } from "@database/types";

export const dynamic = "force-dynamic";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminInvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const business = await businessService.getBusinessById(id);

  if (!business) {
    notFound();
  }

  const plan = (business.plan as BillingPlan | undefined) ?? "pilot";
  const pricing = await resolvePlanPricing(plan);
  const setupFeePaid = business.setupFeePaid ?? false;
  const dueNowInr = (setupFeePaid ? 0 : pricing.setupFeeInr) + pricing.monthlyInr;

  return (
    <InvoiceOnePager
      businessId={business.id}
      businessName={business.name}
      slug={business.slug}
      ownerEmail={business.ownerEmail}
      planLabel={pricing.label}
      billingStatus={(business.billingStatus as BillingStatus | undefined) ?? "trial"}
      setupFeePaid={setupFeePaid}
      setupFeeInr={pricing.setupFeeInr}
      monthlyInr={pricing.monthlyInr}
      dueNowInr={dueNowInr}
      upiVpa={getEnv().UPI_VPA ?? ""}
      isPremium={plan === "premium" || pricing.monthlyInr >= 999}
      premiumIncludes={
        pricing.features.length > 0
          ? pricing.features
          : ["Weekly owner report (WhatsApp + email)", "Priority support from Commiters"]
      }
      paymentAmountInr={business.paymentAmountInr ?? null}
      paymentReference={business.paymentReference ?? null}
      paymentReceivedAt={business.paymentReceivedAt?.toISOString() ?? null}
      lastInvoiceSentAt={business.lastInvoiceSentAt?.toISOString() ?? null}
    />
  );
}
