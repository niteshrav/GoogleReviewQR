"use client";

import { useState } from "react";
import Link from "next/link";
import { BusinessForm } from "@frontend/components/admin/business-form";
import { AdminBusinessActions } from "@frontend/components/admin/admin-business-actions";
import { Badge } from "@frontend/components/ui/badge";
import { Button } from "@frontend/components/ui/button";

type AdminBusinessCardProps = {
  business: {
    id: string;
    name: string;
    slug: string;
    ownerEmail: string;
    ownerWhatsApp: string | null;
    ownerSmsPhone: string | null;
    googleReviewUrl: string;
    isActive: boolean;
  };
};

/** Kept for reuse; list page uses AdminBusinessesClient. */
export function AdminBusinessCard({ business }: AdminBusinessCardProps) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const reviewPath = `/r/${business.slug}`;

  function absoluteReviewUrl() {
    return `${window.location.origin}${reviewPath}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteReviewUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable in some contexts.
    }
  }

  async function shareLink() {
    const url = absoluteReviewUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${business.name} feedback`,
          text: `Share your experience with ${business.name}`,
          url,
        });
        return;
      } catch {
        // Fall through to copy.
      }
    }
    await copyLink();
  }

  if (editing) {
    return (
      <article className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit {business.name}</h2>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-muted hover:underline"
          >
            Cancel
          </button>
        </div>
        <BusinessForm
          initialValues={{
            id: business.id,
            name: business.name,
            slug: business.slug,
            ownerEmail: business.ownerEmail,
            ownerWhatsApp: business.ownerWhatsApp ?? "",
            ownerSmsPhone: business.ownerSmsPhone ?? "",
            googleReviewUrl: business.googleReviewUrl,
          }}
          onSuccess={() => setEditing(false)}
        />
      </article>
    );
  }

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-base font-bold text-brand">
            {business.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight break-words">{business.name}</h2>
            <p className="mt-0.5 text-sm text-muted">/{business.slug}</p>
            <p className="mt-2 text-sm text-foreground break-all">{business.ownerEmail}</p>
            <div className="mt-2">
              <Badge variant={business.isActive ? "success" : "default"}>
                {business.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col sm:items-end">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <AdminBusinessActions
            businessId={business.id}
            slug={business.slug}
            isActive={business.isActive}
            businessName={business.name}
          />
        </div>
      </div>

      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-start">
        <div className="mx-auto w-fit shrink-0 rounded-2xl border border-border bg-slate-50 p-3 sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/admin/qr/${business.slug}?preview=1`}
            alt={`QR code for ${business.name}`}
            className="h-28 w-28 rounded-xl bg-white object-contain p-1"
          />
          <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted">
            QR preview
          </p>
        </div>

        <div className="min-w-0 space-y-3 overflow-hidden">
          <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Public link
            </p>
            <p className="mt-1 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-foreground">
              {reviewPath}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/admin/qr/${business.slug}`}
              className="inline-flex min-h-9 items-center justify-center rounded-xl bg-brand px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              Download QR
            </a>
            <Button size="sm" variant="outline" onClick={copyLink}>
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button size="sm" variant="ghost" onClick={shareLink}>
              Share
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-sm">
            <Link href={reviewPath} className="font-medium text-brand hover:underline">
              View page
            </Link>
            <Link
              href={`/admin/businesses/${business.id}/feedback`}
              className="font-medium text-brand hover:underline"
            >
              Feedback log
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
