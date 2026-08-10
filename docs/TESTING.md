# TrustTap Testing Toolkit (TDD)

**Product:** Commiters TrustTap  
**Last updated:** August 2026

## Philosophy

1. Write a failing test that describes behavior  
2. Implement the minimum code to pass  
3. Refactor  
4. Keep the suite green before merge (`npm run test:all` / CI)

**Mandatory gates:** see [QUALITY_GATE.md](./QUALITY_GATE.md). Untested work must not proceed to the next feature/phase or to clients.

## Layers

| Layer | Tool | Location | Command |
|-------|------|----------|---------|
| Unit / route | Vitest | `backend/**/*.test.ts`, `database/**/*.test.ts` | `npm run test:unit` |
| Compliance | Vitest | `backend/lib/compliance.test.ts` | included in unit |
| E2E (mobile) | Playwright | `e2e/*.spec.ts` | `npm run test:e2e` |
| CI gate | GitHub Actions | `.github/workflows/test.yml` | on push / PR |

## Local commands

```bash
# Unit (fast, no browser)
npm run test:unit
npm run test:watch

# E2E — needs Postgres + seeded pilots (Cafe Edelweiss)
docker start feedbackflow-pg   # or your local Postgres on DATABASE_URL
npm run db:migrate:deploy
npm run db:seed
npm run test:e2e

# Interactive Playwright UI
npm run test:e2e:ui

# Full local gate
npm run test:all
```

E2E uses Chromium with a **Pixel 7** mobile viewport (QR scans happen on phones).

## Env for E2E

Uses the same `.env` as local app. Override admin secret if needed:

```bash
E2E_ADMIN_SECRET=local-dev-admin-secret npm run test:e2e
```

Against an already-running server:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

## TDD map for new features

| When you change… | Write/update first… |
|------------------|---------------------|
| Validator / alert rule | `backend/lib/**/*.test.ts` |
| API route | `backend/routes/*.test.ts` |
| Customer UI flow | `e2e/customer-review-flow.spec.ts` |
| Admin auth / screens | `e2e/admin-login.spec.ts` |
| Google CTA compliance | `backend/lib/compliance.test.ts` + `e2e/compliance-ungated-google.spec.ts` |

## Critical E2E specs (acceptance)

- Health + home smoke  
- `/r/cafe-edelweiss` shows ungated Google CTA + private feedback link  
- Private feedback submit (rating + optional phone) → thank-you + Google still available  
- Rating required validation  
- Admin login success / failure  
- Admin create business → appears in list → public `/r/{slug}` loads  
- Admin edit business (owner email)  
- Admin Download QR → PNG file for Cafe Edelweiss  

## Branch protection (merge gate)

**Enabled on `main`:** PRs cannot merge until these CI checks pass:

- `Unit & route tests (Vitest)`
- `E2E (Playwright)`

Also enforced for admins; force-push and branch deletion are disabled.

Re-apply later (if needed):

```bash
./scripts/enable-branch-protection.sh
```

Or in GitHub → **Settings → Branches** → edit the `main` rule.

## CI

GitHub Actions runs Vitest, then Playwright against Postgres 16 + migrate + seed.  
Failed E2E uploads `playwright-report/` as an artifact.
