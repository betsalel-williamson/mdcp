#!/usr/bin/env sh
# Format shards via mdcp fix (Prettier / markdownlint auto-fix).
# Depends on: Node.js 24+, npx, @bwilliamson/mdcp-cli, peer formatters
# See: references/cli-and-scripts.md
# Usage: ./fix.sh [docs-root] [config-path]
set -eu
if ! command -v npx >/dev/null 2>&1; then
  echo "mdcp fix.sh: npx not found. Install Node.js 24+ (includes npx)." >&2
  exit 127
fi
DOCS_ROOT=${1:-docs}
CONFIG=${2:-docs/mdcp.config.json}
npx @bwilliamson/mdcp-cli fix --config "$CONFIG" --docs-root "$DOCS_ROOT"
