import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
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
      <header className="space-y-2">
        <Link
          href={`/r/${slug}`}
          className="inline-flex min-h-[44px] items-center gap-1 text-base font-medium text-brand hover:underline sm:text-sm"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground break-words">
          Help us make this better
        </h1>
        <p className="text-base leading-relaxed text-muted sm:text-sm">
          A quick note for {business.name}. We’ll use it to improve.
        </p>
        <p className="text-sm leading-relaxed text-muted">
          No login. Stays with the business — not a public review.
        </p>
      </header>

      <div className="mt-6">
        <FeedbackForm
          businessSlug={slug}
          businessName={business.name}
          googleReviewUrl={business.googleReviewUrl}
        />
      </div>
    </CustomerPageShell>
  );
}
