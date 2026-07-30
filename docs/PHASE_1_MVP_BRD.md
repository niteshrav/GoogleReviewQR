# Phase 1 MVP — Business Requirements Document

**Product:** Commiters TrustTap  
**Phase:** 1 — Pilot MVP  
**Document version:** 1.1  
**Last updated:** July 26, 2026  
**Author:** Commiters  
**Parent document:** [PHASED_ROADMAP.md](./PHASED_ROADMAP.md)

---

## 1. Executive Summary

Phase 1 delivers a **production-ready, Google-compliant QR feedback experience** for a small number of Udaipur cafés, restaurants, and similar local shops. Commiters manually onboards each merchant. Customers scan a QR code, can leave a Google review in one tap, and optionally submit private feedback. Business owners receive **automated phone alerts** (WhatsApp or SMS) when feedback indicates a poor experience, with email as backup.

This phase validates **product-market fit and compliance** before investing in self-serve auth, dashboards, or payments.

**Build target:** ~5–8 development days (includes phone-alert channel)  
**Beta target:** 3 active businesses for 30 days  
**Revenue:** None (free pilot)

**Not a print competitor:** Phase 1 must beat static ₹1,000–1,500 “lifetime QR boards” on **recovery + alerts + support**, not on sticker price.

---

## 2. Business Objectives

| # | Objective | Measurable outcome |
|---|-----------|-------------------|
| BO-1 | Validate demand with real Udaipur hospitality businesses | 3 businesses with QR displayed for ≥30 days |
| BO-2 | Prove compliant review facilitation | 100% of customers see equal Google review access |
| BO-3 | Prove owner alert value | ≥1 documented case of issue resolved before public review |
| BO-4 | Generate Commiters leads | “Powered by Commiters” on every customer page |
| BO-5 | Establish technical foundation | Stable production deployment reusable in Phase 2+ |

---

## 3. Stakeholders

| Role | Person / entity | Interest |
|------|-----------------|----------|
| Product owner | Commiters founder | Speed to pilot, compliance, upsell path |
| Developer | Commiters (solo) | Minimal scope, clean architecture for Phase 3 |
| Pilot merchants | 3 Udaipur cafés/restaurants | More reviews, faster complaint handling |
| End customers | Café/restaurant visitors | Fast, no-login, trustworthy experience |
| Regulator context | Google Maps policy, India DPDP | No gating; minimal personal data |

---

## 4. User Personas

### 4.1 Café Owner (Primary — B2B)

- **Name:** Raj, owner of a lakeside café in Udaipur
- **Goals:** More Google reviews, know when service fails before it goes public
- **Pain:** Doesn’t check email often; won’t use a dashboard daily
- **Tech comfort:** Uses WhatsApp constantly; not technical
- **Phase 1 expectation:** Commiters installs everything; Raj gets an **automatic WhatsApp or SMS** when someone is unhappy (email is backup only)

### 4.2 Customer (Primary — B2C)

- **Name:** Priya, tourist having lunch
- **Goals:** Quick way to praise or complain without hassle
- **Pain:** Doesn’t want to create accounts or give phone number
- **Phase 1 expectation:** Scan QR → tap Google review OR leave quick private feedback in &lt;30 seconds

### 4.3 Commiters Admin (Internal)

- **Name:** Founder / developer
- **Goals:** Create businesses, deploy QRs, monitor pilot health
- **Phase 1 expectation:** Hidden admin interface or seed scripts; no public merchant signup

---

## 5. Scope

### 5.1 In scope

- One QR code per business (single location label optional, e.g. “main”)
- Public customer landing page per business slug
- Google review redirect (primary CTA)
- Optional private feedback (internal 1–5 stars + optional text comment)
- Feedback storage in PostgreSQL
- Owner alert on low rating (≤3 stars) or substantive negative comment
- Alert channels:
  - **Primary (Must):** automated WhatsApp Business API **or** automated SMS (owner’s phone buzzes; no human relay)
  - **Secondary (Must):** email via Commiters SMTP (archive / backup)
- Hidden Commiters admin: create, edit, deactivate businesses
- Rate limiting and bot protection on public write endpoints
- “Powered by Commiters” footer on customer pages
- Production deployment (Vercel + managed PostgreSQL)
- Basic privacy notice on customer page (anonymous feedback, no PII collected)
- Physical pilot QR with **merchant business name printed** on the board

