import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
import { CustomerFooter } from "@frontend/components/customer/customer-footer";
import { CustomerPageShell } from "@frontend/components/customer/customer-page-shell";
import { CustomerPrivacyNotice } from "@frontend/components/customer/customer-privacy-notice";
import { GoogleReviewButton } from "@frontend/components/google-review-button";

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

  return (
    <CustomerPageShell>
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-semibold text-brand shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          {business.name}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground break-words sm:text-3xl">
          How was your experience at {business.name}?
        </h1>
        <CustomerPrivacyNotice />
      </header>

      <section className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Primary</p>
        <GoogleReviewButton businessSlug={slug} googleReviewUrl={business.googleReviewUrl} />

        <div className="pt-1">
          <p className="mb-2 text-xs font-medium text-muted">Or send private feedback</p>
          <Link
            href={`/r/${slug}/feedback`}
            className="customer-cta block rounded-xl border border-border bg-white px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-slate-50 active:bg-slate-100"
          >
            Send us private feedback
          </Link>
        </div>
      </section>

      <p className="mt-4 text-center text-xs text-muted">
        Google reviews are always available to every customer — we never hide or gate them by rating.
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
