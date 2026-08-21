# Phase 2 Production Checklist

Use this checklist before going live with Phase 2 (Monetize & Retain).

## 1) Database and Migrations

- Run all Prisma migrations in production:
  - `20250814120000_phase2_billing_alerts`
  - `20260818143000_add_payment_tracking`
- Verify `Business` has payment columns:
  - `lastInvoiceSentAt`, `paymentReceivedAt`, `paymentAmountInr`, `paymentReference`

## 2) Required Environment Variables

- `BASE_URL` (public HTTPS domain)
- `DATABASE_URL` (production Postgres URL with SSL)
- `ADMIN_SECRET` (long random string)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `ALERT_EMAIL_MODE=live`
- `ALERT_PHONE_MODE=twilio` (or `log` temporarily if Twilio is not ready)
- `CRON_SECRET`
- `UPI_VPA`

## 3) Alerting and Weekly Reports

- Verify low-rating alerts:
  - WhatsApp/SMS owner alert fires
  - Email archive is sent via SMTP
- Verify weekly reports:
  - Manual trigger works from admin (`Send report now`)
  - Cron route secured by `CRON_SECRET`

## 4) Billing Workflow Verification

- Open `/admin/businesses/[id]/invoice`
- Confirm invoice actions work:
  - `Mark invoiced`
  - `Mark paid` (amount + UTR/reference + setup fee flag)
  - `Mark overdue`
- Confirm status badge updates on business card/dashboard.

## 5) Security and Ops

- Ensure admin secret is not shared publicly.
- Disable any demo/test credentials.
- Confirm logs do not contain sensitive tokens.
- Keep `.env` out of git (already ignored).

