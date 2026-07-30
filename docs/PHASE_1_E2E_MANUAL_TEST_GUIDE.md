# Phase 1 MVP — Pre-Deploy End-to-End Manual Test Guide

**Product:** Commiters TrustTap  
**Audience:** Commiters before production cutover  
**Priority:** Mobile-first (QR scans + feedback happen on phones)  
**Last updated:** July 26, 2026  
**Related:** [PHASE_1_DEPLOY.md](./PHASE_1_DEPLOY.md) · [PHASE_1_BETA_CHECKLIST.md](./PHASE_1_BETA_CHECKLIST.md)

Automated guardrails: `backend/lib/mobile-first.test.ts` + `npm test`.  
This guide covers **manual** checks that cannot be fully automated (real phone, WA/SMS, QR print).

**Alert rule under test:** ≤3★ private feedback must buzz the owner’s phone automatically (WhatsApp or SMS). Email is backup. Manual dashboard relay is a fail.

---

## 0. Prerequisites

| Item | Ready? |
|------|--------|
| `npm test` green | ☐ |
| `npm run build` succeeds | ☐ |
| Local app running (`npm run dev`) or staging URL | ☐ |
| Seeded pilots present (`npm run db:seed`) | ☐ |
| Real phone on **mobile data** (not only Wi‑Fi) | ☐ |
| Second person optional for SMTP inbox check | ☐ |

**Seeded customer URLs (local):**

| Business | Landing | Feedback |
|----------|---------|----------|
| Cafe Edelweiss | http://localhost:3000/r/cafe-edelweiss | http://localhost:3000/r/cafe-edelweiss/feedback |
| JMB Cafe | http://localhost:3000/r/jmb-cafe | http://localhost:3000/r/jmb-cafe/feedback |
| Lakeview Bistro | http://localhost:3000/r/lakeview-bistro | http://localhost:3000/r/lakeview-bistro/feedback |

**Admin:** http://localhost:3000/admin/login  
Use a seeded secret from the login page (dev only), e.g. `seed-cafe-edelweiss-admin`.

**How to open on a phone while developing locally**

1. Same Wi‑Fi as your laptop, or use a tunnel (`npx localtunnel --port 3000` / Cloudflare / ngrok).
2. Prefer Chrome DevTools → device toolbar only as a **first pass**; final sign-off must be a **real phone**.

**Device matrix (minimum)**

| Device | Browser | Required? |
|--------|---------|-----------|
| iPhone (recent iOS) Safari | Safari | ☐ Must |
| Android Chrome | Chrome | ☐ Must |
| Desktop Chrome (admin only) | Chrome | ☐ Should |

---

## 1. Automated gate (must pass before manual)

```bash
npm test
npm run build
```

- [ ] All tests pass (includes mobile-first + compliance suites)
- [ ] Production build succeeds

---

## 2. Mobile customer flow — Cafe Edelweiss (happy path)

Use a **real phone**. Portrait orientation.

### 2.1 Landing (QR / deep link)

Open: `/r/cafe-edelweiss`

| # | Check | Pass |
|---|--------|------|
| C1 | Page loads in &lt; 3s on mobile data | ☐ |
| C2 | No horizontal scroll; content fits phone width | ☐ |
| C3 | Headline shows **Cafe Edelweiss** | ☐ |
| C4 | “Anonymous / no login” copy is visible | ☐ |
| C5 | **Leave a Google Review** is full-width and easy to tap with thumb | ☐ |
| C6 | **Send private feedback** is full-width and easy to tap | ☐ |
| C7 | Both CTAs visible **without** scrolling on a typical phone viewport (or only light scroll) | ☐ |
| C8 | Footer “Powered by Commiters” does not overlap CTAs | ☐ |

### 2.2 Google review CTA

| # | Check | Pass |
|---|--------|------|
| G1 | Tap Google CTA → Google review URL opens (new tab / app) | ☐ |
| G2 | Returning to FeedbackFlow still works (browser back / app switch) | ☐ |
| G3 | Admin feedback log later shows a **Google click = Yes** row | ☐ |
| G4 | Google click alone does **not** require a rating | ☐ |

### 2.3 Private feedback form

Open: `/r/cafe-edelweiss/feedback`

| # | Check | Pass |
|---|--------|------|
| F1 | “← Back” returns to landing | ☐ |
| F2 | Star targets are easy to hit (no mis-taps on neighbors) | ☐ |
| F3 | Focusing the comment field does **not** aggressively zoom the page (iOS) | ☐ |
| F4 | Soft keyboard does not permanently hide Submit | ☐ |
| F5 | Submit without stars → validation error | ☐ |
| F6 | Submit 5★ + short comment → thank-you state | ☐ |
| F7 | Thank-you still shows **Share your experience on Google** | ☐ |
| F8 | No name / email / phone fields appear anywhere | ☐ |

### 2.4 Low-rating path (alert)

