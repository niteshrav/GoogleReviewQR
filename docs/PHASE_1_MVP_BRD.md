# Phase 1 MVP — Business Requirements Document

**Product:** Commiters FeedbackFlow  
**Phase:** 1 — Pilot MVP  
**Document version:** 1.0  
**Last updated:** July 20, 2026  
**Author:** Commiters  
**Parent document:** [PHASED_ROADMAP.md](./PHASED_ROADMAP.md)

---

## 1. Executive Summary

Phase 1 delivers a **production-ready, Google-compliant QR feedback experience** for a small number of Udaipur cafés and restaurants. Commiters manually onboards each merchant. Customers scan a QR code, can leave a Google review in one tap, and optionally submit private feedback. Business owners receive instant alerts when feedback indicates a poor experience.

This phase validates **product-market fit and compliance** before investing in self-serve auth, dashboards, payments, or WhatsApp API integration.

**Build target:** ~5 development days  
**Beta target:** 3 active businesses for 30 days  
**Revenue:** None (free pilot)

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
- **Phase 1 expectation:** Commiters installs everything; Raj gets WhatsApp or email when someone is unhappy

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
- Alert channels: **email** and/or **`wa.me` click-to-chat** pre-filled message
- Hidden Commiters admin: create, edit, deactivate businesses
- Rate limiting and bot protection on public write endpoints
- “Powered by Commiters” footer on customer pages
- Production deployment (Vercel + managed PostgreSQL)
- Basic privacy notice on customer page (anonymous feedback, no PII collected)

### 5.2 Out of scope

| Item | Deferred to |
|------|-------------|
| Merchant self-registration | Phase 3 |
| Merchant login / password reset | Phase 3 |
| Customer name or phone collection | Phase 3 (with consent) |
| Merchant dashboard UI | Phase 2 (minimal) / Phase 3 |
| Payment / subscriptions | Phase 2 (manual) / Phase 3 (in-app) |
| WhatsApp Business API (Twilio/Gupshup) | Phase 4 |
| Multiple QR codes per business | Phase 3 |
| AI sentiment analysis | Phase 4 |
| Analytics charts | Phase 4 |
| Weekly automated reports | Phase 2 |
| Acrylic QR stands | Post-validation |
| Mobile native app | Never (web-only product) |
| Incentives tied to Google reviews | Never (policy violation) |
| Star-based routing to Google | Never (policy violation) |

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
                       Owner alert (email / wa.me)
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

---

## 7. Functional Requirements

### 7.1 Business management (Commiters admin only)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ADM-1 | Admin can create a business with: name, URL slug, owner email, optional owner WhatsApp number, Google review URL | Must |
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
| FR-CUS-7 | Footer: “Powered by Commiters” with link to commiters.in | Must |
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
| FR-ALT-4 | Email alert sent to `ownerEmail` if configured | Must |
| FR-ALT-5 | If `ownerWhatsApp` set: generate `wa.me/{number}?text={encoded message}` link and email it to admin OR use mailto fallback — **Phase 1 does not require server-side WhatsApp API send**; alert delivery via email is sufficient, with optional manual wa.me link in email body for owner to tap | Must |
| FR-ALT-6 | Do not send alert for Google-only clicks (no private feedback) | Must |
| FR-ALT-7 | Do not send duplicate alerts for same feedback ID | Must |

**Phase 1 alert delivery clarification:** Minimum viable = **email to owner**. Email body may include a `wa.me` link the owner taps to forward/share. Automated WhatsApp API send is Phase 4.

### 7.6 QR code

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-QR-1 | One QR per business pointing to `/r/{slug}` | Must |
| FR-QR-2 | QR downloadable as PNG (min 300×300px, error correction M or higher) | Should |
| FR-QR-3 | Printable layout not required in app — Commiters prints laminated A4 manually for pilot | — |

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
| ownerEmail | String | Yes | Alert recipient |
| ownerWhatsApp | String | No | E.164 format, for wa.me links in alerts |
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
| Email | Existing Commiters SMTP | Transactional alerts via env-configured SMTP |
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

**US-B1:** As a café owner, I want to be notified when someone leaves low private feedback, so I can fix issues quickly.

- **AC:** Rating ≤3 triggers email within 60 seconds
- **AC:** Email contains rating, comment, time, business name

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
- **Segment:** Independent cafés and small restaurants (≤30 tables)
- **Exclude for pilot:** Salons, gyms, coaching (Phase 2+ niches)

### 12.2 Offer

> “Free for 30 days. We install a QR on your table. When a customer is unhappy, you get an instant WhatsApp/email alert. Every customer can still review you on Google — we just make it easier.”

### 12.3 Materials needed (non-software)

- Laminated A4 QR print (Commiters prints locally, &lt;₹50/stand)
- 30-second verbal pitch card for founder
- One-page merchant compliance tip sheet (no staff pressure at table)

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
| **Day 4** | Email alerts, admin feedback log, QR PNG export |
| **Day 5** | Production deploy, seed 3 pilot businesses, print QRs, walk-in outreach begins |
| **Day 6–35** | 30-day pilot monitoring, weekly check-in with each merchant |

---

## 14. Risks & Mitigations (Phase 1)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Merchants don’t display QR | Medium | High | Physical install visit; table tent placement |
| Low scan volume | Medium | Medium | Staff aware QR exists; receipt sticker backup |
| Owner ignores email alerts | Medium | Medium | Follow up in person; add WhatsApp number for wa.me in email |
| Spam feedback | Low | Medium | Rate limits + honeypot |
| Google URL misconfigured | Medium | High | Validate URL on admin save; test click before print |
| Scope creep (dashboard, auth) | High | High | This BRD is the scope contract |

---

## 15. Resolved Decisions

| # | Question | Decision | Date |
|---|----------|----------|------|
| OQ-1 | Production domain | **`feedbackflow.commiters.in`** — subdomain on existing `commiters.in` infrastructure; no new domain purchase or separate hosting | 2026-07-20 |
| OQ-2 | Email provider | **Existing Commiters SMTP** (no Resend or new email service) | 2026-07-20 |
| OQ-3 | Admin approach | **Minimal `/admin` page** (env-protected; not Prisma Studio in production) | 2026-07-20 |
| OQ-4 | Google CTA opens new tab or same tab? | New tab (recommended default — confirm at build) | Pending |
| OQ-5 | Alert on 4-star with negative comment in v1? | ≤3 stars only (recommended default — confirm at build) | Pending |

### Infrastructure note (no extra cost)

`feedbackflow.commiters.in` is a **DNS subdomain** of `commiters.in`. It does not require buying a new domain. Typical setup on existing resources:

1. Deploy the Next.js app to the **same Vercel project** (or existing host) as Commiters, or a new Vercel project on the **free/hobby tier** linked to the same account.
2. In Vercel → Project → Domains → add `feedbackflow.commiters.in`.
3. In your DNS provider (where `commiters.in` is managed) → add a **CNAME** record: `feedbackflow` → `cname.vercel-dns.com` (or the target Vercel provides).
4. No additional domain registration fee; SSL is automatic via Vercel.

SMTP uses existing Commiters mail credentials via environment variables — no new email subscription.

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
