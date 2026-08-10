# TrustTap Quality Gate

**Status:** Mandatory — enforced by GitHub, CI, git hooks, and Cursor rules.  
**Last updated:** August 2026

## One rule

**No next feature, module, or phase — and no client release — until the current work is tested and green.**

Bypass is not allowed (`--no-verify`, force-push to `main`, skipping CI).

---

## Automated enforcement (default)

| Layer | What it does |
|-------|----------------|
| **GitHub branch protection** | `main` requires PR + green `Unit & route tests (Vitest)` + `E2E (Playwright)`; admins cannot bypass; no force-push |
| **GitHub Actions** | Every PR/push runs unit then E2E automatically |
| **Git pre-push hook** | Local `git push` runs `npm run test:unit` first |
| **Cursor rule** | Agents must TDD, not mark work done without tests, not start next feature while red |
| **Cursor shell hook** | Blocks `--no-verify` and force-push to `main` from the agent |

Setup (once per clone):

```bash
./scripts/setup-git-hooks.sh
```

(`npm install` / `prepare` also configures hooksPath when possible.)

---

## Definition of Done — Feature / module

Before merge and before starting the next item:

1. Tests written/updated for the new behavior (Vitest and/or Playwright)  
2. `npm run test:unit` passes  
3. If customer or admin UI/API flow changed → E2E updated and `npm run test:e2e` (or CI) passes  
4. PR opened; **TrustTap CI** green  
5. Merged only via protected `main`  

## Definition of Done — Phase exit

1. All features in the phase meet the feature DoD  
2. `main` CI green  
3. Production/staging health OK after deploy  
4. Phase smoke checklist complete (below)  
5. Only then open the next phase  

## Definition of Done — Client go-live

1. CI green on the release commit  
2. Manual smoke (cannot fully automate):  
   - `/api/health`  
   - Mobile open `/r/{slug}`  
   - Private feedback ≤3★ → owner email  
   - QR download + scan  
   - Google CTA visible (ungated)  
3. Real Place ID / owner contacts configured for that merchant  

---

## What to test where

| Change type | Required tests |
|-------------|----------------|
| Backend logic / API | Vitest (`backend/**`, `database/**`) |
| Customer QR / feedback / Google CTA | Playwright `e2e/customer-*.spec.ts` + compliance |
| Admin login / businesses / QR | Playwright `e2e/admin-*.spec.ts` |
| Tooling / CI itself | `testing-toolkit.contract.test.ts` |

Details: [TESTING.md](./TESTING.md)

---

## Re-apply GitHub protection

```bash
./scripts/enable-branch-protection.sh
```
