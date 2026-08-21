"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BusinessForm } from "@frontend/components/admin/business-form";
import { AdminBusinessActions } from "@frontend/components/admin/admin-business-actions";
import { SendWeeklyReportButton } from "@frontend/components/admin/send-weekly-report-button";
import { Badge } from "@frontend/components/ui/badge";
import { Button } from "@frontend/components/ui/button";
import { EmptyState } from "@frontend/components/ui/empty-state";

export type AdminBusinessListItem = {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  ownerWhatsApp: string | null;
  ownerSmsPhone: string | null;
  googleReviewUrl: string;
  isActive: boolean;
  plan: string;
  billingStatus: "trial" | "invoiced" | "paid" | "overdue";
  setupFeePaid: boolean;
  lastWeeklyReportAt: string | null;
};

type PlanOption = {
  key: string;
  label: string;
};

type AdminBusinessesClientProps = {
  businesses: AdminBusinessListItem[];
  publicBaseUrl: string;
  planOptions?: PlanOption[];
};

function BusinessCard({
  business,
  publicBaseUrl,
  planOptions,
}: {
  business: AdminBusinessListItem;
  publicBaseUrl: string;
  planOptions?: PlanOption[];
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const reviewPath = `/r/${business.slug}`;
  const absoluteUrl = `${publicBaseUrl.replace(/\/$/, "")}${reviewPath}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable in some contexts.
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${business.name} feedback`,
          text: `Share your experience with ${business.name}`,
          url: absoluteUrl,
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
        <div className="mb-4 flex items-center justify-between gap-3">
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
          planOptions={planOptions}
          initialValues={{
            id: business.id,
            name: business.name,
            slug: business.slug,
            ownerEmail: business.ownerEmail,
            ownerWhatsApp: business.ownerWhatsApp ?? "",
            ownerSmsPhone: business.ownerSmsPhone ?? "",
            googleReviewUrl: business.googleReviewUrl,
            plan: business.plan,
            billingStatus: business.billingStatus,
            setupFeePaid: business.setupFeePaid,
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
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={business.isActive ? "success" : "default"}>
                {business.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant={business.plan === "premium" ? "premium" : "brand"}>
                {business.plan}
              </Badge>
              <Badge
                variant={
                  business.billingStatus === "paid"
                    ? "success"
                    : business.billingStatus === "overdue"
                      ? "overdue"
                      : business.billingStatus === "invoiced"
                        ? "warning"
                        : "default"
                }
              >
                {business.billingStatus}
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
            <p
              className="mt-1 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-foreground"
              title={absoluteUrl}
            >
              {absoluteUrl}
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
            <a
              href={`/api/admin/feedback/export?businessId=${business.id}`}
              className="font-medium text-brand hover:underline"
            >
              Export CSV
            </a>
            <Link
              href={`/admin/businesses/${business.id}/one-pager`}
              className="font-medium text-brand hover:underline"
            >
              Staff one-pager
            </Link>
            <Link
              href={`/admin/businesses/${business.id}/invoice`}
              className="font-medium text-brand hover:underline"
            >
              UPI invoice
            </Link>
            <Link
              href={`/admin/businesses/${business.id}/case-study`}
              className="font-medium text-brand hover:underline"
            >
              Case study
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-muted">
              Last weekly report:{" "}
              {business.lastWeeklyReportAt
                ? new Date(business.lastWeeklyReportAt).toLocaleDateString()
                : "never"}
            </p>
            <SendWeeklyReportButton businessId={business.id} label="Send report now" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function AdminBusinessesClient({
  businesses,
  publicBaseUrl,
  planOptions,
}: AdminBusinessesClientProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return businesses;
    }
    return businesses.filter(
      (business) =>
        business.name.toLowerCase().includes(q) ||
        business.slug.toLowerCase().includes(q) ||
        business.ownerEmail.toLowerCase().includes(q),
    );
  }, [businesses, query]);

  return (
    <section className="grid min-w-0 gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-24 xl:self-start">
        <h2 className="mb-4 text-lg font-semibold">Create business</h2>
        <BusinessForm planOptions={planOptions} />
      </div>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">All businesses</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-muted">
              {filtered.length}
              {filtered.length !== businesses.length ? ` / ${businesses.length}` : ""}
            </span>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name, slug, email…"
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-[var(--ring)] sm:max-w-xs"
            aria-label="Filter businesses"
          />
        </div>

        {businesses.length === 0 ? (
          <EmptyState
            title="No businesses yet"
            description="Create your first pilot business using the form. QR export and feedback logs appear here."
            icon={<span>▣</span>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try a different name, slug, or owner email."
          />
        ) : (
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            {filtered.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                publicBaseUrl={publicBaseUrl}
                planOptions={planOptions}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
