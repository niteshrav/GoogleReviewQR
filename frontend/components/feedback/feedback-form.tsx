"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarRating } from "@frontend/components/feedback/star-rating";
import { GoogleReviewButton } from "@frontend/components/google-review-button";
import { Alert } from "@frontend/components/ui/alert";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Textarea } from "@frontend/components/ui/textarea";

type FeedbackFormProps = {
  businessSlug: string;
  businessName: string;
  googleReviewUrl: string;
};

export function FeedbackForm({ businessSlug, businessName, googleReviewUrl }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
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
        customerPhone,
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
          Noted. We’ll take it from here.
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          Thanks for helping {businessName} improve.
        </p>
        <div className="mt-6">
          <GoogleReviewButton
            businessSlug={businessSlug}
            googleReviewUrl={googleReviewUrl}
            label="Also leave a Google review"
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
      <label className="block text-sm font-medium">How was it today?</label>
      <div className="mt-3">
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="mt-6">
        <Textarea
          id="comment"
          name="comment"
          label="What should we know?"
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="text-base"
          placeholder="Service, food, wait time… anything that helps"
          hint={`${comment.length}/1000`}
        />
      </div>

      <div className="mt-6">
        <Input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          label="WhatsApp / phone"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          className="text-base"
          placeholder="+91 98765 43210"
          hint="Optional — so we can reach you and fix this faster."
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
        {loading ? "Sending..." : "Send privately"}
      </Button>

      <div className="mt-4">
        <GoogleReviewButton
          businessSlug={businessSlug}
          googleReviewUrl={googleReviewUrl}
          className="customer-cta block rounded-xl border border-border px-4 py-3 text-center text-base font-medium text-foreground transition-colors hover:bg-background active:bg-brand-soft"
          label="Share your experience on Google"
        />
      </div>
    </form>
  );
}
