# TrustTap DinePro — Implementation Report

**Date:** 2026-09-18  
**Status:** Phase 1 DinePro module shipped on top of existing TrustTap (no rebuild).

## 1. What changed

- Extended Prisma with restaurant hierarchy (Branch → Floor → Table) plus dine feedback, issues, activities, menu items.
- Seeded `dinepro` subscription plan (₹1,499/mo, ₹2,999 setup) via migration into existing `SubscriptionPlan` catalog.
- Added guest table QR flow `/dine/{restaurant}/{branch}/{table}` with category ratings, tags, optional menu rating, ungated Google CTA.
- Added DinePro ops dashboard under `/admin/dinepro/*` (Live Floor, Issues, Analytics, QR Manager, Setup wizard, Menu).
- Access control: owner sessions scoped to their business; platform admin can pass `businessId`; requires `Business.plan === "dinepro"`.
- Reused TrustTap QR PNG helper, alerts, admin cookie auth, pricing/signup, design tokens.

## 2. Key files

| Area | Paths |
|------|--------|
| Plan | `docs/DINEPRO_IMPLEMENTATION.md` |
| Schema / migration | `database/schema.prisma`, `database/migrations/20260918120000_add_dinepro/` |
| Repo | `database/repositories/dine.repository.ts`, `database/index.ts` |
| Services | `backend/lib/dine/access.ts`, `table-health.ts`, `dine-service.ts` |
| API handlers | `backend/routes/dinepro.ts` |
| API routes | `frontend/app/api/dinepro/**`, `frontend/app/api/dine/**` |
| Guest UI | `frontend/app/dine/.../page.tsx`, `components/dinepro/dine-guest-form.tsx` |
| Dashboard UI | `frontend/components/dinepro/*`, `frontend/app/admin/dinepro/**` |
| Marketing | landing `#dinepro` section, pricing CTA “Start DinePro” |
| Billing fallback | `backend/lib/billing/manual-pricing.ts` (`dinepro: 1499`) |

## 3. Database changes

New models: `DineBranch`, `DineFloor`, `DineTable`, `DineMenuItem`, `DineFeedback`, `DineIssue`, `DineActivity`.  
`Business.logoUrl` optional. Indexes on business/branch/floor/table/`createdAt`.  
**Existing** `Business` / `Feedback` / classic `/r/[slug]` unchanged in behavior.

## 4. Routes added

**Guest:** `/dine/[restaurant]/[branch]/[table]`  
**Ops:** `/admin/dinepro`, `/floor`, `/tables`, `/feedback`, `/issues`, `/menu`, `/analytics`, `/qr`, `/setup`

## 5. API endpoints added

- `GET /api/dinepro/context|overview|floor-pulse|tables|feedback|issues|analytics|menu`
- `POST /api/dinepro/branches|floors|tables|menu`
- `GET|PATCH /api/dinepro/tables/[id]`, `GET .../qr`
- `PATCH /api/dinepro/issues/[id]`
- `GET /api/dine/[restaurant]/[branch]/[table]`
- `POST /api/dine/feedback`

## 6. Features completed (MVP)

Plan catalog · structure CRUD · unique table QR · guest dine form · issues + alerts · Live Floor + health score · analytics + insights · QR manager (download/print/regenerate/deactivate) · setup wizard · pricing/landing · admin nav link · tenant isolation for owners.

## 7. Tests

- Unit: `backend/lib/dine/table-health.test.ts` (health, pulse, helpers)
- Full suite: **127** unit tests passing
- `tsc --noEmit` clean for frontend project

## 8. Remaining limitations

- Platform admin must paste business UUID on overview (no restaurant picker UI yet).
- Owner scoping for classic `/admin/businesses` still global (pre-existing); DinePro APIs are scoped.
- Live Floor polls every 30s (no websockets).
- Bulk ZIP download / PDF pack not included (PNG + print card yes).
- WhatsApp-specific issue templates reuse existing owner alert pipeline.
- Feedback list page loads last 30 days (cap 100).

## 9. Production deploy

1. `npx prisma migrate deploy --schema=database/schema.prisma`
2. Ensure `dinepro` plan row exists (migration seeds it).
3. Assign `Business.plan = 'dinepro'` (signup with `?plan=dinepro` or admin edit).
4. Run setup wizard → place table QR cards.
5. Env unchanged beyond existing SMTP/Twilio/Razorpay for alerts & billing.
