#!/usr/bin/env bash
# Lint, format-check, and link-check sharded markdown guides (standard npm toolchain).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required (Node.js 18+)." >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "→ npm install"
  npm install
fi

echo "→ compile.sh (fresh guides.md for link + fragment checks)"
./compile.sh

echo "→ npm run validate"
npm run validate

if command -v vale >/dev/null 2>&1; then
  echo "→ vale:sync"
  npm run vale:sync
  echo "→ vale (suggestions allowed)"
  npm run vale
  echo "→ vale:strict (custom vocabulary errors only)"
  npm run vale:strict
else
  echo "→ vale skipped (install: https://vale.sh/docs/vale-cli/installation/)"
fi
