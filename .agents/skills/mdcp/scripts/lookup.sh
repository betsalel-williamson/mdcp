#!/usr/bin/env sh
# Wrapper to run mdcp refs lookup
# Usage: ./lookup.sh "search term" [docs-root] [config-path]
TERM=$1
DOCS_ROOT=${2:-docs}
CONFIG=${3:-docs/mdcp.config.json}
npx @bwilliamson/mdcp-cli refs lookup "$TERM" --format json --config "$CONFIG" --docs-root "$DOCS_ROOT"
