"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyTextButton } from "@frontend/components/feedback/copy-text-button";
import { StarRating } from "@frontend/components/feedback/star-rating";
import { GoogleReviewButton } from "@frontend/components/google-review-button";
import { JustdialReviewLink } from "@frontend/components/justdial-review-link";
import { Alert } from "@frontend/components/ui/alert";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Textarea } from "@frontend/components/ui/textarea";

type FeedbackFormProps = {
  businessSlug: string;
  businessName: string;
  googleReviewUrl: string;
  justdialReviewUrl?: string | null;
};

export function FeedbackForm({
  businessSlug,
  businessName,
  googleReviewUrl,
  justdialReviewUrl,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
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
        customerName,
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

  const hasComment = comment.trim().length > 0;

  const errorAlert = (
    <AnimatePresence>
      {error ? (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <Alert variant="error">{error}</Alert>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (submitted) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-[#e3eef8] bg-white p-6 text-[#0a2e50] shadow-sm"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-secondary">
          ✓
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold tracking-tight">
          Noted. We’ll take it from here.
        </h2>
        <p className="mt-2 text-center text-sm text-[#506070]">
          Thanks for helping {businessName} improve.
        </p>
        <div className="mt-6 space-y-3">
          <GoogleReviewButton
            businessSlug={businessSlug}
            googleReviewUrl={googleReviewUrl}
            label="Also leave a Google review"
            className="customer-cta flex items-center justify-center rounded-2xl bg-[#0a2e50] px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#1565c0]"
          />
          <JustdialReviewLink
            justdialReviewUrl={justdialReviewUrl}
            label="Also rate us on Justdial"
          />
        </div>
      </motion.section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e3eef8] bg-white p-5 text-[#0a2e50] shadow-sm sm:p-6"
    >
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0a2e50] break-words">
          Help us make this better
        </h1>
        <p className="text-sm leading-relaxed text-[#506070] break-words">
          A quick note for {businessName}. We’ll use it to improve.
        </p>
        <p className="text-sm leading-relaxed text-[#506070] break-words">
          No login. Stays with the business — not a public review.
        </p>
      </header>

      <label className="mt-6 block text-sm font-medium">How was it today?</label>
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
        {hasComment ? (
          <div className="mt-3 space-y-2">
            {errorAlert}
            <div className="flex flex-wrap gap-2">
              <CopyTextButton text={comment} />
              <Button
                type="submit"
                loading={loading}
                disabled={rating < 1}
                className="min-h-[48px] min-w-[12rem] flex-1 rounded-2xl !bg-[#0a2e50] text-base font-semibold hover:!bg-[#1565c0]"
              >
                {loading ? "Saving..." : "Save & send privately"}
              </Button>
            </div>
            {rating < 1 ? (
              <p className="text-xs text-muted">Pick a star rating above to save your comment.</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <Input
          id="customerName"
          name="customerName"
          type="text"
          autoComplete="name"
          label="Name (optional)"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="text-base"
          placeholder="Your name"
          maxLength={80}
        />
      </div>

      <div className="mt-6">
        <Input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          label="WhatsApp / phone number (optional)"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          className="text-base"
          placeholder="+91 98765 43210"
          hint="So we can reach you and fix this faster."
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

      {!hasComment && error ? <div className="mt-3">{errorAlert}</div> : null}

      <Button
        type="submit"
        loading={loading}
        fullWidth
        size="lg"
        className="mt-6 min-h-[48px] w-full rounded-2xl !bg-[#0a2e50] text-base font-semibold hover:!bg-[#1565c0]"
      >
        {loading ? "Sending..." : "Send privately"}
      </Button>

      <div className="mt-4">
        <GoogleReviewButton
          businessSlug={businessSlug}
          googleReviewUrl={googleReviewUrl}
          className="customer-cta block rounded-2xl border border-[#d7e3f0] bg-white px-4 py-3 text-center text-base font-semibold text-[#0a2e50] shadow-sm hover:bg-[#e3f2fd]"
          label="Share your experience on Google"
        />
      </div>
    </form>
  );
}
