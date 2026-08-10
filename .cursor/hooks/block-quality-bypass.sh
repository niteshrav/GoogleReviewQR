#!/usr/bin/env bash
# Block common ways to bypass TrustTap quality gates from the agent shell.
set -euo pipefail

input=$(cat)
command=$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("command") or "")' 2>/dev/null || true)

deny() {
  local msg="$1"
  python3 -c 'import json,sys; print(json.dumps({"permission":"deny","user_message":sys.argv[1],"agent_message":sys.argv[1]}))' "$msg"
  exit 0
}

allow() {
  echo '{ "permission": "allow" }'
  exit 0
}

if [[ -z "$command" ]]; then
  allow
fi

# Skip hooks / verify bypass
if [[ "$command" =~ --no-verify|--no-gpg-sign ]]; then
  deny "Blocked: TrustTap quality gates forbid --no-verify / hook bypass. Run tests and commit/push normally."
fi

# Force push to main/master
if [[ "$command" =~ git[[:space:]]+push && "$command" =~ (--force| -f |--force-with-lease) && "$command" =~ (main|master) ]]; then
  deny "Blocked: force-push to main/master is forbidden. Use a PR; CI must stay green."
fi

# Delete or rewrite protected branch tip casually
if [[ "$command" =~ git[[:space:]]+push && "$command" =~ :main|:master ]]; then
  deny "Blocked: deleting remote main/master via push is forbidden."
fi

allow
