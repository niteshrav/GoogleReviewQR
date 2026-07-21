import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-brand">FeedbackFlow</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          How was your experience at {business.name}?
        </h1>
        <p className="text-sm text-muted">Your feedback is anonymous. No login required.</p>
      </header>

      <section className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <GoogleReviewButton businessSlug={slug} googleReviewUrl={business.googleReviewUrl} />

        <Link
          href={`/r/${slug}/feedback`}
          className="block min-h-[44px] w-full rounded-xl border border-border px-4 py-3 text-center text-base font-medium text-foreground hover:bg-slate-50"
        >
          Send private feedback
        </Link>
      </section>

      <footer className="mt-auto pt-10 text-center text-xs text-muted">
        Powered by{" "}
        <a href="https://commiters.in" className="font-medium text-brand hover:underline">
          Commiters
        </a>
      </footer>
    </main>
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
