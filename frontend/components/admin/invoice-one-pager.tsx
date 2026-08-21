"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrustTapLogo } from "@frontend/components/brand/trusttap-logo";

type InvoiceOnePagerProps = {
  businessId: string;
  businessName: string;
  slug: string;
  ownerEmail: string;
  planLabel: string;
  billingStatus: string;
  setupFeePaid: boolean;
  setupFeeInr: number;
  monthlyInr: number;
  dueNowInr: number;
  upiVpa: string;
  isPremium: boolean;
  premiumIncludes: string[];
  paymentAmountInr: number | null;
  paymentReference: string | null;
  paymentReceivedAt: string | null;
  lastInvoiceSentAt: string | null;
};

const statusColors: Record<string, string> = {
  trial: "bg-slate-100 text-slate-600",
  invoiced: "bg-amber-50 text-amber-700 border border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  overdue: "bg-red-50 text-red-700 border border-red-200",
};

export function InvoiceOnePager({
  businessId,
  businessName,
  slug,
  ownerEmail,
  planLabel,
  billingStatus,
  setupFeePaid,
  setupFeeInr,
  monthlyInr,
  dueNowInr,
  upiVpa,
  isPremium,
  premiumIncludes,
  paymentAmountInr,
  paymentReference,
  paymentReceivedAt,
  lastInvoiceSentAt,
}: InvoiceOnePagerProps) {
  const router = useRouter();
  const [saving, setSaving] = useState<"invoiced" | "paid" | "overdue" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState(
    String(paymentAmountInr ?? Math.max(0, dueNowInr)),
  );
  const [reference, setReference] = useState(paymentReference ?? "");
  const [markSetupFeePaid, setMarkSetupFeePaid] = useState(setupFeePaid);

  const invoiceDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const paidOnLabel = paymentReceivedAt
    ? new Date(paymentReceivedAt).toLocaleString("en-IN")
    : null;
  const invoiceSentLabel = lastInvoiceSentAt
    ? new Date(lastInvoiceSentAt).toLocaleString("en-IN")
    : null;

  async function patchPayment(payload: Record<string, unknown>, mode: "invoiced" | "paid" | "overdue") {
    setSaving(mode);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Could not update payment status");
      }
      setSuccess(
        mode === "paid"
          ? "Payment marked as paid."
          : mode === "invoiced"
            ? "Business marked as invoiced."
            : "Business marked as overdue.",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update payment status");
    } finally {
      setSaving(null);
    }
  }

  async function markInvoiced() {
    await patchPayment(
      {
        billingStatus: "invoiced",
        lastInvoiceSentAt: new Date().toISOString(),
      },
      "invoiced",
    );
  }

  async function markOverdue() {
    await patchPayment({ billingStatus: "overdue" }, "overdue");
  }

  async function markPaid() {
    const amount = Number.parseInt(paidAmount, 10);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a valid paid amount.");
      return;
    }
    await patchPayment(
      {
        billingStatus: "paid",
        paymentReceivedAt: new Date().toISOString(),
        paymentAmountInr: amount,
        paymentReference: reference.trim() || null,
        setupFeePaid: markSetupFeePaid,
      },
      "paid",
    );
  }

  return (
    <article className="mx-auto max-w-2xl bg-white p-6 print:p-0 sm:p-10">
      {/* Print-only header */}
      <div className="mb-8 hidden print:flex print:items-center print:justify-between">
        <TrustTapLogo variant="horizontal" tagline className="text-sm" />
        <p className="text-xs text-slate-500">Invoice date: {invoiceDate}</p>
      </div>

      {/* Screen header */}
      <header className="mb-8 flex items-start justify-between gap-4 print:hidden">
        <div>
          <TrustTapLogo variant="horizontal" tagline className="text-sm" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">UPI invoice</h1>
          <p className="mt-1 text-sm text-muted">Manual billing · {invoiceDate}</p>
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

      {/* From / To */}
      <div className="mb-8 grid grid-cols-2 gap-6 border-b border-border pb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">From</p>
          <p className="mt-2 font-semibold text-foreground">Commiters</p>
          <p className="text-sm text-muted">TrustTap service</p>
          <p className="text-sm text-muted">trusttap.commiters.com</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Bill to</p>
          <p className="mt-2 font-semibold text-foreground">{businessName}</p>
          <p className="text-sm text-muted">{ownerEmail}</p>
          <p className="text-sm text-muted">/r/{slug}</p>
        </div>
      </div>

      {/* Line items */}
      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
              Description
            </th>
            <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr>
            <td className="py-3.5">
              <p className="font-medium text-foreground">Setup fee</p>
              <p className="text-xs text-muted">QR design, landing page, WhatsApp/SMS alerts</p>
              {setupFeePaid ? (
                <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                  Already paid
                </span>
              ) : null}
            </td>
            <td className="py-3.5 text-right font-semibold">
              {setupFeePaid ? (
                <span className="text-muted line-through">₹{setupFeeInr.toLocaleString("en-IN")}</span>
              ) : (
                `₹${setupFeeInr.toLocaleString("en-IN")}`
              )}
            </td>
          </tr>
          <tr>
            <td className="py-3.5">
              <p className="font-medium text-foreground">{planLabel}</p>
              <p className="text-xs text-muted">Monthly plan — {billingStatus}</p>
            </td>
            <td className="py-3.5 text-right font-semibold">
              {monthlyInr === 0 ? "₹0" : `₹${monthlyInr.toLocaleString("en-IN")}/mo`}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Due total */}
      <div className="mb-8 flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 shadow-inner">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Due now</p>
          <p className="mt-0.5 text-xs text-muted">Setup (if unpaid) + first month</p>
        </div>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          ₹{dueNowInr.toLocaleString("en-IN")}
        </p>
      </div>

      {/* UPI payment */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border">
        <div className="bg-navy px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Pay via UPI</p>
        </div>
        <div className="px-5 py-4">
          <p className="font-mono text-xl font-semibold tracking-tight text-foreground">
            {upiVpa || <span className="text-muted italic">Set UPI_VPA in environment</span>}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[billingStatus] ?? "bg-slate-100 text-slate-600"}`}
            >
              {billingStatus}
            </span>
            <p className="text-xs text-muted">
              Mark <strong>invoiced</strong> after sharing this page. Mark <strong>paid</strong> once
              UPI lands.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-border bg-slate-50/70 p-5 print:hidden">
        <h2 className="text-sm font-semibold text-foreground">Payment actions</h2>
        <p className="mt-1 text-xs text-muted">
          Use these after sending invoice and receiving UPI payment.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="paidAmount" className="text-xs font-medium text-muted">
              Paid amount (INR)
            </label>
            <input
              id="paidAmount"
              value={paidAmount}
              onChange={(event) => setPaidAmount(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="3498"
            />
          </div>
          <div>
            <label htmlFor="paymentRef" className="text-xs font-medium text-muted">
              Payment reference / UTR
            </label>
            <input
              id="paymentRef"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="UPI-1234567890"
            />
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={markSetupFeePaid}
            onChange={(event) => setMarkSetupFeePaid(event.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Setup fee received
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={markInvoiced}
            disabled={saving !== null}
            className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 disabled:opacity-60"
          >
            {saving === "invoiced" ? "Saving..." : "Mark invoiced"}
          </button>
          <button
            type="button"
            onClick={markPaid}
            disabled={saving !== null}
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-60"
          >
            {saving === "paid" ? "Saving..." : "Mark paid"}
          </button>
          <button
            type="button"
            onClick={markOverdue}
            disabled={saving !== null}
            className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
          >
            {saving === "overdue" ? "Saving..." : "Mark overdue"}
          </button>
        </div>
        {(invoiceSentLabel || paidOnLabel || paymentAmountInr || paymentReference) && (
          <div className="mt-4 rounded-xl border border-border bg-white p-3 text-xs text-muted">
            {invoiceSentLabel ? <p>Last invoice sent: {invoiceSentLabel}</p> : null}
            {paidOnLabel ? <p>Paid on: {paidOnLabel}</p> : null}
            {paymentAmountInr != null ? <p>Paid amount: ₹{paymentAmountInr.toLocaleString("en-IN")}</p> : null}
            {paymentReference ? <p>Reference: {paymentReference}</p> : null}
          </div>
        )}
        {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}
        {success ? <p className="mt-3 text-xs font-medium text-emerald-600">{success}</p> : null}
      </section>

      {/* Premium or upsell */}
      {isPremium ? (
        <section className="rounded-2xl border border-brand/20 bg-brand-soft p-5">
          <p className="text-sm font-semibold text-brand">Premium plan includes</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {premiumIncludes.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <svg viewBox="0 0 16 16" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-brand">
                  <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
          <strong className="text-foreground">Upgrade to Premium (₹999/mo)</strong> — priority
          support from Commiters + weekly proof reports.
        </p>
      )}

      <p className="mt-8 border-t border-border pt-4 text-center text-[11px] text-muted">
        Commiters TrustTap · trusttap.commiters.com · Manual billing, Phase 2
      </p>
    </article>
  );
}
