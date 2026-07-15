#!/usr/bin/env sh
# Install optional lint peers (prettier, markdownlint-cli2, mdcp-presets).
# Vale must be installed separately on PATH — see references/cli-and-scripts.md
# Usage: ./setup-linters.sh
set -eu
echo "Installing npm peer dependencies (markdownlint-cli2, prettier, @bwilliamson/mdcp-presets)..."
npm install -D prettier markdownlint-cli2 @bwilliamson/mdcp-presets

echo ""
echo "Note: Vale must be installed separately on your system."
echo "See https://vale.sh/docs/vale-cli/installation/ for instructions."
echo "Once installed, create a .vale.ini and run 'vale sync'."
echo "Command meanings (compile / check / refs): references/cli-and-scripts.md"
