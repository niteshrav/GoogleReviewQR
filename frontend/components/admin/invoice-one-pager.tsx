"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProoflynLogo } from "@frontend/components/brand/prooflyn-logo";

type InvoiceOnePagerProps = {
  businessId: string;
  businessName: string;
  slug: string;
  ownerEmail: string;
  planKey: string;
  planLabel: string;
  billingStatus: string;
  setupFeePaid: boolean;
  setupFeeInr: number;
  monthlyInr: number;
  dueNowInr: number;
  renewalDateIso: string;
  upiVpa: string;
  isPremium: boolean;
  premiumIncludes: string[];
  upgradePlanLabel: string;
  upgradePlanPriceInr: number;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function InvoiceOnePager({
  businessId,
  businessName,
  slug,
  ownerEmail,
  planKey,
  planLabel,
  billingStatus,
  setupFeePaid,
  setupFeeInr,
  monthlyInr,
  dueNowInr,
  renewalDateIso,
  upiVpa,
  isPremium,
  premiumIncludes,
  upgradePlanLabel,
  upgradePlanPriceInr,
  paymentAmountInr,
  paymentReference,
  paymentReceivedAt,
  lastInvoiceSentAt,
}: InvoiceOnePagerProps) {
  const router = useRouter();
  const [saving, setSaving] = useState<"invoiced" | "paid" | "overdue" | "renew" | "upgrade" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState(
    String(paymentAmountInr ?? Math.max(0, dueNowInr)),
  );
  const [reference, setReference] = useState(paymentReference ?? "");
  const [markSetupFeePaid, setMarkSetupFeePaid] = useState(setupFeePaid || setupFeeInr === 0);

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
  const renewalLabel = formatDate(renewalDateIso);
  const setupIsFree = setupFeeInr === 0;

  async function patchPayment(
    payload: Record<string, unknown>,
    mode: "invoiced" | "paid" | "overdue" | "renew" | "upgrade",
  ) {
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
        mode === "paid" || mode === "renew"
          ? "Payment marked as paid. Renewal recorded."
          : mode === "upgrade"
            ? "Plan upgraded to Premium. Mark payment when UPI lands."
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
        setupFeePaid: markSetupFeePaid || setupIsFree,
      },
      "paid",
    );
  }

  async function renewSubscription() {
    const amount = Number.parseInt(paidAmount, 10);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a valid renewal amount.");
      return;
    }
    await patchPayment(
      {
        billingStatus: "paid",
        paymentReceivedAt: new Date().toISOString(),
        paymentAmountInr: amount,
        paymentReference: reference.trim() || `renewal-${Date.now()}`,
        lastInvoiceSentAt: new Date().toISOString(),
        setupFeePaid: true,
      },
      "renew",
    );
  }

  async function upgradeToPremium() {
    setPaidAmount(String(upgradePlanPriceInr));
    await patchPayment(
      {
        plan: "premium",
        billingStatus: "invoiced",
        lastInvoiceSentAt: new Date().toISOString(),
      },
      "upgrade",
    );
  }

  return (
    <article className="mx-auto max-w-2xl bg-white p-6 print:p-0 sm:p-10">
      <div className="mb-8 hidden print:flex print:items-center print:justify-between">
        <ProoflynLogo variant="horizontal" tagline className="text-sm" />
        <p className="text-xs text-slate-500">Invoice date: {invoiceDate}</p>
      </div>

      <header className="mb-8 flex items-start justify-between gap-4 print:hidden">
        <div>
          <ProoflynLogo variant="horizontal" tagline className="text-sm" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Subscription &amp; renewal
          </h1>
          <p className="mt-1 text-sm text-muted">Manual billing · {invoiceDate}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            Print / PDF
          </button>
          <Link href="/admin/businesses" className="text-xs font-medium text-muted hover:text-brand">
            ← Back to businesses
          </Link>
        </div>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 print:hidden">
        <div className="rounded-2xl border border-border bg-slate-50/80 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Current plan</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{planLabel}</p>
          <p className="mt-1 text-sm text-muted">
            {monthlyInr === 0 ? "₹0 / month" : `₹${monthlyInr.toLocaleString("en-IN")} / month`}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-slate-50/80 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Status</p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[billingStatus] ?? "bg-slate-100 text-slate-600"}`}
          >
            {billingStatus}
          </span>
          <p className="mt-2 text-sm text-muted">Next renewal: {renewalLabel}</p>
        </div>
      </section>

      <div className="mb-8 grid grid-cols-2 gap-6 border-b border-border pb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">From</p>
          <p className="mt-2 font-semibold text-foreground">Commiters</p>
          <p className="text-sm text-muted">Prooflyn service</p>
          <p className="text-sm text-muted">prooflyn.commiters.com</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Bill to</p>
          <p className="mt-2 font-semibold text-foreground">{businessName}</p>
          <p className="text-sm text-muted">{ownerEmail}</p>
          <p className="text-sm text-muted">/r/{slug}</p>
        </div>
      </div>

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
              <p className="font-medium text-foreground">Setup / onboarding</p>
              <p className="text-xs text-muted">QR design, landing page, WhatsApp/SMS alerts</p>
              {setupIsFree || setupFeePaid ? (
                <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                  {setupIsFree ? "FREE for new customers" : "Already paid"}
                </span>
              ) : null}
            </td>
            <td className="py-3.5 text-right font-semibold">
              {setupIsFree || setupFeePaid ? (
                <span className="text-muted">
                  {setupIsFree ? (
                    <>
                      <span className="line-through">₹2,999</span> → ₹0
                    </>
                  ) : (
                    <span className="line-through">₹{setupFeeInr.toLocaleString("en-IN")}</span>
                  )}
                </span>
              ) : (
                `₹${setupFeeInr.toLocaleString("en-IN")}`
              )}
            </td>
          </tr>
          <tr>
            <td className="py-3.5">
              <p className="font-medium text-foreground">{planLabel}</p>
              <p className="text-xs text-muted">
                Monthly subscription · renew by {renewalLabel}
              </p>
            </td>
            <td className="py-3.5 text-right font-semibold">
              {monthlyInr === 0 ? "₹0" : `₹${monthlyInr.toLocaleString("en-IN")}/mo`}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mb-8 flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 shadow-inner">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Amount due</p>
          <p className="mt-0.5 text-xs text-muted">
            {setupIsFree || setupFeePaid ? "Current month renewal" : "Setup (if unpaid) + month"}
          </p>
        </div>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          ₹{dueNowInr.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-border">
        <div className="bg-navy px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Pay via UPI</p>
        </div>
        <div className="px-5 py-4">
          <p className="font-mono text-xl font-semibold tracking-tight text-foreground">
            {upiVpa || <span className="text-muted italic">Set UPI_VPA in environment</span>}
          </p>
          <p className="mt-2 text-xs text-muted">
            Share this page for renewal. After UPI settles, use <strong>Renew now</strong> or{" "}
            <strong>Mark paid</strong>.
          </p>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-border bg-slate-50/70 p-5 print:hidden">
        <h2 className="text-sm font-semibold text-foreground">Renewal &amp; payment actions</h2>
        <p className="mt-1 text-xs text-muted">
          Record UPI details, renew the current plan, or upgrade without leaving this page.
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
              placeholder={String(monthlyInr || dueNowInr)}
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
        {!setupIsFree ? (
          <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={markSetupFeePaid}
              onChange={(event) => setMarkSetupFeePaid(event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Setup fee received
          </label>
        ) : (
          <p className="mt-3 text-xs font-medium text-emerald-700">
            Free Onboarding &amp; Setup for New Customers — no setup charge on this invoice.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void renewSubscription()}
            disabled={saving !== null}
            className="rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {saving === "renew" ? "Saving..." : "Renew now"}
          </button>
          {planKey !== "premium" ? (
            <button
              type="button"
              onClick={() => void upgradeToPremium()}
              disabled={saving !== null}
              className="rounded-xl border border-brand bg-brand-soft px-3 py-2 text-xs font-semibold text-brand disabled:opacity-60"
            >
              {saving === "upgrade" ? "Saving..." : `Upgrade to ${upgradePlanLabel}`}
            </button>
          ) : null}
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
            <p>Next renewal date: {renewalLabel}</p>
            {invoiceSentLabel ? <p>Last invoice sent: {invoiceSentLabel}</p> : null}
            {paidOnLabel ? <p>Last paid on: {paidOnLabel}</p> : null}
            {paymentAmountInr != null ? (
              <p>Last paid amount: ₹{paymentAmountInr.toLocaleString("en-IN")}</p>
            ) : null}
            {paymentReference ? <p>Reference: {paymentReference}</p> : null}
          </div>
        )}
        {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}
        {success ? <p className="mt-3 text-xs font-medium text-emerald-600">{success}</p> : null}
      </section>

      {isPremium ? (
        <section className="rounded-2xl border border-brand/20 bg-brand-soft p-5">
          <p className="text-sm font-semibold text-brand">Premium plan includes</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {premiumIncludes.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-brand">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
          <strong className="text-foreground">Upgrade to {upgradePlanLabel}</strong> — priority
          support from Commiters + weekly proof reports.
        </p>
      )}

      <p className="mt-8 border-t border-border pt-4 text-center text-[11px] text-muted">
        Commiters Prooflyn · prooflyn.commiters.com · Manual billing
      </p>
    </article>
  );
}
