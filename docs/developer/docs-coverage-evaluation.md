# Docs coverage evaluation (dogfood)

This repository dogfoods [docs coverage evaluation](../features/doc-coverage-evaluation.md) as a portable automation contract. Hosts call the CLI; they do not re-encode guide taxonomy in prompts.

## Rollout sequence (this repo)

1. **Advisory** — run `mdcp evaluate-doc-coverage --git --mode advisory` on PRs (or locally) and inspect JSON. Do not block merges yet.
2. **Tune** — adjust ignore patterns and path heuristics if false positives appear for this monorepo layout.
3. **Gate** — switch automations to `--mode gate` so `missing_docs` and `needs_clarification` fail the check.
4. **Author** — on gaps, hand off to `/mdcp-doc-only` after any HIL answers.

Example:

```bash
pnpm build
node packages/mdcp-cli/dist/cli.js evaluate-doc-coverage \
  --git --base origin/main \
  --mode advisory \
  --config docs/mdcp.config.json \
  --docs-root docs
```

Consumer-facing command docs: [Evaluate doc coverage](../client-cli/evaluate-doc-coverage.md).
