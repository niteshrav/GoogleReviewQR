"use client";

import { FormEvent, useMemo, useState } from "react";
import { StarRating } from "@frontend/components/feedback/star-rating";
import { Button } from "@frontend/components/ui/button";
import { Textarea } from "@frontend/components/ui/textarea";
import { GoogleReviewButton } from "@frontend/components/google-review-button";
import { TrustTapLogo } from "@frontend/components/brand/trusttap-logo";

const ISSUE_TAGS = [
  "Food quality",
  "Food temperature",
  "Waiting time",
  "Service",
  "Cleanliness",
  "Billing",
  "Staff",
  "Ambience",
  "Other",
] as const;

type MenuItem = { id: string; name: string; category: string | null };

type DineGuestFormProps = {
  restaurant: { name: string; slug: string; googleReviewUrl: string; logoUrl?: string | null };
  branch: { name: string; slug: string };
  table: { number: string; slug: string };
  menuItems: MenuItem[];
};

export function DineGuestForm({ restaurant, branch, table, menuItems }: DineGuestFormProps) {
  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [ambience, setAmbience] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [overall, setOverall] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [menuItemId, setMenuItemId] = useState("");
  const [menuItemRating, setMenuItemRating] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = overall >= 1 && !submitting;

  const categories = useMemo(
    () =>
      [
        { label: "FOOD", value: food, set: setFood },
        { label: "SERVICE", value: service, set: setService },
        { label: "AMBIENCE", value: ambience, set: setAmbience },
        { label: "WAIT TIME", value: waitTime, set: setWaitTime },
        { label: "OVERALL EXPERIENCE", value: overall, set: setOverall, required: true },
      ] as const,
    [food, service, ambience, waitTime, overall],
  );

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/dine/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant.slug,
          branchSlug: branch.slug,
          tableSlug: table.slug,
          foodRating: food || null,
          serviceRating: service || null,
          ambienceRating: ambience || null,
          waitTimeRating: waitTime || null,
          overallRating: overall,
          comment: comment || null,
          issueTags: tags,
          menuItemId: menuItemId || null,
          menuItemRating: menuItemId && menuItemRating ? menuItemRating : null,
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submit failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <TrustTapLogo variant="horizontal" tagline className="mx-auto justify-center" />
        <h1 className="text-2xl font-semibold text-foreground">Thank you</h1>
        <p className="text-muted">
          Your feedback for table {table.number} helps {restaurant.name} improve every service.
        </p>
        <GoogleReviewButton
          businessSlug={restaurant.slug}
          googleReviewUrl={restaurant.googleReviewUrl}
        />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center">
        <TrustTapLogo variant="horizontal" tagline className="mx-auto justify-center" />
        <p className="mt-3 text-lg font-semibold text-foreground">{restaurant.name}</p>
        <p className="text-sm text-muted">
          {branch.name} · Table {table.number}
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">How was your experience?</h1>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.label} className="rounded-2xl border border-border bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wide text-navy">{cat.label}</p>
              {"required" in cat && cat.required ? (
                <span className="text-[10px] uppercase text-muted">Required</span>
              ) : null}
            </div>
            <StarRating value={cat.value} onChange={cat.set} />
          </div>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">What would you like to tell us?</label>
        <Textarea
          className="mt-2"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comment"
          maxLength={1000}
          rows={3}
        />
      </div>

      <div>
        <p className="text-sm font-medium">Quick issue tags</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ISSUE_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  active
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-white text-muted"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {menuItems.length > 0 ? (
        <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
          <p className="text-sm font-medium">What did you order? (optional)</p>
          <select
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
            value={menuItemId}
            onChange={(e) => setMenuItemId(e.target.value)}
          >
            <option value="">Skip</option>
            {menuItems.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {menuItemId ? (
            <div>
              <p className="mb-2 text-xs font-semibold text-navy">ITEM RATING</p>
              <StarRating value={menuItemRating} onChange={setMenuItemRating} />
            </div>
          ) : null}
        </div>
      ) : null}

      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <Button type="submit" fullWidth size="lg" disabled={!canSubmit}>
        {submitting ? "Sending…" : "Submit feedback"}
      </Button>
    </form>
  );
}
