# Commiters FeedbackFlow

QR-powered customer feedback for local businesses. **Phase 1 MVP — ready for testing deploy.**

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4 + Framer Motion
- Prisma + PostgreSQL
- Vitest (TDD for backend utilities)
- Nodemailer (existing Commiters SMTP)
- Vercel deployment target

## Phase 1 scope (complete)

| Feature | Status |
|---------|--------|
| QR landing `/r/{slug}` | ✅ |
| Google review CTA (ungated, primary) | ✅ |
| Private feedback (stars + comment) | ✅ |
| Owner email alerts (rating ≤3) | ✅ |
| Admin: businesses, feedback log, QR export | ✅ |
| Rate limiting + honeypot | ✅ |
| Mobile-first UI (QR scan flow) | ✅ |
| Production deploy config (Vercel) | ✅ |

## Quick start (local testing)

```bash
npm install
cp .env.example .env
# fill DATABASE_URL, ADMIN_SECRET, SMTP_*

npm run db:migrate
npm run db:seed
npm test
npm run dev
```

**Open locally:**

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Admin login | http://localhost:3000/admin/login |
| Cafe Edelweiss (QR flow) | http://localhost:3000/r/cafe-edelweiss |
| Health | http://localhost:3000/api/health |

**Dev admin secrets:** `seed-cafe-edelweiss-admin`, `seed-jmb-cafe-admin`, `seed-lakeview-bistro-admin`

## Test on mobile (before deploy)

QR scans happen on phones. Use a real device:

1. Same Wi‑Fi as laptop → open `http://<your-lan-ip>:3000/r/cafe-edelweiss`
2. Or tunnel: `npx localtunnel --port 3000`
3. Follow: [docs/PHASE_1_E2E_MANUAL_TEST_GUIDE.md](./docs/PHASE_1_E2E_MANUAL_TEST_GUIDE.md)

## Deploy to Vercel (testing / production)

### 1. Pre-deploy gate

```bash
npm run deploy:check
```

Must pass: **86 tests** + production build.

### 2. Vercel env vars

Copy from [`.env.production.example`](./.env.production.example) into Vercel → Settings → Environment Variables:

- `DATABASE_URL` — Neon or Supabase Postgres
- `ADMIN_SECRET` — long random string
- `BASE_URL` — `https://feedbackflow.commiters.in`
- `SMTP_*` — Commiters mail (for alerts)

### 3. DNS

```
feedbackflow.commiters.in  →  cname.vercel-dns.com
```

### 4. Deploy + database

```bash
npx vercel --prod
# then with production DATABASE_URL:
npm run db:migrate:deploy
```

Update real owner emails & Google Place IDs in `backend/lib/fixtures/pilot-businesses.ts`, then:

```bash
npm run db:seed
```

### 5. Smoke test (production)

- [ ] `/api/health` → `{ "status": "ok" }`
- [ ] `/admin/login` with `ADMIN_SECRET`
- [ ] `/r/cafe-edelweiss` on mobile — Google CTA + private feedback
- [ ] Submit 2★ feedback → owner email received
- [ ] Download QR from admin → scan on phone

Full runbook: [docs/PHASE_1_DEPLOY.md](./docs/PHASE_1_DEPLOY.md)

## Project structure

```text
frontend/          # UI + App Router + middleware
backend/           # API handlers, services, validators
database/          # Prisma schema + migrations
docs/              # Phase 1 BRD, deploy, E2E test guide
```

## Docs

- [Phased roadmap](./docs/PHASED_ROADMAP.md)
- [Phase 1 BRD](./docs/PHASE_1_MVP_BRD.md)
- [Phase 1 deploy runbook](./docs/PHASE_1_DEPLOY.md)
- [E2E manual test guide (mobile-first)](./docs/PHASE_1_E2E_MANUAL_TEST_GUIDE.md)
- [Beta checklist (30-day pilot)](./docs/PHASE_1_BETA_CHECKLIST.md)

## Compliance

This product must **not** gate Google reviews by rating. Every customer sees the same Google review option on landing and thank-you screens.
