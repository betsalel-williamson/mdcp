#!/usr/bin/env sh
# Build compiled docs from Markdown shards (mdcp compile).
# Depends on: Node.js 24+, npx, @bwilliamson/mdcp-cli
# See: references/cli-and-scripts.md
# Usage: ./compile.sh [docs-root] [config-path]
set -eu
if ! command -v npx >/dev/null 2>&1; then
  echo "mdcp compile.sh: npx not found. Install Node.js 24+ (includes npx)." >&2
  exit 127
fi
DOCS_ROOT=${1:-docs}
CONFIG=${2:-docs/mdcp.config.json}
npx @bwilliamson/mdcp-cli compile --config "$CONFIG" --docs-root "$DOCS_ROOT"
