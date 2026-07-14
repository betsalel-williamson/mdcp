#!/usr/bin/env sh
# Wrapper to run mdcp prose (vale)
# Usage: ./prose.sh [docs-root] [config-path]
DOCS_ROOT=${1:-docs}
CONFIG=${2:-docs/mdcp.config.json}
npx @bwilliamson/mdcp-cli prose --config "$CONFIG" --docs-root "$DOCS_ROOT" --require-vale
