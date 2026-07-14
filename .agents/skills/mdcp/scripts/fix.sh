#!/usr/bin/env sh
# Wrapper to run mdcp fix (prettier and markdownlint-cli2)
# Usage: ./fix.sh [docs-root] [config-path]
DOCS_ROOT=${1:-docs}
CONFIG=${2:-docs/mdcp.config.json}
npx @bwilliamson/mdcp-cli fix --config "$CONFIG" --docs-root "$DOCS_ROOT"
