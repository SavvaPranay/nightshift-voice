#!/usr/bin/env bash
# Push every var from .env.local into Vercel, then redeploy.
# Run from app/:   bash scripts/push-env.sh
set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .env.local ] || { echo "no .env.local here"; exit 1; }

vercel whoami >/dev/null 2>&1 || { echo "run 'vercel login' first"; exit 1; }
vercel link --yes >/dev/null 2>&1 || true

while IFS= read -r line; do
  [ -z "$line" ] && continue
  case "$line" in \#*) continue ;; esac
  name="${line%%=*}"
  value="${line#*=}"
  [ -z "$value" ] && { echo "  skip $name (empty)"; continue; }
  for env in production preview development; do
    vercel env rm "$name" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | vercel env add "$name" "$env" >/dev/null 2>&1 \
      && echo "  set $name ($env)" || echo "  FAILED $name ($env)"
  done
done < .env.local

echo
echo "redeploying..."
vercel --prod --yes
