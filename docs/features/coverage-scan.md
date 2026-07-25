# Documentation coverage scan

Specification for the repository-wide markdown coverage scan and the [standalone guide](../glossary/standalone-guide.md) concept. The scan reports every markdown file that no guide accounts for, so authors either fold the file into a compiled guide or register it as standalone.

## Two document concepts

MDCP tracks two kinds of authored markdown:

| Concept          | Compiled | Source of truth          | Declared in                     |
| ---------------- | -------- | ------------------------ | ------------------------------- |
| Guide            | Yes      | Shards under a directory | `guides[]` (via `compileOrder`) |
| Standalone guide | No       | The file itself          | `standaloneGuides[]`            |

A guide compiles a list of shards into one output. A [standalone guide](../glossary/standalone-guide.md) is a single markdown file that is already whole — for example a hand-authored package `README.md` or a top-level `SECURITY.md`. The scan treats both as accounted for.

## Coverage and the captured set

[Coverage](../glossary/coverage.md) is the set of markdown files MDCP can account for. A file is **captured** when it is one of:

- a shard belonging to a guide in `compileOrder` (its manifest sections),
- a guide output target (`compile.outputFile`, or the top-level `outputFile`), or
- a `standaloneGuides[]` entry.

The scan walks the scan root for `*.md`, removes ignored vendor paths, then subtracts the captured set. Whatever remains is **uncaptured** and reported.

Guide output targets are captured so generated files such as `README.md`, `DEVELOPERS.md`, and the package READMEs never appear as uncaptured.

## Standalone guide behavior

A standalone guide is register-only:

- Compile never stitches or rewrites it, and never emits it.
- Its headings register into [refs](../glossary/refs.md) so other guides can link into it.
- Its outbound links are validated against the refs registry.
- Peer tools (markdownlint, Vale, Prettier) still process the file normally.

`standaloneGuides[]` accepts file paths or globs (for example `packages/*/README.md`), resolved from the scan root. It doubles as the canonical inventory of intentionally isolated shards.

## What the scan skips

The scan honors the repository `.gitignore` by default, so paths already excluded from version control (for example `node_modules`, `dist`, `build`, `_build`, `.caches`, `coverage`) are skipped with no extra config. A small built-in default always skips `.git`, `node_modules`, and `.agents`, even when `.gitignore` does not list them.

`scan.ignore` extends what is skipped, `scan.gitignore: false` turns off `.gitignore` honoring, and `scan.root` overrides the walk root (default: the invocation directory).

## Coverage command and check summary

Two surfaces report coverage:

- `mdcp coverage` — prints the captured count, the uncaptured files, the standalone inventory, and any `standaloneGuides[]` entries that match no file. `--json` emits the full result for scripting.
- `mdcp check` — appends one non-fatal summary line naming how many files are uncaptured and pointing to `mdcp coverage`.

The coverage warning is non-fatal by default so it never breaks a build. `mdcp coverage --strict` exits `1` for teams that choose to enforce coverage in CI.

| Condition                    | `mdcp coverage` exit | `mdcp check` exit contribution |
| ---------------------------- | -------------------- | ------------------------------ |
| No uncaptured files          | `0`                  | none                           |
| Uncaptured files, default    | `0`                  | none (warning line only)       |
| Uncaptured files, `--strict` | `1`                  | not applicable                 |

## Relationship to the orphan check

The coverage scan does not replace the [orphan check](./feature-catalog.md#orphan-check-p13). They cover different mistakes:

| Check         | Scope                                                       | Severity                   |
| ------------- | ----------------------------------------------------------- | -------------------------- |
| Orphan check  | A shard inside a guide directory missing from its manifest  | Error (fails `mdcp check`) |
| Coverage scan | Any markdown file under the repo that no guide accounts for | Warning (non-fatal)        |

The orphan check stays a hard error because a shard in a guide directory is clearly meant to compile. The coverage scan is a warning because an uncaptured file may be intentional until registered as standalone.

## Config

```json
{
  "standaloneGuides": ["packages/*/README.md", "SECURITY.md"],
  "scan": {
    "gitignore": true,
    "ignore": ["legacy"],
    "root": "."
  }
}
```

| Knob               | Default                                    | Role                                               |
| ------------------ | ------------------------------------------ | -------------------------------------------------- |
| `standaloneGuides` | `[]`                                       | Files or globs registered as standalone (captured) |
| `scan.gitignore`   | `true`                                     | Honor the repository `.gitignore` when walking     |
| `scan.ignore`      | built-in `.git`, `node_modules`, `.agents` | Extra directories or globs to skip                 |
| `scan.root`        | invocation directory                       | Root the scan walks for markdown files             |

## Coverage scan acceptance criteria

- A shard in a compiled guide is captured.
- A guide output target (`compile.outputFile` and top-level `outputFile`) is captured.
- A `standaloneGuides[]` entry is captured, including glob matches.
- A markdown file outside every guide and outside `standaloneGuides[]` is reported as uncaptured.
- The scan honors `.gitignore` by default; `scan.gitignore: false` disables it.
- Built-in defaults (`.git`, `node_modules`, `.agents`) are always skipped; `scan.ignore` extends them.
- A `standaloneGuides[]` entry matching no file is reported as missing.
- `mdcp coverage` exits `0` by default and `1` with `--strict` when uncaptured files exist.
- `mdcp coverage --json` emits captured, uncaptured, standalone, and missing sets.
- `mdcp check` appends a non-fatal coverage summary line and never fails on uncaptured files.
- The existing orphan check behavior is unchanged.

## Coverage scan related

- [Standalone guide](../glossary/standalone-guide.md)
- [Coverage](../glossary/coverage.md)
- [Coverage command](../client-cli/coverage.md)
- [Commands reference](../client-cli/commands-reference.md)
- [Feature catalog](./feature-catalog.md)
