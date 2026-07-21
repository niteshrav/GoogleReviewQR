import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-10">
      <header className="space-y-2">
        <Link href={`/r/${slug}`} className="text-sm text-brand hover:underline">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Private feedback for {business.name}</h1>
        <p className="text-sm text-muted">
          Share a rating and optional comment. You can still leave a Google review at any time.
        </p>
      </header>

      <div className="mt-8">
        <FeedbackForm
          businessSlug={slug}
          businessName={business.name}
          googleReviewUrl={business.googleReviewUrl}
        />
      </div>
    </main>
  );
}
