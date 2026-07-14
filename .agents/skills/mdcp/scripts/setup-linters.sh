#!/usr/bin/env sh
# Wrapper to setup and install optional linters (markdownlint, prettier, vale)
# Usage: ./setup-linters.sh
echo "Installing npm peer dependencies (markdownlint-cli2, prettier, @bwilliamson/mdcp-presets)..."
npm install -D prettier markdownlint-cli2 @bwilliamson/mdcp-presets

echo ""
echo "Note: Vale must be installed separately on your system."
echo "See https://vale.sh/docs/vale-cli/installation/ for instructions."
echo "Once installed, create a .vale.ini and run 'vale sync'."
