#!/usr/bin/env sh
# Wrapper to run mdcp compile
# Usage: ./compile.sh [docs-root] [config-path]
DOCS_ROOT=${1:-docs}
CONFIG=${2:-docs/mdcp.config.json}
npx @bwilliamson/mdcp-cli compile --config "$CONFIG" --docs-root "$DOCS_ROOT"
