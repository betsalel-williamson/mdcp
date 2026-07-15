#!/usr/bin/env sh
# Wrapper to run mdcp check
# Usage: ./check.sh [docs-root] [config-path]
DOCS_ROOT=${1:-docs}
CONFIG=${2:-docs/mdcp.config.json}
npx @bwilliamson/mdcp-cli check --config "$CONFIG" --docs-root "$DOCS_ROOT"
