# Phase 2 Pre-Deploy Runbook (No Deploy)

Use this runbook to prepare Phase 2 for production **without deploying now**.

## 1) Freeze and Branch Hygiene

- Stop feature changes for Phase 2.
- Keep one PR for Phase 2 readiness only.
- Ensure `.env` is not committed (already ignored).

## 2) Environment Readiness

Prepare production variables (do not apply to Vercel yet if not deploying):

- `BASE_URL`
- `DATABASE_URL`
- `ADMIN_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `ALERT_EMAIL_MODE=live`
- `ALERT_PHONE_MODE=twilio` (or `log` temporarily)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM`, `TWILIO_WHATSAPP_FROM`
- `CRON_SECRET`
- `UPI_VPA`

Reference: `.env.production.example`

## 3) Database Safety Checks

Confirm both migrations exist and are ordered:

1. `20250814120000_phase2_billing_alerts`
2. `20260818143000_add_payment_tracking`

Do **not** run production migration now.  
Only verify that SQL files are present and reviewed.

## 4) Local Build/Test Gate

Run these before merge:

```bash
npm run test
npm run build
```

Expected: zero TypeScript/build failures.

## 5) Phase 2 Functional Smoke (Local)

### Billing / Payment

- Open `/admin/businesses/[id]/invoice`
- Click `Mark invoiced`
- Click `Mark paid` with amount + reference
- Click `Mark overdue`
- Verify status reflects correctly in businesses list/dashboard

### Alerts / Reports

- Click `Send report now`
- Verify API returns success
- Verify WhatsApp/SMS path works according to `ALERT_PHONE_MODE`
- Verify email behavior:
  - local/demo: `ALERT_EMAIL_MODE=log` (console output)
  - production-ready config: `ALERT_EMAIL_MODE=live`

## 6) Security and Operational Checks

- `ADMIN_SECRET` length and randomness verified
- `CRON_SECRET` present and private
- No placeholder SMTP values left for production template
- No demo credentials documented as production credentials

## 7) Deploy-Day Commands (For Later)

When deployment is approved, run:

```bash
npm run db:migrate:deploy
npm run build
```

Then deploy app and run post-deploy smoke tests.

## 8) Exit Criteria (Ready But Not Deployed)

Phase 2 is considered production-ready when:

- Build + tests pass locally
- Payment workflow is validated end-to-end
- Env template is complete for production
- Migrations are reviewed and ready
- Team confirms deploy date and rollback owner

