import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
import { ReviewPageFrame } from "@frontend/components/customer/review-page-frame";
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
    <ReviewPageFrame name={business.name} logoUrl={business.logoUrl} tagline={business.tagline}>
      <Link
        href={`/r/${slug}`}
        className="mt-6 inline-flex min-h-[44px] items-center gap-1 self-start text-base font-medium text-[#1e88e5] hover:underline"
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
    </ReviewPageFrame>
  );
}
