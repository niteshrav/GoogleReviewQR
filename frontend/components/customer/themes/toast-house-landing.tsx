/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { GoogleReviewButton } from "@frontend/components/google-review-button";
import { JustdialReviewLink } from "@frontend/components/justdial-review-link";
import {
  TOAST_HOUSE_ASSETS,
  ToastHouseFooter,
  ToastHouseShell,
  toastHouseSerif,
} from "@frontend/components/customer/themes/toast-house-shell";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"
        />
      </svg>
    </span>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 shrink-0 text-[#2B2B26]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden
    >
      <path
        d="M12 3.5c-4.7 0-8.5 3.3-8.5 7.4 0 2.1 1 4 2.6 5.4L5.5 20l4-1.9c.8.2 1.6.3 2.5.3 4.7 0 8.5-3.3 8.5-7.4S16.7 3.5 12 3.5z"
        strokeLinejoin="round"
      />
      <path d="M8.5 9.8h7M8.5 12.8h4.5" strokeLinecap="round" />
    </svg>
  );
}

type ToastHouseLandingProps = {
  slug: string;
  businessName: string;
  googleReviewUrl: string;
  justdialReviewUrl: string | null;
};

export function ToastHouseLanding({
  slug,
  businessName,
  googleReviewUrl,
  justdialReviewUrl,
}: ToastHouseLandingProps) {
  return (
    <ToastHouseShell centered>
      <img
        src={`${TOAST_HOUSE_ASSETS}/logo.webp`}
        alt={businessName}
        className="h-auto w-[150px] sm:w-[190px]"
      />

      <h1
        className={`${toastHouseSerif.className} mt-5 text-[2.35rem] font-semibold leading-[1.08] sm:text-5xl`}
      >
        <span className="text-[#1F3A2C]">How was your</span>
        <br />
        <span className="text-[#934312]">experience?</span>
      </h1>

      <div aria-hidden className="mt-3 flex items-center gap-3 text-[#934312]">
        <span className="h-px w-12 bg-[#934312]/40" />
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.4 2.5h1.8c.8-1.3 2.3-2.5 4.4-2.5 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
        </svg>
        <span className="h-px w-12 bg-[#934312]/40" />
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-[#4A4A44]">
        Your feedback means a lot to us!
        <br />
        It helps us serve you better.
      </p>

      <section className="mt-7 w-full space-y-3">
        <GoogleReviewButton
          businessSlug={slug}
          googleReviewUrl={googleReviewUrl}
          className="customer-cta flex w-full items-center gap-3 rounded-2xl bg-[#934312] px-4 py-3 text-left text-base font-semibold text-white shadow-md transition-all hover:bg-[#7C380F] active:scale-[0.99]"
        >
          <GoogleIcon />
          <span className="flex-1 text-center">Leave a Google Review</span>
          <ArrowIcon />
        </GoogleReviewButton>

        <Link
          href={`/r/${slug}/feedback`}
          className="customer-cta flex w-full items-center gap-3 rounded-2xl border border-[#934312]/35 bg-white px-4 py-3 text-base font-semibold text-[#2B2B26] shadow-sm transition-colors hover:bg-[#FFF8F1] active:bg-[#FBEFE3]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
            <ChatIcon />
          </span>
          <span className="flex-1 text-center">Send private feedback</span>
          <ArrowIcon />
        </Link>

        <JustdialReviewLink
          justdialReviewUrl={justdialReviewUrl}
          className="customer-cta block w-full rounded-2xl border border-[#934312]/35 bg-white px-4 py-3.5 text-center text-base font-semibold text-[#2B2B26] shadow-sm transition-colors hover:bg-[#FFF8F1]"
        />
      </section>

      <p className="mt-5 text-xs leading-relaxed text-[#6B6B63]">
        Google reviews are always available — we never hide them by rating.
      </p>

      <ToastHouseFooter />
    </ToastHouseShell>
  );
}
