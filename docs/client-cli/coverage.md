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

`standaloneGuides` accepts file paths or globs. `scan.ignore` extends the built-in skip list (`node_modules`, `.git`, `dist`, `build`, `_build`, `.caches`, `.agents`, `styles`, `coverage`). The scan root defaults to the invocation directory; override it with `scan.root`.

Standalone files are register-only: compile never rewrites or emits them, but their headings still join the refs registry and their links are validated. For the full capability contract, see [Documentation coverage scan](../features/coverage-scan.md).
