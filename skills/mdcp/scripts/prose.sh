#!/usr/bin/env sh
# Vale prose lint via mdcp prose.
# Depends on: Node.js 24+, npx, @bwilliamson/mdcp-cli, vale on PATH
# See: references/cli-and-scripts.md
# Usage: ./prose.sh [docs-root] [config-path]
set -eu
if ! command -v npx >/dev/null 2>&1; then
  echo "mdcp prose.sh: npx not found. Install Node.js 24+ (includes npx)." >&2
  exit 127
fi
DOCS_ROOT=${1:-docs}
CONFIG=${2:-docs/mdcp.config.json}
npx @bwilliamson/mdcp-cli prose --config "$CONFIG" --docs-root "$DOCS_ROOT" --require-vale
