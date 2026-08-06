import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { businessService, feedbackService } from "@backend/lib/services/index";
import { CustomerFooter } from "@frontend/components/customer/customer-footer";
import { CustomerPageShell } from "@frontend/components/customer/customer-page-shell";
import { CustomerPrivacyNotice } from "@frontend/components/customer/customer-privacy-notice";
import { GoogleReviewButton } from "@frontend/components/google-review-button";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const showLanding = query.preview === "1";

  const business = await businessService.getActiveBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  if (!showLanding) {
    await feedbackService.logGoogleClick(slug);
    redirect(business.googleReviewUrl);
  }

  return (
    <CustomerPageShell>
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted">{business.name}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground break-words sm:text-3xl">
          How was your experience?
        </h1>
        <CustomerPrivacyNotice />
      </header>

      <section className="mt-8 space-y-3">
        <GoogleReviewButton businessSlug={slug} googleReviewUrl={business.googleReviewUrl} />

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
