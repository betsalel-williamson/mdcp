#!/usr/bin/env sh
# Pass-through to @bwilliamson/mdcp-cli (build, validate, refs, lint, prose, …).
# Depends on: Node.js 24+, npx, @bwilliamson/mdcp-cli
# See: references/cli-and-scripts.md
set -eu
if ! command -v npx >/dev/null 2>&1; then
  echo "mdcp-cli.sh: npx not found. Install Node.js 24+ (includes npx)." >&2
  exit 127
fi
npx @bwilliamson/mdcp-cli "$@"
