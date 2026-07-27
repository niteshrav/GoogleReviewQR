# Phase 1 Beta — 30-Day Pilot Ops Checklist

**Starts after:** production deploy smoke checklist in [PHASE_1_DEPLOY.md](./PHASE_1_DEPLOY.md) is green.  
**Product:** Commiters TrustTap  
**Last updated:** July 26, 2026  
**Not a build phase** — operational validation after deploy.

## Week 1 — Install

- [ ] Print laminated QRs for 3 shops with **business name** on each board
- [ ] One primary TrustTap QR per board (do not rely on Instagram/UPI as the product)
- [ ] Install at visible scan points (counter / exit)
- [ ] Verify each `/r/{slug}` loads on mobile data
- [ ] Confirm admin can see Google click rows after a test scan
- [ ] Walk owner through honest expectation: Google CTA can still lead to public negative reviews

## Week 2 — Alerts (phone-first)

- [ ] Submit one intentional ≤3 rating per shop (with owner consent)
- [ ] Confirm **WhatsApp or SMS** arrives on owner phone within ~60s
- [ ] Confirm email backup also arrives
- [ ] Confirm **no** Commiters staff is manually relaying alerts from the dashboard
- [ ] Fix provider/template/SMS issues if delivery fails
- [ ] Explain vs Google: GBP may notify after a *public* review; TrustTap notifies on *private* low feedback

## Week 3 — Stories & competition

- [ ] Collect owner feedback on usefulness vs any static ₹1,500 QR board they already have
- [ ] Document ≥1 “caught issue” story (private feedback that may not have been a public review)
- [ ] Note UX friction from customers (scan → Google / private feedback)
- [ ] Optional: send a simple Week-1/2 scan+feedback summary on WhatsApp (batch summary OK; not a live alert desk)

## Week 4 — Metrics review

| Metric | Target | Actual |
|--------|--------|--------|
| Active businesses | 3 | |
| Total scans (30 days) | ≥ 50 | |
| Private feedback submissions | ≥ 10 | |
| Google clicks logged | ≥ 20 | |
| Phone alerts verified | ≥ 1 per shop | |
| Owner value story | ≥ 1 | |
| Critical unresolved bugs | 0 | |

## Exit criteria for Phase 1 Beta → Phase 2 planning

- [ ] Metrics table filled
- [ ] Phone-alert path proven with real owners
- [ ] No critical unresolved bugs
- [ ] Product owner sign-off on BRD
