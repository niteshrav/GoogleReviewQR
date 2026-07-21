# Commiters FeedbackFlow

QR-powered customer feedback for local businesses. Phase 1 MVP (build complete; production cutover pending credentials).

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL
- Vitest (TDD for backend utilities)
- Nodemailer (existing Commiters SMTP)
- Vercel deployment target

## Project structure

```text
frontend/                    # All UI + Next.js app router + middleware
  app/                       # Routes (pages + thin API re-exports)
  components/                # React components
  views/                       # Page view components (not Next.js pages router)
  styles/                      # Global CSS
  middleware.ts
  next.config.ts
  tsconfig.json

backend/                     # All server-side logic
  routes/                      # API handlers
  lib/                         # Auth, email, env, rate-limit, validators
  scripts/                     # Seed scripts
  vitest.config.ts             # Backend tests

database/                    # All database assets
  schema.prisma
  migrations/
  client.ts

docs/                        # Product documentation
```

## Quick start

```bash
npm install
cp .env.example .env
# fill DATABASE_URL, ADMIN_SECRET, SMTP_*

npm run db:migrate
npm test
npm run dev
```

Open:
- Public home: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Health check: `http://localhost:3000/api/health`

## TDD

Backend unit tests live in `backend/`:

```bash
npm test
npm run test:watch
```

## Deployment

Vercel uses `frontend/` as the Next.js root (`vercel.json`). Build runs from repo root to include Prisma generation.

Domain: `feedbackflow.commiters.in`

Full cutover steps: [docs/PHASE_1_DEPLOY.md](./docs/PHASE_1_DEPLOY.md)

```bash
npm test && npm run build
# then configure Vercel env + DNS, deploy, migrate, seed
npm run db:migrate:deploy
npm run db:seed
```

## Docs

- [Phased roadmap](./docs/PHASED_ROADMAP.md)
- [Phase 1 BRD](./docs/PHASE_1_MVP_BRD.md)
- [Phase 1 user stories](./docs/PHASE_1_USER_STORIES.md)
- [Phase 1 use cases](./docs/PHASE_1_USE_CASES.md)
- [Phase 1 architecture](./docs/PHASE_1_ARCHITECTURE.md)
- [Phase 1 implementation (TDD)](./docs/PHASE_1_IMPLEMENTATION.md)
- [Phase 1 deploy runbook](./docs/PHASE_1_DEPLOY.md)
- [Phase 1 E2E manual test guide (mobile-first)](./docs/PHASE_1_E2E_MANUAL_TEST_GUIDE.md)
- [Phase 1 beta checklist](./docs/PHASE_1_BETA_CHECKLIST.md)

## Compliance note

This product must **not** gate Google reviews by rating. Every customer sees the same Google review option.