### 5.2 Out of scope

| Item | Deferred to |
|------|-------------|
| Merchant self-registration | Phase 3 |
| Merchant login / password reset | Phase 3 |
| Customer name or phone collection | Phase 3 (with consent) |
| Merchant dashboard UI / analytics charts | Phase 2–4 |
| Payment / subscriptions | Phase 2 (manual) / Phase 3 (in-app) |
| Instagram / UPI / multi-link QR inside the product | Phase 2+ (optional); not required to beat print boards |
| **Manual staff WhatsApp / dashboard babysitting** | Never (ops anti-pattern) |
| Multiple QR codes per business | Phase 3 |
| AI sentiment analysis | Phase 4 |
| Weekly automated digests | Phase 2 |
| Acrylic QR stands | Post-validation |
| Mobile native app | Never (web-only product) |
| Incentives tied to Google reviews | Never (policy violation) |
| Star-based routing to Google | Never (policy violation) |
| Promise of “no negative Google reviews” | Never (impossible under compliant equal access) |

---

## 6. Compliant Customer Journey

### 6.1 Flow diagram

```
Customer scans QR
        │
        ▼
┌───────────────────────────────────────┐
│  Landing page                         │
│  • Business name + optional location  │
│  • [Leave a Google Review]  PRIMARY   │
│  • [Send private feedback]  secondary │
└───────────────────────────────────────┘
        │                    │
        │ Google CTA         │ Private feedback
        ▼                    ▼
 Redirect to           ┌─────────────────────┐
 googleReviewUrl       │ Internal 1–5 stars  │
 (log click)           │ Optional comment    │
                       │ [Submit]            │
                       └─────────────────────┘
                                 │
                                 ▼
                       ┌─────────────────────┐
                       │ Thank you screen    │
                       │ Google CTA still    │
                       │ visible (optional)  │
                       └─────────────────────┘
                                 │
                    If rating ≤ 3 OR negative comment
                                 ▼
                       Owner alert (PRIMARY: WhatsApp API or SMS;
                       SECONDARY: email backup)
```

### 6.2 Compliance rules (functional requirements)

| ID | Rule |
|----|------|
| COMP-1 | **Every** visitor sees the Google review CTA on the landing page without precondition |
| COMP-2 | Private feedback path does **not** remove or hide the Google CTA before or after submission |
| COMP-3 | No copy that discourages negative reviewers from using Google (“Let us fix this instead of reviewing”) |
| COMP-4 | No incentives (discounts, free items) tied to leaving a Google review |
| COMP-5 | Internal star rating is **never** used to decide whether Google CTA is shown |
| COMP-6 | Customer page includes brief note: feedback is anonymous; no account required |
| COMP-7 | Merchant onboarding includes verbal/written guidance: staff must not pressure customers to review while seated |
| COMP-8 | Sales and docs must state honestly: customers who tap Google may still post a public negative review; TrustTap does not block that |

### 6.3 Honest product limit (required messaging)

Because Google access is equal for all customers, **some people will tap Google and leave a bad public review**. That is allowed and expected under compliance.

TrustTap differentiates by:
1. Catching many issues via **private feedback** before/without a public post
2. **Phone-alerting** the owner on ≤3★ private feedback
3. Logging Google clicks + private feedback for Commiters/ops follow-up

Google Business Profile may already email/notify owners when a **public** review is posted. That is a Google feature — not a reason to skip TrustTap’s private phone alerts.

---

## 7. Functional Requirements

### 7.1 Business management (Commiters admin only)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ADM-1 | Admin can create a business with: name, URL slug, owner email, **owner WhatsApp (required for WA channel) or owner mobile for SMS**, Google review URL | Must |
| FR-ADM-2 | Admin can edit business details and deactivate a business (inactive businesses return friendly “not available” page) | Must |
| FR-ADM-3 | Admin can view list of all businesses and status (active/inactive) | Must |
| FR-ADM-4 | Admin can view feedback entries per business (read-only log) | Must |
| FR-ADM-5 | Admin access protected by environment secret or single shared password (not exposed to merchants) | Must |
| FR-ADM-6 | Admin can generate/download QR code image encoding the public URL | Should |

