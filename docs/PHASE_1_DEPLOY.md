# Phase 1 MVP — Production Deploy Runbook

**Product:** Commiters FeedbackFlow  
**Target URL:** `https://feedbackflow.commiters.in`  
**Last updated:** July 20, 2026

This runbook finishes **Phase 1.6**. Code and tests are ready; the steps below require your production credentials (database, Vercel, DNS, SMTP).

---

## Prerequisites

| Item | Where to get it |
|------|-----------------|
| PostgreSQL `DATABASE_URL` | Neon / Supabase / managed Postgres |
| `ADMIN_SECRET` | Generate a long random string |
| Commiters SMTP (`SMTP_*`) | Existing Commiters mail settings |
| Vercel project linked to this repo | Vercel dashboard |
| DNS access for `commiters.in` | Domain DNS provider |

---

## 1. Pre-deploy verification (local)

```bash
npm install
npm test
npm run build
```

All tests must pass and the production build must succeed.

Then complete the **mobile-first manual E2E checklist** before cutover:

→ [PHASE_1_E2E_MANUAL_TEST_GUIDE.md](./PHASE_1_E2E_MANUAL_TEST_GUIDE.md)

---

## 2. Configure Vercel environment variables

In the Vercel project (Production):

```text
DATABASE_URL=
ADMIN_SECRET=
BASE_URL=https://feedbackflow.commiters.in
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=FeedbackFlow <noreply@commiters.in>
NODE_ENV=production
```

`vercel.json` already sets `rootDirectory` to `frontend` and builds from the repo root.

---

## 3. DNS

Add a CNAME (or Vercel-recommended record):

```text
feedbackflow.commiters.in  →  cname.vercel-dns.com
```

Enable HTTPS in Vercel for the custom domain.

---

## 4. Deploy

```bash
# From repo root, after linking the project:
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

Update `backend/scripts/seed-pilot.ts` with real owner emails, WhatsApp numbers, and Google Place IDs, then:

```bash
npm run db:seed
```

Confirm three businesses:

- `/r/cafe-edelweiss`
- `/r/jmb-cafe`
- `/r/lakeview-bistro`

---

## 6. Smoke checklist (production)

- [ ] `GET https://feedbackflow.commiters.in/api/health` → `{ "status": "ok" }`
- [ ] Admin login at `/admin/login` with `ADMIN_SECRET`
- [ ] Create / edit / deactivate a test business
- [ ] Customer landing `/r/{slug}` shows Google CTA + private feedback link
- [ ] Submit 2-star feedback → owner email received
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
3. Confirmation that DNS for `feedbackflow.commiters.in` can be updated
4. Real SMTP credentials and pilot Google Place IDs
