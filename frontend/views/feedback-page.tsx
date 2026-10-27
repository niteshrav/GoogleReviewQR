import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
import { ProoflynLogo } from "@frontend/components/brand/prooflyn-logo";
import { CustomerFooter } from "@frontend/components/customer/customer-footer";
import { CustomerPageShell } from "@frontend/components/customer/customer-page-shell";
import { FeedbackForm } from "@frontend/components/feedback/feedback-form";
import { ToastHouseFeedback } from "@frontend/components/customer/themes/toast-house-feedback";
import { getReviewTheme } from "@frontend/lib/review-themes";

export const dynamic = "force-dynamic";

type FeedbackPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { slug } = await params;

  const business = await businessService.getActiveBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  if (getReviewTheme(slug) === "toast-house") {
    return (
      <ToastHouseFeedback
        slug={slug}
        businessName={business.name}
        googleReviewUrl={business.googleReviewUrl}
        justdialReviewUrl={business.justdialReviewUrl}
      />
    );
  }

  return (
    <CustomerPageShell>
      <ProoflynLogo variant="horizontal" tagline className="text-sm" markClassName="h-9 w-auto" />
      <Link
        href={`/r/${slug}`}
        className="mt-3 inline-flex min-h-[44px] items-center gap-1 text-base font-medium text-brand hover:underline sm:text-sm"
      >
        ← Back
      </Link>

      <div className="mt-2 min-w-0">
        <FeedbackForm
          businessSlug={slug}
          businessName={business.name}
          googleReviewUrl={business.googleReviewUrl}
          justdialReviewUrl={business.justdialReviewUrl}
        />
      </div>
      <CustomerFooter />
    </CustomerPageShell>
  );
}