### 7.2 Customer landing page

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CUS-1 | Public URL format: `/r/{slug}` where slug is unique per business | Must |
| FR-CUS-2 | Page loads in &lt;2s on 4G mobile (target &lt;200ms TTFB on edge) | Must |
| FR-CUS-3 | Mobile-first responsive layout; usable on 320px width | Must |
| FR-CUS-4 | Display business name prominently | Must |
| FR-CUS-5 | Primary button: “Leave a Google Review” (or equivalent clear copy) | Must |
| FR-CUS-6 | Secondary link/button: “Send private feedback” | Must |
| FR-CUS-7 | Footer: “Powered by Commiters” with link to commiters.com | Must |
| FR-CUS-8 | Inactive or unknown slug returns HTTP 404 with neutral message | Must |
| FR-CUS-9 | Page available in English (Hindi optional — not Phase 1) | Must |

### 7.3 Google review action

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-GGL-1 | Clicking primary CTA opens `googleReviewUrl` in same tab or new tab (configurable; default new tab) | Must |
| FR-GGL-2 | System logs `clickedGoogle = true` with timestamp and business ID | Must |
| FR-GGL-3 | Google click logged even if customer also submits private feedback later in same session | Must |
| FR-GGL-4 | `googleReviewUrl` validated on admin save (must be HTTPS, must be Google Maps / Business review URL pattern) | Should |

### 7.4 Private feedback

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-FB-1 | Private feedback form collects: rating (1–5 stars, required), comment (optional, max 1000 chars) | Must |
| FR-FB-2 | No customer name, email, or phone fields | Must |
| FR-FB-3 | Honeypot field for bot detection (hidden from humans) | Must |
| FR-FB-4 | On submit: store feedback, show thank-you screen | Must |
| FR-FB-5 | Thank-you screen still displays Google review CTA | Must |
| FR-FB-6 | Prevent duplicate spam: rate limit per IP per business (see NFR) | Must |
| FR-FB-7 | Empty comment allowed; rating alone is valid submission | Must |

### 7.5 Owner alerts

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ALT-1 | Trigger alert when private feedback rating is ≤3 | Must |
| FR-ALT-2 | Trigger alert when rating is 4–5 but comment contains strong negative keywords (optional simple keyword list; fallback: rating-only trigger for ≤3) | Could |
| FR-ALT-3 | Alert includes: business name, rating, comment (if any), timestamp | Must |
| FR-ALT-4 | **Primary channel:** system sends an automated **WhatsApp template message** (Business API via Meta/Gupshup/Twilio or equivalent) **or** automated **SMS** to the owner’s phone within ~60 seconds | Must |
| FR-ALT-5 | **Secondary channel:** email alert sent to `ownerEmail` via Commiters SMTP (backup / archive). Email alone is **not** sufficient for Phase 1 done | Must |
| FR-ALT-6 | Do not send alert for Google-only clicks (no private feedback) | Must |
| FR-ALT-7 | Do not send duplicate alerts for same feedback ID (idempotent `alertSentAt`) | Must |
| FR-ALT-8 | If WhatsApp send fails, fall back to SMS (if configured) and always attempt email backup; feedback submission must still succeed | Must |
| FR-ALT-9 | **Forbidden:** human monitoring of admin dashboard to manually WhatsApp/SMS the owner | Must |

**Phase 1 alert delivery clarification**

| Channel | Role | Status |
|---------|------|--------|
| WhatsApp Business API **or** SMS | **Primary** — owner must feel a phone notification | Must (at least one) |
| Email (SMTP) | Secondary backup | Must |
| `wa.me` link inside email only | Insufficient as sole phone strategy | Rejected as primary |
| Manual staff relay | Ops anti-pattern | Forbidden |

**Provider choice (decide in implementation):** WhatsApp preferred for India UX; SMS acceptable as Phase 1 primary if WA template approval blocks launch. Both may be configured with WA primary + SMS fallback.

### 7.6 QR code

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-QR-1 | One QR per business pointing to `/r/{slug}` | Must |
| FR-QR-2 | QR downloadable as PNG (min 300×300px, error correction M or higher) | Should |
| FR-QR-3 | Physical print for pilot **must include merchant business name** on the board/card (not a generic vendor-only sticker) | Must |
| FR-QR-4 | Physical layout: one primary TrustTap QR; do not require Instagram/UPI codes inside the software product | Must |

