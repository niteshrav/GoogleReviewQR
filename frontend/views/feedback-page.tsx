import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
import { TrustTapLogo } from "@frontend/components/brand/trusttap-logo";
import { CustomerFooter } from "@frontend/components/customer/customer-footer";
import { CustomerPageShell } from "@frontend/components/customer/customer-page-shell";
import { FeedbackForm } from "@frontend/components/feedback/feedback-form";

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

  return (
    <CustomerPageShell>
      <TrustTapLogo variant="horizontal" tagline className="text-sm" markClassName="h-8 w-8" />
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
        />
      </div>
      <CustomerFooter />
    </CustomerPageShell>
  );
}
