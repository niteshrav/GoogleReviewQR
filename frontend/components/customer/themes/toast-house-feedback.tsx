/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FeedbackForm } from "@frontend/components/feedback/feedback-form";
import {
  TOAST_HOUSE_ASSETS,
  ToastHouseFooter,
  ToastHouseShell,
} from "@frontend/components/customer/themes/toast-house-shell";

type ToastHouseFeedbackProps = {
  slug: string;
  businessName: string;
  googleReviewUrl: string;
  justdialReviewUrl: string | null;
};

export function ToastHouseFeedback({
  slug,
  businessName,
  googleReviewUrl,
  justdialReviewUrl,
}: ToastHouseFeedbackProps) {
  return (
    <ToastHouseShell>
      <Link href={`/r/${slug}`} aria-label={`${businessName} home`}>
        <img
          src={`${TOAST_HOUSE_ASSETS}/logo.webp`}
          alt={businessName}
          className="h-auto w-[130px] sm:w-[160px]"
        />
      </Link>

      <Link
        href={`/r/${slug}`}
        className="mt-2 inline-flex min-h-[44px] items-center gap-1 self-start text-base font-medium text-[#934312] hover:underline sm:text-sm"
      >
        ← Back
      </Link>

      <div className="mt-1 w-full min-w-0 text-left [&_form]:border-[#E7DACB] [&_form]:shadow-[0_8px_24px_rgba(147,67,18,0.08)] [&_h1]:font-[family-name:var(--font-toast-serif)] [&_h2]:font-[family-name:var(--font-toast-serif)]">
        <FeedbackForm
          businessSlug={slug}
          businessName={businessName}
          googleReviewUrl={googleReviewUrl}
          justdialReviewUrl={justdialReviewUrl}
        />
      </div>

      <ToastHouseFooter />
    </ToastHouseShell>
  );
}
