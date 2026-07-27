# Phase 1 MVP — User Stories (No Code)

**Product:** Commiters TrustTap  
**Phase:** 1 — Pilot MVP  
**Version:** 1.1  
**Last updated:** 2026-07-26  

---

## Epic A — Customer landing page & Google review flow

### US-A1: Customer sees Google CTA on landing (above the fold)
**As a** customer  
**I want** to scan a QR and immediately see a “Leave a Google Review” CTA  
**So that** I can share my experience quickly.  

**Acceptance criteria**
1. Landing page for `/r/[slug]` displays the Google CTA on mobile without requiring scrolling.
2. Google CTA is shown for every visitor regardless of any prior feedback state.

### US-A2: Customer clicks Google CTA and is taken to the correct URL
**As a** customer  
**I want** the Google CTA to open the configured `googleReviewUrl` for that business  
**So that** my review goes to the right place.  

**Acceptance criteria**
1. CTA opens the configured `googleReviewUrl`.
2. The system logs the click event associated with the business.

### US-A3: Customer returns or later uses private feedback
**As a** customer  
**I want** to submit private feedback even after clicking Google  
**So that** I can share details.  

**Acceptance criteria**
1. Submitting private feedback after Google click succeeds.
2. Logged events correctly reflect both the Google click and feedback submission.

### US-A4: Inactive/unknown slugs fail gracefully
**As a** customer  
**I want** a neutral error if the QR is invalid  
**So that** I am not shown confusing errors.  

**Acceptance criteria**
1. Unknown slug returns HTTP 404 with a user-friendly message.
2. Inactive business slugs also return the neutral 404.

---

## Epic B — Private feedback collection (anonymous)

### US-B1: Customer opens private feedback form
**As a** customer  
**I want** to tap “Send private feedback”  
**So that** I can complain or share improvement suggestions.  

**Acceptance criteria**
1. Secondary action is visible on landing.
2. Clicking secondary action navigates to the private feedback form within the same page/app flow.

### US-B2: Private feedback submission collects rating + optional comment
**As a** customer  
**I want** to submit a rating and optional comment  
**So that** the owner can understand what went wrong.  

**Acceptance criteria**
1. Rating is required and must be 1–5.
2. Comment is optional and limited to the configured max length (Phase 1: 1000 chars).
3. No customer name/phone/email fields exist in the Phase 1 form.

### US-B3: Honeypot blocks bots
**As a** site operator  
**I want** bot submissions to be rejected  
**So that** feedback logs are not polluted.  

**Acceptance criteria**
1. Honeypot field exists in the form but is hidden from normal users.
2. If the honeypot is filled, the submission is rejected.

### US-B4: Submission succeeds and shows a thank-you page
**As a** customer  
**I want** confirmation after submitting feedback  
**So that** I know my response was received.  

**Acceptance criteria**
1. After submission, customer sees a thank-you screen.
2. Thank-you screen includes the Google CTA (still visible).

### US-B5: Rate limiting prevents spam bursts
**As a** site operator  
**I want** to limit feedback spam per IP/business  
**So that** abuse is contained.  

**Acceptance criteria**
1. Feedback endpoint enforces the configured max submissions per IP per business per time window.
2. When limit is hit, the customer sees a friendly error and no feedback is stored.

---

## Epic C — Owner alerts (phone-first, automated)

### US-C1: Owner is alerted on low ratings via phone
**As a** merchant owner  
**I want** an automatic WhatsApp or SMS when a customer leaves low private feedback  
**So that** I notice it even if I never open email.  

**Acceptance criteria**
1. When a feedback submission has rating <= 3, the system sends an automated WhatsApp **or** SMS to the configured owner phone.
2. Delivery target: ~60 seconds in pilot.
3. Message includes business name, rating, comment (or “No comment”), and timestamp.
4. An email backup is also sent to `ownerEmail`.
5. No Commiters staff member is required to watch the admin UI and relay the message.

### US-C2: No alert on Google-only clicks
**As a** merchant owner  
**I want** alerts only when there is private feedback  
**So that** I don’t receive noise.  

**Acceptance criteria**
1. Clicking Google CTA without submitting private feedback does not send WhatsApp, SMS, or email alerts.

### US-C3: Channel failover is automatic
**As a** merchant owner  
**I want** reliable delivery  
**So that** a single provider outage doesn’t silence alerts.  

