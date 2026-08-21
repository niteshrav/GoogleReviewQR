import { notFound } from "next/navigation";
import { getPublicBaseUrl } from "@backend/lib/env";
import { businessService } from "@backend/lib/services/index";
import { MerchantOnePager } from "@frontend/components/admin/merchant-one-pager";

export const dynamic = "force-dynamic";

type OnePagerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOnePagerPage({ params }: OnePagerPageProps) {
  const { id } = await params;
  const business = await businessService.getBusinessById(id);

  if (!business) {
    notFound();
  }

  return (
    <MerchantOnePager
      businessName={business.name}
      slug={business.slug}
      publicReviewUrl={`${getPublicBaseUrl()}/r/${business.slug}`}
      googleReviewUrl={business.googleReviewUrl}
    />
  );
}
