import { cache } from "react";
import { unstable_cache } from "next/cache";
import { businessService } from "@backend/lib/services/index";

export type CustomerBusinessPublic = {
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  googleReviewUrl: string;
  justdialReviewUrl: string | null;
  isActive: boolean;
};

/**
 * Request-deduped + short-lived cached lookup for QR landing / feedback pages.
 * Avoids double DB hits (page + metadata) and full Business row transfer.
 */
export const getCustomerBusinessBySlug = cache(async (slug: string) => {
  return unstable_cache(
    async (): Promise<CustomerBusinessPublic | null> => {
      const business = await businessService.getActivePublicBusinessBySlug(slug);
      if (!business) {
        return null;
      }
      return {
        slug: business.slug,
        name: business.name,
        tagline: business.tagline ?? null,
        logoUrl: business.logoUrl ?? null,
        googleReviewUrl: business.googleReviewUrl,
        justdialReviewUrl: business.justdialReviewUrl ?? null,
        isActive: business.isActive,
      };
    },
    [`customer-business-${slug}`],
    { revalidate: 60, tags: [`business-${slug}`] },
  )();
});

export function customerBusinessTag(slug: string) {
  return `business-${slug}`;
}