**Acceptance criteria**
1. If WhatsApp is primary and send fails, SMS fallback is attempted when configured.
2. Email backup is always attempted for ≤3★ private feedback.
3. Feedback is still saved if all alert channels fail (error logged; `alertSentAt` only set when at least one phone or email channel succeeds — product decision: prefer marking sent when primary phone channel succeeds).

### US-C4: Alerts are idempotent per feedback submission
**As a** merchant owner  
**I want** to avoid duplicate alert spam  
**So that** I don’t get repeated pings for one submission.  

**Acceptance criteria**
1. The system does not send more than one primary phone alert per feedback record.
2. Retries do not create duplicate owner-facing alerts for the same feedback ID.

### US-C5: Honest expectation about public Google reviews
**As a** merchant owner  
**I want** clear expectations  
**So that** I don’t think TrustTap blocks bad Google reviews.  

**Acceptance criteria**
1. Onboarding / pitch materials state that customers who tap Google may still post publicly (positive or negative).
2. Product does not add gating to prevent that.

---

## Epic D — Commiters minimal admin (manual onboarding)

### US-D1: Admin can create a business
**As a** Commiters admin  
**I want** to create a business with a slug and Google URL  
**So that** I can generate a QR for the merchant.  

**Acceptance criteria**
1. Admin provides: business name, slug, owner email, owner WhatsApp and/or SMS phone, and `googleReviewUrl`.
2. `slug` must be unique.
3. `googleReviewUrl` must be validated on save (at minimum: HTTPS + Google review URL pattern).
4. At least one phone alert destination (WhatsApp or SMS number) is required for pilot businesses.

### US-D2: Admin can edit business details
**As a** Commiters admin  
**I want** to update the Google review URL and owner contact  
**So that** alerts go to the correct place.  

**Acceptance criteria**
1. Admin updates persist successfully.
2. Customers scanning the QR immediately use the latest data after deploy/reload.

### US-D3: Admin can deactivate businesses
**As a** Commiters admin  
**I want** to deactivate a business  
**So that** old QR codes stop working without breaking the site.  

**Acceptance criteria**
1. Deactivated businesses return a neutral 404.
2. Existing feedback records remain visible in admin for audit (Phase 1 behavior defined as read-only).

### US-D4: Admin can view feedback logs
**As a** Commiters admin  
**I want** to see feedback per business  
**So that** I can provide support to merchants.  

**Acceptance criteria**
1. Feedback list is available per business.
2. Each entry displays rating, comment (if any), timestamp, and click-related flags (if logged).

### US-D5: Admin can generate QR PNG
**As a** Commiters admin  
**I want** a downloadable QR code for the business URL  
**So that** I can print laminated A4 stands for the pilot.  

**Acceptance criteria**
1. Admin can download a QR PNG encoding `/r/[slug]`.
2. QR code quality is sufficient for scanning on paper after lamination.

---

## Epic E — Compliance & anti-gating verification

### US-E1: Google CTA is never conditional on rating
**As a** compliance reviewer  
**I want** the system to show Google CTA for all users  
**So that** the product does not operate review gating.  

**Acceptance criteria**
1. UI does not hide/replace the Google CTA based on submitted rating.
2. There is no logic equivalent to “if rating is low, don’t show Google”.

### US-E2: No discouraging language is used
**As a** compliance reviewer  
**I want** customer copy to remain neutral  
**So that** the product does not discourage negative reviewers from leaving Google reviews.  

**Acceptance criteria**
1. Landing and feedback screens do not include “instead of leaving a review” or “we will fix this for you instead” style copy.
2. Primary CTA copy continues to encourage Google review equally.

---

## Epic F — Performance & reliability (pilot-level targets)

### US-F1: Customer page loads quickly on mobile
**As a** customer  
**I want** fast page load  
**So that** I can act immediately after scanning.  

**Acceptance criteria**
1. Customer landing page TTFB is consistently low on mobile networks (target: <200ms edge; <2.5s for page load).

### US-F2: Error states do not expose stack traces
**As a** customer  
**I want** clean error handling  
**So that** I trust the system.  

**Acceptance criteria**
1. Failures return user-friendly messages.
2. Stack traces are not rendered to end users.

---

## Notes / Clarifications
- Phase 1 **primary** alert channel is automated **WhatsApp Business API or SMS**. Email is **backup only**.
- Manual staff relay of alerts is **out of scope / forbidden**.
- Physical QR for pilots must include the **merchant business name**.
- Instagram/UPI multi-QR boards are **not** Phase 1 product scope.
- Phase 1 avoids customer PII to reduce compliance surface and friction.

