"use client";

import Link from "next/link";
import { TrustTapLogo } from "@frontend/components/brand/trusttap-logo";

type MerchantOnePagerProps = {
  businessName: string;
  slug: string;
  publicReviewUrl: string;
  googleReviewUrl: string;
};

export function MerchantOnePager({
  businessName,
  slug,
  publicReviewUrl,
  googleReviewUrl,
}: MerchantOnePagerProps) {
  return (
    <article className="mx-auto max-w-3xl space-y-8 bg-white p-6 print:p-0 sm:p-10">
      <div className="hidden print:block">
        <TrustTapLogo variant="horizontal" tagline className="text-base" />
      </div>
      <header className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <TrustTapLogo variant="horizontal" tagline className="text-sm" />
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Staff one-pager</h1>
          <p className="mt-2 text-sm text-muted">{businessName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
          >
            Print / save PDF
          </button>
          <Link href="/admin/businesses" className="text-sm font-medium text-brand hover:underline">
            ← Back
          </Link>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold">How to use TrustTap</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground">
          <li>Keep the QR at the counter, table, or billing desk — with the shop name visible.</li>
          <li>Ask every customer to scan after service. Do not only ask happy customers.</li>
          <li>
            The scan opens <code className="rounded bg-slate-100 px-1">/r/{slug}</code>. Google
            review is always available. Private feedback is optional.
          </li>
          <li>If a customer is unhappy, invite them to send private feedback so the owner is alerted.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Links</h2>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            TrustTap page: <span className="break-all font-mono">{publicReviewUrl}</span>
          </li>
          <li>
            Google review: <span className="break-all font-mono">{googleReviewUrl}</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Google compliance — do / don’t</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-semibold text-emerald-900">Do</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-emerald-900">
              <li>Show the same Google review option to everyone</li>
              <li>Let customers post 1–5 stars on Google if they choose</li>
              <li>Use private feedback only as an extra, optional path</li>
            </ul>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
            <p className="font-semibold text-red-900">Don’t</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-red-900">
              <li>Hide Google for low ratings</li>
              <li>Say “tell us privately instead of reviewing on Google”</li>
              <li>Filter who gets the QR based on how happy they look</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Plans (manual UPI)</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Setup ₹2,999 once — QR, landing page, owner alerts.</li>
          <li>Core ₹499/mo — weekly owner report (WhatsApp + email).</li>
          <li>Premium ₹999/mo — weekly report plus same-day priority support from Commiters.</li>
        </ul>
      </section>

      <p className="text-xs text-muted">Powered by Commiters TrustTap.</p>
    </article>
  );
}
