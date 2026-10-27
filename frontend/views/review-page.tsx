import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
import { ProoflynLogo } from "@frontend/components/brand/prooflyn-logo";
import { CustomerFooter } from "@frontend/components/customer/customer-footer";
import { CustomerPageShell } from "@frontend/components/customer/customer-page-shell";
import { CustomerPrivacyNotice } from "@frontend/components/customer/customer-privacy-notice";
import { GoogleReviewButton } from "@frontend/components/google-review-button";
import { JustdialReviewLink } from "@frontend/components/justdial-review-link";
import { ToastHouseLanding } from "@frontend/components/customer/themes/toast-house-landing";
import { getReviewTheme } from "@frontend/lib/review-themes";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { slug } = await params;

  const business = await businessService.getActiveBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  if (getReviewTheme(slug) === "toast-house") {
    return (
      <ToastHouseLanding
        slug={slug}
        businessName={business.name}
        googleReviewUrl={business.googleReviewUrl}
        justdialReviewUrl={business.justdialReviewUrl}
      />
    );
  }

  return (
    <CustomerPageShell>
      <header className="space-y-3">
        <ProoflynLogo variant="horizontal" tagline className="text-sm" markClassName="h-9 w-auto" />
        <p className="text-sm font-medium text-muted">{business.name}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground break-words sm:text-3xl">
          How was your experience?
        </h1>
        <CustomerPrivacyNotice />
      </header>

      <section className="mt-8 space-y-3">
        <GoogleReviewButton businessSlug={slug} googleReviewUrl={business.googleReviewUrl} />
        <JustdialReviewLink justdialReviewUrl={business.justdialReviewUrl} />

        <Link
          href={`/r/${slug}/feedback`}
          className="customer-cta block rounded-xl border border-border bg-white px-4 py-3.5 text-center font-medium text-foreground transition-colors hover:bg-background active:bg-brand-soft"
        >
          Send private feedback
        </Link>
      </section>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        Google reviews are always available — we never hide them by rating.
      </p>

      <CustomerFooter />
    </CustomerPageShell>
  );
}

export async function generateReviewMetadata({ params }: ReviewPageProps) {
  const { slug } = await params;
  const business = await businessService.getActiveBusinessBySlug(slug);

  if (!business) {
    return { title: "Business not found" };
  }

  return {
    title: `${business.name} — Feedback`,
  };
}
