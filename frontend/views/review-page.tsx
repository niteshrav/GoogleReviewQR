import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
import { BusinessReviewTemplate } from "@frontend/components/customer/business-review-template";

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
    <BusinessReviewTemplate
      slug={slug}
      name={business.name}
      tagline={business.tagline}
      logoUrl={business.logoUrl}
      googleReviewUrl={business.googleReviewUrl}
      justdialReviewUrl={business.justdialReviewUrl}
    />
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
