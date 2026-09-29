# TrustTap DinePro — Implementation Plan

> Audit date: 2026-09-18. Extends existing TrustTap; does **not** rebuild the core product.

## Audit summary (reuse)

| Existing | Role for DinePro |
|----------|------------------|
| `Business` | Restaurant tenant (no duplicate org model) |
| `SubscriptionPlan` | Catalog — add `dinepro` row (₹1499 / setup ₹2999) |
| `Feedback` + `/r/[slug]` | Keep as-is for classic TrustTap QR |
| QR `generateQrPngBuffer` | Reuse for table QR PNGs |
| Admin cookie + owner session | Gate `/admin/dinepro/*` + APIs; scope owners via `resolveOwnerBusinessId` |
| Alerts (SMTP / Twilio) | Reuse for HIGH/MEDIUM dine issues |
| UI kit + `AdminShell` pattern | Fork to `DineProShell` |
| `CustomerPageShell` | Guest `/dine/...` mobile flow |
| Pricing / signup wizard | Works for any plan key including `dinepro` |

## Architecture decisions

1. **Tenant = `Business`** with `plan = "dinepro"`. Classic plans keep `/r/{slug}` only.
2. **New tables** under `Business`: Branch → Floor → Table → DineFeedback / DineIssue / DineActivity; optional MenuItem.
3. **Guest route:** `/dine/{restaurantSlug}/{branchSlug}/{tableSlug}` — table resolved server-side; guest never picks table.
4. **Ops UI:** `/admin/dinepro/*` (middleware-protected). Platform admin can pick any DinePro business; owners only their own.
5. **Do not** overload classic `Feedback` for category ratings — use `DineFeedback`.
6. **Google flow:** after dine thank-you, same ungated CTA via existing `GoogleReviewButton` + `/api/google-click`.
7. **Pricing:** never hard-code in UI — seed `SubscriptionPlan` + `PLAN_MONTHLY_INR` fallback only.

## Implementation order

1. Schema + migration + `dinepro` plan seed  
2. Access helpers + repositories + services  
3. Admin structure APIs (branch/floor/table/menu)  
4. QR generate/download + guest dine API/pages  
5. Issues + alerts + live floor + table health  
6. Analytics + dashboard + QR manager + wizard  
7. Pricing / landing DinePro section + admin visibility  
8. Tests + build

## Non-goals (Phase 1 DinePro)

- Separate restaurant auth portal (reuse admin cookie)
- WhatsApp issue alerts (email/in-dashboard first; phone via existing adapters when configured)
- PDF bulk zip (PNG download + print CSS)
- Realtime websockets (poll / refresh for Live Floor MVP)
