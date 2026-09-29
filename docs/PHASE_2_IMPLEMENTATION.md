# Phase 2 — Implementation notes

**Product:** Commiters trustTap  
**Phase:** 2 — Monetize & Retain  
**Last updated:** September 18, 2026  
**Related:** [PHASED_ROADMAP.md](./PHASED_ROADMAP.md) §5

---

## 1. Purpose

Convert pilots to paying clients and prove recurring value. Google reviews stay ungated.

Phase 2 core: weekly reports, admin tools, manual UPI billing, one-pagers, case studies, alert polish.  
Early Phase 3 items already in tree (optional): `/get-started` signup + Razorpay Checkout, admin plan catalog.

## 2. Delivered

| Roadmap item | How it ships |
|--------------|----------------|
| Weekly owner report | Monday Vercel cron `30 3 * * 1` → `/api/cron/weekly-reports` (Bearer `CRON_SECRET` or `ADMIN_SECRET`). Admin can **Send report now**. Cron registered in `frontend/vercel.json`. |
| Admin improvements | Business list, **Deactivate / Reactivate**, feedback log, **CSV export** |
| Manual billing | Plan `pilot` / `core` / `premium`, status `trial` / `invoiced` / `paid` / `overdue`, setup fee flag, printable UPI invoice, payment amount/ref/date tracking |
| Merchant one-pager | `/admin/businesses/[id]/one-pager` — staff how-to + Google do/don’t |
| Case study template | `/admin/businesses/[id]/case-study` — 30-day stats + quote for Commiters portfolio |
| Premium prep | ₹999/mo option; weekly report copy + priority-support line; invoice lists Premium includes |
| Alert polish | WhatsApp compact template, SMS short fallback, email archive, `alertChannel` on feedback log |

## 3. Ops

1. Set `CRON_SECRET`, `UPI_VPA`, and `ALERT_EMAIL_MODE` (`live` in production) in Vercel.
2. Apply Prisma migrations including Phase 2 billing + plans + owner signup access.
3. For each paying merchant: set plan + billing status, print UPI invoice, then use invoice actions to mark `invoiced` / `paid` / `overdue`.
4. When marking paid, capture payment amount + UTR/reference for reconciliation.
5. Print staff one-pager with the QR. Print case study from the best pilot for sales.
6. Optional online signup: set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` and redeploy.

## 4. Out of scope (still Phase 3+)

Full tenant-isolated merchant dashboard, email verification / password reset, AI sentiment, multi-location QR product.