| # | Check | Pass |
|---|--------|------|
| L1 | Submit **2★** with comment: “Service was slow” | ☐ |
| L2 | Thank-you + Google CTA still shown (no gating) | ☐ |
| L3 | Owner receives **WhatsApp or SMS** within ~60s | ☐ |
| L4 | Email backup also received | ☐ |
| L5 | Alert includes business name, rating, comment, timestamp | ☐ |
| L6 | Admin log shows rating 2 + comment; alert sent = Yes | ☐ |
| L7 | No staff member manually WhatsApp’d the owner from the dashboard | ☐ |

### 2.5 Compliance on mobile

| # | Check | Pass |
|---|--------|------|
| X1 | After 1★ or 2★, Google CTA is still visible and tappable | ☐ |
| X2 | No copy like “leave private feedback instead of a Google review” | ☐ |
| X3 | Landing always offers Google + private feedback equally | ☐ |
| X4 | Team can explain: public bad Google reviews are still possible if customer taps Google | ☐ |

---

## 3. Repeat smoke on remaining pilots (mobile)

Quick pass only (landing loads + Google CTA + feedback form opens):

| Business | Landing OK | Form OK | Google opens |
|----------|------------|---------|--------------|
| JMB Cafe | ☐ | ☐ | ☐ |
| Lakeview Bistro | ☐ | ☐ | ☐ |

---

## 4. QR scan path (print simulation)

Do this **before** laminating production stickers.

| # | Check | Pass |
|---|--------|------|
| Q1 | Admin → Businesses → Cafe Edelweiss → **Download QR** | ☐ |
| Q2 | PNG opens / downloads (`cafe-edelweiss-qr.png`) | ☐ |
| Q3 | Phone camera scans QR → opens `/r/cafe-edelweiss` over HTTPS (prod) or tunnel (local) | ☐ |
| Q4 | Scanned URL matches `BASE_URL` (no wrong host) | ☐ |
| Q5 | Repeat for JMB + Lakeview | ☐ |

---

## 5. Admin path (desktop or tablet OK)

Admin is Commiters-internal; customer path is the mobile priority.

| # | Check | Pass |
|---|--------|------|
| A1 | `/admin` redirects to login when logged out | ☐ |
| A2 | Seeded secret signs in (dev) / `ADMIN_SECRET` (staging) | ☐ |
| A3 | Create a temporary business; landing loads | ☐ |
| A4 | Edit owner email / Google URL; save succeeds | ☐ |
| A5 | Feedback log lists newest first | ☐ |
| A6 | Deactivate business → `/r/{slug}` returns 404 | ☐ |
| A7 | Reactivate or leave deactivated as intended | ☐ |

---

## 6. Error / edge cases (mobile)

| # | Check | Pass |
|---|--------|------|
| E1 | Unknown slug `/r/does-not-exist` → friendly not-found | ☐ |
| E2 | Inactive business → not found | ☐ |
| E3 | Double-tap Submit does not create confusing duplicate UX (loading disabled) | ☐ |
| E4 | Airplane mode → graceful error on submit (not white screen) | ☐ |
| E5 | `/api/health` returns `ok` on the environment under test | ☐ |

---

## 7. Pre-deploy sign-off

| Gate | Owner | Pass |
|------|-------|------|
| Automated tests + build | Eng | ☐ |
| Mobile customer flow (iPhone) | Eng / Product | ☐ |
| Mobile customer flow (Android) | Eng / Product | ☐ |
| QR scan from printed/test PNG | Eng | ☐ |
| Low-rating **phone** alert (WA or SMS) | Eng | ☐ |
| Email backup on real SMTP | Eng | ☐ |
| Named physical QR print (shop name) | Eng / Ops | ☐ |
| Compliance (no gating) + honest bad-review messaging | Product | ☐ |
| Ready for [PHASE_1_DEPLOY.md](./PHASE_1_DEPLOY.md) | Product | ☐ |

**Sign-off**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering | | | ☐ |
| Product owner | | | ☐ |

---

## 8. Failure triage (common)

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Page tiny / zoomed wrong | Missing viewport | Confirm `viewport` in `frontend/app/layout.tsx` |
| iOS zooms on comment focus | Input font &lt; 16px | Keep `text-base` on form controls |
| Google opens but no admin click row | API/network blocked | Check `/api/google-click` + admin log |
| Feedback saved, no email | SMTP / `alertSentAt` null | Check SMTP env; read server logs |
| QR opens wrong host | `BASE_URL` mismatch | Align env with public domain |
| Horizontal scroll | Wide element | Inspect customer views; keep `max-w-lg` |

---

## 9. After this guide passes

1. Follow [PHASE_1_DEPLOY.md](./PHASE_1_DEPLOY.md) for production cutover.  
2. Re-run **sections 2, 4, 2.4** once against `https://trusttap.commiters.com`.  
3. Start [PHASE_1_BETA_CHECKLIST.md](./PHASE_1_BETA_CHECKLIST.md) (print + café install).