---

## 8. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | Performance | Customer page LCP &lt;2.5s on mid-range Android |
| NFR-2 | Availability | 99% uptime during pilot (Vercel free/pro tier acceptable) |
| NFR-3 | Security | All admin routes behind authentication |
| NFR-4 | Security | Rate limit: max 10 feedback submissions per IP per business per hour |
| NFR-5 | Security | Rate limit: max 60 page views per IP per business per hour |
| NFR-6 | Security | Input sanitization on all text fields |
| NFR-7 | Privacy | No cookies beyond essential; no third-party trackers in Phase 1 |
| NFR-8 | Privacy | Privacy notice on customer page: anonymous feedback, data used to improve service |
| NFR-9 | Maintainability | Environment-based config (DB URL, admin secret, existing SMTP host/user/pass) |
| NFR-10 | Observability | Server logs for errors; no PII in logs |
| NFR-11 | Data | PostgreSQL with daily backups (provider-managed) |
| NFR-12 | Branding | Commiters logo/wordmark in footer only; customer page centers merchant brand |

---

## 9. Conceptual Data Model (Phase 1)

### 9.1 Entity: Business

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | Primary key |
| slug | String | Yes | Unique, URL-safe, e.g. `cafe-edelweiss` |
| name | String | Yes | Display name |
| ownerEmail | String | Yes | Email backup / archive alert recipient |
| ownerWhatsApp | String | Conditional | Required if WhatsApp is primary channel (E.164) |
| ownerSmsPhone | String | Conditional | Required if SMS is primary/fallback (E.164); may reuse WhatsApp number |
| googleReviewUrl | String | Yes | Full HTTPS Google review URL |
| isActive | Boolean | Yes | Default true |
| createdAt | DateTime | Yes | Auto |
| updatedAt | DateTime | Yes | Auto |

### 9.2 Entity: Feedback

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | Primary key |
| businessId | UUID | Yes | FK → Business |
| rating | Int | No | 1–5; null if customer only clicked Google |
| comment | String | No | Max 1000 chars |
| clickedGoogle | Boolean | Yes | Default false |
| locationLabel | String | No | Default `main`; reserved for Phase 3 multi-QR |
| alertSentAt | DateTime | No | Idempotent alert tracking |
| createdAt | DateTime | Yes | Auto |

### 9.3 Relationships

- Business 1 → many Feedback
- Deleting a business cascades delete to its feedback (admin action only)

### 9.4 Explicitly excluded from Phase 1 schema

- Passwords / merchant accounts
- Customer PII (name, phone)
- Consent fields (no PII collected)
- QrCode table (single slug per business is sufficient)

---

## 10. Technical Approach (High-Level)

| Component | Choice | Notes |
|-----------|--------|-------|
| Framework | Next.js 14+ (App Router) | SSR for fast mobile landing |
| Styling | Tailwind CSS | Mobile-first |
| ORM | Prisma | Migrations from day one |
| Database | PostgreSQL (Supabase or Neon) | Managed |
| Hosting | Vercel | Edge-friendly |
| Email | Existing Commiters SMTP | Secondary / backup alerts |
| Phone alerts | WhatsApp Business API and/or SMS gateway | **Primary** owner notification |
| QR generation | `qrcode` npm package or API | PNG export in admin |
| Bot protection | Honeypot + IP rate limit | Cloudflare Turnstile optional |

*Detailed technical specification is a separate document, created after BRD approval.*

---

## 11. User Stories & Acceptance Criteria

### Epic A — Customer experience

**US-A1:** As a customer, I want to scan a QR and immediately see how to leave a Google review, so I can share my experience quickly.

- **AC:** Landing page shows Google CTA above the fold on iPhone SE viewport without scrolling
- **AC:** Tapping Google CTA opens correct Google review URL for that business

**US-A2:** As a customer, I want to send private feedback without creating an account, so I can complain without friction.

- **AC:** Feedback form has only stars + optional comment
- **AC:** Submission completes in ≤3 taps after choosing private feedback path

**US-A3:** As a customer, I want assurance my feedback is anonymous.

- **AC:** Privacy note visible on landing and feedback form
- **AC:** No fields request personal information

### Epic B — Owner value

