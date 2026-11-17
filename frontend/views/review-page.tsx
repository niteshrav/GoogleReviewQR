import { notFound } from "next/navigation";
import { BusinessReviewTemplate } from "@frontend/components/customer/business-review-template";
import { getCustomerBusinessBySlug } from "@frontend/lib/customer-business";

/** Public QR landing — short ISR; admin updates revalidate the business tag. */
export const revalidate = 60;

type ReviewPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { slug } = await params;
  const business = await getCustomerBusinessBySlug(slug);

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
  const business = await getCustomerBusinessBySlug(slug);

  if (!business) {
    return { title: "Business not found" };
  }

  return {
    title: `${business.name} — Feedback`,
  };
}
