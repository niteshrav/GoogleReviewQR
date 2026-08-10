#!/usr/bin/env bash
# Enable branch protection on main so TrustTap CI must pass before merge.
# Requires: gh auth login (repo admin)
set -euo pipefail

REPO="${1:-niteshrav/GoogleReviewQR}"
BRANCH="${2:-main}"

echo "Protecting ${REPO}@${BRANCH} (PR + CI status checks; no admin bypass)…"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "repos/${REPO}/branches/${BRANCH}/protection" \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Unit & route tests (Vitest)",
      "E2E (Playwright)"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF

echo "Done. Confirm in GitHub → Settings → Branches."
echo "Required checks: Unit & route tests (Vitest), E2E (Playwright)."
