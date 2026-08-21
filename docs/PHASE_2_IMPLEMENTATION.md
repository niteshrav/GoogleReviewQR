# Phase 2 — Implementation notes

**Product:** Commiters TrustTap  
**Phase:** 2 — Monetize & Retain  
**Last updated:** August 14, 2026  
**Related:** [PHASED_ROADMAP.md](./PHASED_ROADMAP.md) §5

---

## 1. Purpose

Convert pilots to paying clients **without** merchant self-serve, Razorpay, or AI. Billing is UPI/invoice. Google reviews stay ungated.

## 2. Delivered

| Roadmap item | How it ships |
|--------------|----------------|
| Weekly owner report | Monday Vercel cron `30 3 * * 1` → `/api/cron/weekly-reports` (Bearer `CRON_SECRET` or `ADMIN_SECRET`). Admin can **Send report now**. |
| Admin improvements | Business list, toggle, feedback log, **CSV export** |
| Manual billing | Plan `pilot` / `core` / `premium`, status `trial` / `invoiced` / `paid` / `overdue`, setup fee flag, printable UPI invoice, payment amount/ref/date tracking |
| Merchant one-pager | `/admin/businesses/[id]/one-pager` — staff how-to + Google do/don’t |
| Case study template | `/admin/businesses/[id]/case-study` — 30-day stats + quote for Commiters portfolio |
| Premium prep | ₹999/mo option; weekly report copy + priority-support line; invoice lists Premium includes |
| Alert polish | WhatsApp compact template, SMS short fallback, email archive, `alertChannel` on feedback log |

## 3. Ops

1. Set `CRON_SECRET`, `UPI_VPA`, and `ALERT_EMAIL_MODE` (`live` in production) in Vercel.
2. Apply Prisma migrations `20250814120000_phase2_billing_alerts` and `20260818143000_add_payment_tracking`.
3. For each paying merchant: set plan + billing status, print UPI invoice, then use invoice actions to mark `invoiced` / `paid` / `overdue`.
4. When marking paid, capture payment amount + UTR/reference for reconciliation.
5. Print staff one-pager with the QR. Print case study from the best pilot for sales.

## 4. Out of scope (still Phase 3+)

Razorpay, merchant self-signup, AI sentiment, in-app dashboards for owners.
