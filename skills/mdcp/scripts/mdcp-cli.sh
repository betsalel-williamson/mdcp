#!/usr/bin/env sh
# Wrapper to run the MDCP CLI
# This script ensures the agent can execute MDCP commands without needing to know the exact npx package name
npx @bwilliamson/mdcp-cli "$@"
