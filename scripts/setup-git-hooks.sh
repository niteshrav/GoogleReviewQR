#!/usr/bin/env bash
# Point this clone at repo-managed git hooks (pre-push unit gate).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

git config core.hooksPath .githooks
chmod +x .githooks/pre-push .cursor/hooks/block-quality-bypass.sh scripts/enable-branch-protection.sh 2>/dev/null || true

echo "Git hooksPath set to .githooks (pre-push will run npm run test:unit)."
echo "Cursor quality-bypass hook: .cursor/hooks/block-quality-bypass.sh"
