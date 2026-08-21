"use client";

import Link from "next/link";
import { TrustTapLogo } from "@frontend/components/brand/trusttap-logo";

type CaseStudyOnePagerProps = {
  businessName: string;
  slug: string;
  periodLabel: string;
  googleClicks: number;
  privateFeedback: number;
  alertsSent: number;
  averageRating: string;
  quote: string | null;
  planLabel: string;
};

export function CaseStudyOnePager({
  businessName,
  slug,
  periodLabel,
  googleClicks,
  privateFeedback,
  alertsSent,
  averageRating,
  quote,
  planLabel,
}: CaseStudyOnePagerProps) {
  return (
    <article className="mx-auto max-w-2xl bg-white p-6 print:p-0 sm:p-10">
      {/* Print header */}
      <div className="mb-8 hidden print:flex print:items-center print:justify-between">
        <TrustTapLogo variant="horizontal" tagline className="text-sm" />
        <p className="text-xs text-slate-500">Commiters portfolio · {periodLabel}</p>
      </div>

      {/* Screen header */}
      <header className="mb-8 flex items-start justify-between gap-4 print:hidden">
        <div>
          <TrustTapLogo variant="horizontal" tagline className="text-sm" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Case study</h1>
          <p className="mt-1 text-sm text-muted">{businessName} · {periodLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M5 1a2 2 0 00-2 2v1h10V3a2 2 0 00-2-2H5zM3 5v6a2 2 0 002 2h6a2 2 0 002-2V5H3zm4 3a.75.75 0 011.5 0v2.19l.72-.72a.75.75 0 111.06 1.06l-2 2a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06l.72.72V8z" />
            </svg>
            Print / PDF
          </button>
          <Link href="/admin/businesses" className="text-xs font-medium text-muted hover:text-brand">
            ← Back to businesses
          </Link>
        </div>
      </header>

      {/* Hero statement */}
      <section className="mb-8 border-b border-border pb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
          Portfolio one-pager
        </p>
        <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-foreground sm:text-2xl">
          {businessName} recovered private complaints before they became public Google reviews
        </h2>
        <p className="mt-2 text-sm text-muted">
          Plan: {planLabel} · Period: {periodLabel} · QR path:{" "}
          <code className="rounded bg-slate-50 px-1 py-0.5 text-xs">/r/{slug}</code>
        </p>
      </section>

      {/* KPI grid */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Google taps" value={String(googleClicks)} />
        <StatCard label="Private notes" value={String(privateFeedback)} />
        <StatCard label="Owner alerts" value={String(alertsSent)} />
        <StatCard label="Avg private rating" value={averageRating} highlight />
      </section>

      {/* Quote */}
      {quote ? (
        <blockquote className="mb-8 rounded-2xl border-l-4 border-brand bg-brand-soft px-6 py-5">
          <p className="text-sm italic leading-relaxed text-foreground">"{quote}"</p>
          <p className="mt-2 text-xs font-medium text-brand">— Private feedback, {businessName}</p>
        </blockquote>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-border px-5 py-4">
          <p className="text-sm text-muted">
            Add a private comment from this pilot to use as the quote here.
          </p>
        </div>
      )}

      {/* How it worked */}
      <section className="mb-8">
        <h3 className="text-base font-bold text-foreground">How TrustTap worked</h3>
        <ul className="mt-3 space-y-2">
          {[
            "One named QR at the counter — every customer could still open Google freely.",
            "Unhappy guests sent a private note; the owner was alerted via WhatsApp or SMS within the same visit.",
            "Commiters sent a weekly proof email: scans, Google taps, private notes, and alerts.",
          ].map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-foreground">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="mt-0.5 h-4 w-4 shrink-0 text-brand"
              >
                <path
                  fillRule="evenodd"
                  d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"
                  clipRule="evenodd"
                />
              </svg>
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* Differentiator */}
      <section className="mb-8 rounded-2xl bg-slate-50 px-5 py-5">
        <h3 className="text-sm font-bold text-foreground">Why this is not just a QR poster</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Static Google QR posters cannot alert the owner in time. TrustTap is a real-time recovery
          system: Google stays ungated, private recovery is optional, and Commiters operates setup plus
          weekly proof. No merchant app needed.
        </p>
      </section>

      <p className="border-t border-border pt-4 text-center text-[11px] text-muted">
        Commiters TrustTap · trusttap.commiters.com · Designed for merchant pilots
      </p>
    </article>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${highlight ? "border-brand/20 bg-brand-soft" : "border-border"}`}
    >
      <p className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? "text-brand" : "text-muted"}`}>
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${highlight ? "text-brand" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
