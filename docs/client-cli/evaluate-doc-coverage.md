# Evaluate doc coverage

Decide whether a change set has adequate MDCP shard coverage. Hosts (CI, Cursor Automations, other agents) call this command instead of re-implementing MDCP guide taxonomy in prompts.

This is **not** the inventory [coverage scan](./coverage.md) inside `mdcp check`. That scan asks whether markdown files are registered. This command asks whether **changed work** needs new or updated shards.

## Command

```bash
# Explicit paths (repeatable)
mdcp evaluate-doc-coverage \
  --config docs/mdcp.config.json \
  --docs-root docs \
  --changed packages/mdcp-cli/src/cli.ts \
  --changed docs/features/overview.md

# Paths from a file (one path per line)
mdcp evaluate-doc-coverage --paths-file /tmp/changed.txt --config docs/mdcp.config.json --docs-root docs

# Paths from git (merge-base with --base, default origin/main)
mdcp evaluate-doc-coverage --git --base origin/main --config docs/mdcp.config.json --docs-root docs

# Fail CI when docs are missing or clarification is required
mdcp evaluate-doc-coverage --git --mode gate --config docs/mdcp.config.json --docs-root docs
```

| Option                | Default            | Purpose                                                        |
| --------------------- | ------------------ | -------------------------------------------------------------- |
| `--changed <path>`    | —                  | Repo-relative changed path (repeatable)                        |
| `--paths-file <path>` | —                  | File of paths, one per line (`-` = stdin)                      |
| `--git`               | off                | Collect paths via `git diff` against `--base`                  |
| `--base <ref>`        | `origin/main`      | Base ref for `--git`                                           |
| `--mode <mode>`       | `advisory`         | `advisory` (always exit 0 on verdict) or `gate` (fail on gaps) |
| `-c, --config`        | `mdcp.config.json` | Standard config option                                         |
| `--docs-root`         | cwd                | Docs root for guide trees                                      |

Stdout is always JSON (pretty-printed). See [Docs coverage evaluation](../features/doc-coverage-evaluation.md) for the schema and inference rules.

## Exit codes

| Mode       | `covered` | `missing_docs` / `needs_clarification` | CLI / git errors |
| ---------- | --------- | -------------------------------------- | ---------------- |
| `advisory` | `0`       | `0`                                    | `1`              |
| `gate`     | `0`       | `1`                                    | `1`              |

## Automation integration

1. Collect changed paths in the host (git diff, PR file list, or agent context).
2. Run `mdcp evaluate-doc-coverage` with those paths (or `--git`).
3. Branch on `status`:
   - `covered` — continue; optionally still run `mdcp check`.
   - `missing_docs` — open a docs task / comment with `candidateShards` and `reasons`, or invoke the doc-only skill with that scope.
   - `needs_clarification` — ask `questions` (interactive) or post them on the PR (CI). Do not invent answers.

### Minimal CI (advisory)

```yaml
- name: Evaluate MDCP doc coverage
  run: |
    pnpm exec mdcp evaluate-doc-coverage \
      --git --base origin/main \
      --mode advisory \
      --config docs/mdcp.config.json \
      --docs-root docs > doc-coverage.json
    cat doc-coverage.json
```

### Gate mode

Same command with `--mode gate`. Treat exit `1` as a required check once heuristics are trusted.

### Cursor and other agent hosts

Keep the automation thin: gather paths → call the CLI → render JSON. Use the [doc-only helper](../features/protocol/skills/mdcp-doc-only.md) only after evaluation (and after HIL answers when needed). Do not encode guide-surface rules in the host prompt.

## Related

- [Docs coverage evaluation](../features/doc-coverage-evaluation.md)
- [Agent integration](./agent-integration.md)
- [Commands reference](./commands-reference.md)
- [Coverage in check](./coverage.md)
