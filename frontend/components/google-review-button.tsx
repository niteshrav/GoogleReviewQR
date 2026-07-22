"use client";

import { cn } from "@frontend/lib/cn";

type GoogleReviewButtonProps = {
  businessSlug: string;
  googleReviewUrl: string;
  label?: string;
  className?: string;
};

export function GoogleReviewButton({
  businessSlug,
  googleReviewUrl,
  label = "Leave a Google Review",
  className = "customer-cta block rounded-xl bg-brand px-4 py-3 text-center text-base font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md active:scale-[0.99]",
}: GoogleReviewButtonProps) {
  async function handleClick() {
    try {
      await fetch("/api/google-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessSlug }),
      });
    } catch {
      // Logging failure should not block the customer from reaching Google.
    }

    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <button type="button" onClick={handleClick} className={cn(className)}>
      {label}
    </button>
  );
}
