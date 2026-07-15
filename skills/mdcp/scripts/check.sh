#!/usr/bin/env sh
# Validate the documentation tree (mdcp check): links, structure, optional lint.
# Depends on: Node.js 24+, npx, @bwilliamson/mdcp-cli
# See: references/cli-and-scripts.md
# Usage: ./check.sh [docs-root] [config-path]
set -eu
if ! command -v npx >/dev/null 2>&1; then
  echo "mdcp check.sh: npx not found. Install Node.js 24+ (includes npx)." >&2
  exit 127
fi
DOCS_ROOT=${1:-docs}
CONFIG=${2:-docs/mdcp.config.json}
npx @bwilliamson/mdcp-cli check --config "$CONFIG" --docs-root "$DOCS_ROOT"
