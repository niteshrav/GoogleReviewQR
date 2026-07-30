# Phase 1 MVP — Production Deploy Runbook

**Product:** Commiters TrustTap  
**Target URL:** `https://trusttap.commiters.com`  
**Last updated:** July 29, 2026

This runbook finishes **Phase 1.6**. Phone-alert provider credentials are required in addition to database, Vercel, DNS, and SMTP.

---

## Project layout (Vercel)

| Path | Role |
|------|------|
| `frontend/` | Next.js app — **set as Vercel Root Directory** |
| `frontend/vercel.json` | Install/build commands + Mumbai region |
| `backend/` | API handlers, alerts, services (imported via `@backend/*`) |
| `database/` | Prisma schema + migrations |
| `package.json` (repo root) | Single install + `npm run build` |

Vercel project setting **Root Directory** must be `frontend`. That loads `frontend/vercel.json`, which runs install/build from the repo root so Prisma and shared packages resolve correctly.

---

## Prerequisites

| Item | Where to get it |
|------|-----------------|
| PostgreSQL `DATABASE_URL` | Neon / Supabase / managed Postgres |
| `ADMIN_SECRET` | Generate a long random string |
| Commiters SMTP (`SMTP_*`) | Backup email alerts |
| Twilio account (WhatsApp and/or SMS) | Primary phone alerts |
| Vercel project linked to this repo | Vercel dashboard — Root Directory = `frontend` |
| DNS access for `commiters.com` | GoDaddy (or your DNS provider) |

---

## 1. Pre-deploy verification (local)

```bash
npm install
npm run deploy:check
```

All tests must pass and the production build must succeed.

Then complete the **mobile-first manual E2E checklist** before cutover:

→ [PHASE_1_E2E_MANUAL_TEST_GUIDE.md](./PHASE_1_E2E_MANUAL_TEST_GUIDE.md)

---

## 2. Configure Vercel environment variables

Copy values from [`.env.production.example`](../.env.production.example) into Vercel → Project → Settings → Environment Variables (Production):

```text
BASE_URL=https://trusttap.commiters.com
DATABASE_URL=
ADMIN_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=TrustTap <noreply@commiters.com>
ALERT_PHONE_MODE=twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SMS_FROM=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Do **not** add `NODE_ENV` in Vercel. Vercel sets it automatically; setting `NODE_ENV=production` during install can skip Tailwind/PostCSS and break the build.

If Twilio is not ready on day one, set `ALERT_PHONE_MODE=log` temporarily (alerts print to server logs). Switch to `twilio` before calling Phase 1 complete.

**Go-live gate:** do not treat Phase 1 as complete until a real owner phone receives an automated ≤3★ alert.

---

## 3. DNS (GoDaddy)

Add a CNAME for `commiters.com`:

| Type | Host | Value |
|------|------|-------|
| CNAME | `trusttap` | `cname.vercel-dns.com` |

In Vercel → Domains, add `trusttap.commiters.com` and wait for SSL.

---

## 4. Deploy

1. Vercel project: **Root Directory = `frontend`**
2. Connect the GitHub repo (or deploy from CLI):

```bash
# From repo root, after linking the project with root directory frontend:
npx vercel --prod
```

Or push to the connected Git branch if Git integration is enabled.

---

## 5. Apply migrations + seed pilots

Use the **production** `DATABASE_URL`:

```bash
export DATABASE_URL="postgresql://..."
npm run db:migrate:deploy
```

Update `backend/lib/fixtures/pilot-businesses.ts` with real owner emails, WhatsApp/SMS numbers, and Google Place IDs, then:

```bash
npm run db:seed
```

Confirm three businesses:

- `/r/cafe-edelweiss`
- `/r/jmb-cafe`
- `/r/lakeview-bistro`

---

## 6. Smoke checklist (production)

- [ ] `GET https://trusttap.commiters.com/api/health` → `{ "status": "ok" }`
- [ ] Admin login at `/admin/login` with `ADMIN_SECRET`
- [ ] Create / edit / deactivate a test business
- [ ] Customer landing `/r/{slug}` shows Google CTA + private feedback link
- [ ] Submit 2-star feedback → owner **WhatsApp or SMS** received; email backup received
- [ ] Print QR includes **merchant business name**
- [ ] Confirm no manual alert-relay process is required for go-live
- [ ] Google CTA opens review URL and logs click
- [ ] Download QR PNG from admin and scan on a real phone
- [ ] Compliance: Google CTA visible regardless of rating path

---

## 7. Print & install (starts Beta)

1. Download QR for each of the 3 pilots from `/admin/businesses`.
2. Laminate and install at counter / exit.
3. Follow Beta week plan in `docs/PHASE_1_IMPLEMENTATION.md` §11.

---

## Blockers if deploy cannot run from this machine

Provide these and re-run deploy:

1. Production `DATABASE_URL`
2. Vercel login / project link (or deploy token)
3. Confirmation that DNS for `trusttap.commiters.com` can be updated in GoDaddy
4. Real SMTP credentials and pilot Google Place IDs
5. Twilio credentials (or temporary `ALERT_PHONE_MODE=log`)
