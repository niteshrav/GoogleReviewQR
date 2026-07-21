"use client";

import { FormEvent, useState } from "react";
import { StarRating } from "@frontend/components/feedback/star-rating";
import { GoogleReviewButton } from "@frontend/components/google-review-button";

type FeedbackFormProps = {
  businessSlug: string;
  businessName: string;
  googleReviewUrl: string;
};

export function FeedbackForm({ businessSlug, businessName, googleReviewUrl }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug,
        rating,
        comment,
        honeypot: website,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not submit feedback.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Thank you for your feedback</h2>
        <p className="mt-2 text-sm text-muted">
          We appreciate you taking the time to help {businessName} improve.
        </p>
        <div className="mt-6">
          <GoogleReviewButton
            businessSlug={businessSlug}
            googleReviewUrl={googleReviewUrl}
            label="Share your experience on Google"
          />
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <label className="block text-sm font-medium">Your rating</label>
      <div className="mt-3">
        <StarRating value={rating} onChange={setRating} />
      </div>

      <label htmlFor="comment" className="mt-6 block text-sm font-medium">
        Comments (optional)
      </label>
      <textarea
        id="comment"
        name="comment"
        rows={4}
        maxLength={1000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="mt-2 w-full rounded-lg border border-border px-3 py-3 text-base outline-none ring-brand focus:ring-2"
        placeholder="Tell us what went well or what could improve"
      />

      <input
        type="text"
        name="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <p className="mt-4 text-xs text-muted">Your feedback is anonymous. No login required.</p>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 min-h-[44px] w-full rounded-xl bg-brand px-4 py-3 text-base font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit private feedback"}
      </button>

      <div className="mt-4">
        <GoogleReviewButton
          businessSlug={businessSlug}
          googleReviewUrl={googleReviewUrl}
          className="block min-h-[44px] w-full rounded-xl border border-border px-4 py-3 text-center text-base font-medium text-foreground hover:bg-slate-50"
          label="Share your experience on Google"
        />
      </div>
    </form>
  );
}
