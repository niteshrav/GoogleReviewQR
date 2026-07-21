# Phase 1 Beta — 30-Day Pilot Ops Checklist

**Starts after:** production deploy smoke checklist in [PHASE_1_DEPLOY.md](./PHASE_1_DEPLOY.md) is green.  
**Not a build phase** — operational validation.

## Week 1 — Install

- [ ] Print laminated QRs for 3 cafés
- [ ] Install at visible scan points (counter / exit)
- [ ] Verify each `/r/{slug}` loads on mobile data (not only Wi‑Fi)
- [ ] Confirm admin can see Google click rows after a test scan

## Week 2 — Alerts

- [ ] Walk owners through low-rating email content
- [ ] Submit one intentional ≤3 rating per café (with owner consent)
- [ ] Confirm SMTP delivery; fix bounce / spam issues
- [ ] Confirm optional WhatsApp deep-link opens correctly when configured

## Week 3 — Stories

- [ ] Collect owner feedback on usefulness
- [ ] Document ≥1 “caught issue” story (private feedback that would not have been a public review)
- [ ] Note any UX friction from customers (scan → Google / private feedback)

## Week 4 — Metrics review

| Metric | Target | Actual |
|--------|--------|--------|
| Active businesses | 3 | |
| Total scans (30 days) | ≥ 50 | |
| Private feedback submissions | ≥ 10 | |
| Google clicks logged | ≥ 20 | |
| Owner value story | ≥ 1 | |
| Critical unresolved bugs | 0 | |

## Exit criteria for Phase 1 Beta → Phase 2 planning

- [ ] Metrics table filled
- [ ] No critical unresolved bugs
- [ ] Product owner sign-off on BRD Section 16