**US-B1:** As a café owner, I want to be notified on my phone when someone leaves low private feedback, so I can fix issues quickly.

- **AC:** Rating ≤3 triggers automated WhatsApp **or** SMS within ~60 seconds
- **AC:** Email backup is also sent
- **AC:** Alert contains rating, comment, time, business name
- **AC:** No human is required to watch a dashboard and relay the message

**US-B2:** As a café owner, I want every customer to have the same chance to review on Google.

- **AC:** QA test: 1-star and 5-star private feedback paths both show Google CTA on landing and thank-you screens

### Epic C — Commiters admin

**US-C1:** As Commiters admin, I want to onboard a new café in under 5 minutes.

- **AC:** Create business → get slug URL → download QR → hand to merchant

**US-C2:** As Commiters admin, I want to review all feedback for a pilot café.

- **AC:** Admin feedback log shows chronological entries with rating, comment, Google click flag, timestamp

### Epic D — Compliance

**US-D1:** As Commiters, we must not operate a review-gating funnel.

- **AC:** Code review confirms no conditional rendering of Google CTA based on rating
- **AC:** No branch logic: `if rating >= 4 then show Google`

---

## 12. Pilot Go-to-Market (Phase 1)

### 12.1 Target customers

- **Geography:** Udaipur, Rajasthan
- **Segment:** Independent cafés, small restaurants, and similar local shops that care about Google reputation (barbers OK if Google-focused)
- **Exclude for pilot:** Multi-link Instagram/UPI board replacements as the primary pitch

### 12.2 Offer / pitch

> “Free for 30 days. We install a QR with your shop name. Every customer can leave a Google review. If someone is unhappy, you get an automatic WhatsApp or SMS — not just an email you’ll miss. Google already notifies you *after* a public review; we alert you on private feedback so you can fix issues first.”

**Objection — “I already have a ₹1,500 board”:**  
> “That board sends people away. Ours also tells you who left unhappy privately, and we keep the link working after sale.”

**Objection — “Google already messages me when someone reviews”:**  
> “That’s Google notifying you after a public post. We notify you when someone shares private low feedback — often before anything is public.”

**Objection — “What if they still post a bad Google review?”:**  
> “We don’t block Google — that would be dishonest and risky. Some people will still post publicly. Our job is to catch more issues early and help you respond faster.”

### 12.3 Materials needed (non-software)

- Laminated QR card/board with **merchant business name** printed large
- One primary TrustTap QR (optional small secondary print icons for Instagram/UPI only if merchant insists — **not** in the app)
- 30-second verbal pitch card for founder
- One-page merchant compliance tip sheet (no staff pressure at table)
- Week-1 value WhatsApp summary template (scans / clicks / private feedback) — may be semi-manual for 3 pilots **without** becoming an alert-relay desk

### 12.4 Competitive positioning (Phase 1)

| Static print board | TrustTap |
|--------------------|----------|
| Cheap lifetime print | Free pilot → SaaS |
| Static Google (and maybe Instagram/UPI) | Google + private recovery |
| No support after sale | Onboarding + URL fixes |
| Relies on Google public-review notices | Automated phone alert on private ≤3★ |
| No data | Feedback + Google-click log |

### 12.4 Pilot targets

| Business | Status |
|----------|--------|
| JMB | Target |
| Cafe Edelweiss | Target |
| 3rd lakeside café (TBD) | Target |

### 12.5 Pilot success metrics

| Metric | Target |
|--------|--------|
| Active businesses | 3 |
| Total QR scans (all pilots) | ≥50 in 30 days |
| Private feedback submissions | ≥10 |
| Google clicks logged | ≥20 |
| Owner-reported value story | ≥1 |
| Critical bugs in production | 0 unresolved &gt;48hrs |

---

## 13. Timeline

| Day | Milestone |
|-----|-----------|
| **Day 1** | Project setup, DB schema, admin create-business flow |
| **Day 2** | Customer landing page, Google redirect + click logging |
| **Day 3** | Private feedback form, thank-you screen, honeypot + rate limits |
| **Day 4** | Automated WhatsApp/SMS alerts + email backup, admin feedback log, QR PNG export |
| **Day 5** | Phone-alert E2E on real devices; compliance pass |
| **Day 6–7** | Buffer / WA template approval / SMS provider if needed |
| **Day 8+** | Deploy + seed 3 pilots + print named QR boards |
| **Day 5** | Production deploy, seed 3 pilot businesses, print QRs, walk-in outreach begins |
| **Day 6–35** | 30-day pilot monitoring, weekly check-in with each merchant |

