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
    <main className="bg-mesh mx-auto flex min-h-screen max-w-lg flex-col px-5 py-10">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-semibold text-brand shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          FeedbackFlow
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          How was your experience at {business.name}?
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Your feedback is anonymous. No login required. Google reviews are always available.
        </p>
      </header>

      <section className="mt-8 space-y-3 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <GoogleReviewButton businessSlug={slug} googleReviewUrl={business.googleReviewUrl} />

        <Link
          href={`/r/${slug}/feedback`}
          className="block min-h-[44px] w-full rounded-xl border border-border bg-white px-4 py-3 text-center text-base font-medium text-foreground transition-colors hover:bg-slate-50"
        >
          Send private feedback
        </Link>
      </section>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-white/70 p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Business</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{business.name}</p>
      </div>

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
