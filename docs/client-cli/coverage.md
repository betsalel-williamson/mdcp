# Coverage command

`mdcp coverage` reports markdown files that no guide accounts for, so nothing drifts out of your documentation set unnoticed.

## What it reports

- **Captured** — the count of markdown files a guide accounts for.
- **Uncaptured** — files under the scan root that no guide or `standaloneGuides[]` entry covers.
- **Standalone inventory** — every file registered in `standaloneGuides[]`.
- **Missing standalone** — `standaloneGuides[]` entries that match no file on disk.

```bash
mdcp coverage --config docs/mdcp.config.json --docs-root docs
```

Add `--json` to emit the full result for scripting.

## Exit behavior

The command exits `0` by default, even when files are uncaptured, so it never breaks a build. Use `--strict` to exit `1` when uncaptured files exist — useful when a team enforces coverage in CI.

| Flag       | Purpose                                                         |
| ---------- | --------------------------------------------------------------- |
| `--json`   | Emit captured, uncaptured, standalone, and missing sets as JSON |
| `--strict` | Exit `1` when uncaptured files exist                            |

`mdcp check` also appends a one-line, non-fatal coverage summary and points here for the full list.

## Registering standalone files

When a file is intentionally standalone — a hand-authored README or a top-level policy file — list it under `standaloneGuides[]` so the scan treats it as captured:

```json
{
  "standaloneGuides": ["packages/*/README.md", "SECURITY.md"],
  "scan": {
    "ignore": ["legacy"]
  }
}
```

`standaloneGuides` accepts file paths or globs. The scan honors your `.gitignore` by default, so version-controlled ignores (for example `node_modules`, `dist`, and build output) are skipped automatically; set `scan.gitignore: false` to turn that off. A built-in default always skips `.git`, `node_modules`, and `.agents`. `scan.ignore` extends what is skipped, and `scan.root` overrides the walk root (default: the invocation directory).

Standalone files are register-only: compile never rewrites or emits them, but their headings still join the refs registry and their links are validated. For the full capability contract, see [Documentation coverage scan](../features/coverage-scan.md).

Do not list a compiled guide's output (a generated file such as `README.md` or `DEVELOPERS.md`) in `standaloneGuides`. Those outputs are already captured as guide output targets and are never flagged as uncaptured, so they stay out of the standalone set.