---

## 14. Risks & Mitigations (Phase 1)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Merchants don’t display QR | Medium | High | Physical install visit; table tent placement |
| Low scan volume | Medium | Medium | Staff aware QR exists; receipt sticker backup |
| Owner ignores email alerts | High | High | Phone channel is primary; email is backup only |
| Manual WhatsApp relay ops | High | High | **Forbidden** — automate WA/SMS; no dashboard babysitting |
| Static ₹1,500 board competition | Medium | Medium | Sell recovery + phone alerts + support; free pilot then SaaS |
| Public bad Google review after CTA | Medium | Medium | Honest sales script; response playbook |
| WhatsApp template approval delay | Medium | High | Ship SMS as primary or fallback |
| Spam feedback | Low | Medium | Rate limits + honeypot |
| Google URL misconfigured | Medium | High | Validate URL on admin save; test click before print |
| Scope creep (dashboard, auth) | High | High | This BRD is the scope contract |

---

## 15. Resolved Decisions

| # | Question | Decision | Date |
|---|----------|----------|------|
| OQ-1 | Production domain | **`trusttap.commiters.com`** — subdomain on existing `commiters.com` infrastructure; no new domain purchase or separate hosting | 2026-07-20 |
| OQ-2 | Email provider | **Existing Commiters SMTP** (backup alerts only) | 2026-07-20 |
| OQ-ALERT-1 | Primary phone channel | **WhatsApp Business API preferred; SMS acceptable as Phase 1 primary/fallback** | 2026-07-26 |
| OQ-ALERT-2 | Manual alert relay | **Rejected** — no dedicated staff watching dashboard | 2026-07-26 |
| OQ-3 | Admin approach | **Minimal `/admin` page** (env-protected; not Prisma Studio in production) | 2026-07-20 |
| OQ-4 | Google CTA opens new tab or same tab? | New tab (recommended default — confirm at build) | Pending |
| OQ-5 | Alert on 4-star with negative comment in v1? | ≤3 stars only (recommended default — confirm at build) | Pending |

### Infrastructure note (no extra cost)

`trusttap.commiters.com` is a **DNS subdomain** of `commiters.com`. It does not require buying a new domain. Typical setup on existing resources:

1. Deploy the Next.js app to the **same Vercel project** (or existing host) as Commiters, or a new Vercel project on the **free/hobby tier** linked to the same account.
2. In Vercel → Project → Domains → add `trusttap.commiters.com`.
3. In your DNS provider (where `commiters.com` is managed) → add a **CNAME** record: `trusttap` → `cname.vercel-dns.com` (or the target Vercel provides).
4. No additional domain registration fee; SSL is automatic via Vercel.

SMTP remains for **backup** email. Phase 1 also requires WhatsApp API and/or SMS gateway credentials in environment variables.

---

## 16. Sign-Off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product owner | | | ☐ |
| Developer | | | ☐ |

---

## 17. Appendix A — Sample Copy

### Landing page

- **Headline:** How was your experience at {Business Name}?
- **Primary CTA:** Leave a Google Review
- **Secondary CTA:** Send us private feedback
- **Privacy note:** Your feedback is anonymous. No login required.

### Thank you (after private feedback)

- **Headline:** Thank you for your feedback
- **Body:** We appreciate you taking the time to help us improve.
- **CTA (still shown):** Share your experience on Google

### Alert email subject

`⚠️ Low feedback — {Business Name} — {rating}/5`

### Alert email body

```
New private feedback received

Business: {Business Name}
Rating: {rating}/5
Comment: {comment or "No comment"}
Time: {timestamp}

---
Powered by Commiters FeedbackFlow
```

---

## 18. Appendix B — Google Review URL Format

Valid `googleReviewUrl` examples:

- `https://search.google.com/local/writereview?placeid=ChIJ...`
- `https://g.page/r/XXXXX/review`

Admin should paste the URL from Google Business Profile → “Get more reviews” → “Share review form.”

---

*This document defines Phase 1 scope. Any feature not listed in Section 5.1 requires a change request and roadmap update before implementation.*
