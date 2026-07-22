"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarRating } from "@frontend/components/feedback/star-rating";
import { GoogleReviewButton } from "@frontend/components/google-review-button";
import { Alert } from "@frontend/components/ui/alert";
import { Button } from "@frontend/components/ui/button";
import { Textarea } from "@frontend/components/ui/textarea";

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
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-secondary">
          ✓
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold tracking-tight">
          Thank you for your feedback
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          We appreciate you taking the time to help {businessName} improve.
        </p>
        <p className="mt-3 text-center text-xs text-muted">
          You can still share your experience on Google — same option for every customer.
        </p>
        <div className="mt-6">
          <GoogleReviewButton
            businessSlug={businessSlug}
            googleReviewUrl={googleReviewUrl}
            label="Share your experience on Google"
          />
        </div>
      </motion.section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6"
    >
      <label className="block text-sm font-medium">Your rating</label>
      <div className="mt-3">
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="mt-6">
        <Textarea
          id="comment"
          name="comment"
          label="Comments (optional)"
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="text-base"
          placeholder="Tell us what went well or what could improve"
          hint={`${comment.length}/1000`}
        />
      </div>

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

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            <Alert variant="error">{error}</Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Button
        type="submit"
        loading={loading}
        fullWidth
        size="lg"
        className="mt-6 min-h-[44px] w-full"
      >
        {loading ? "Submitting..." : "Submit private feedback"}
      </Button>

      <div className="mt-4">
        <GoogleReviewButton
          businessSlug={businessSlug}
          googleReviewUrl={googleReviewUrl}
          className="customer-cta block rounded-xl border border-border px-4 py-3 text-center text-base font-medium text-foreground transition-colors hover:bg-slate-50 active:bg-slate-100"
          label="Share your experience on Google"
        />
      </div>
    </form>
  );
}
