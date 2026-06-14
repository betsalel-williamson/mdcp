# Config essentials

## `--config` vs `--docs-root`

These two global options answer different questions:

| Option            | Resolved from                                                                        | Purpose                                                     |
| ----------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **`--config`**    | **Invocation directory** — where you run the command (repo root in most npm scripts) | Locates `mdcp.config.json` on disk                          |
| **`--docs-root`** | N/A (you pass the shard tree root explicitly)                                        | Root of guide directories — see [Path layout](#path-layout) |

`--cwd` is a **deprecated alias** for `--docs-root`. `--config` is never prefixed with `--docs-root`.

### Repo-root npm scripts

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --docs-root docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint"
  }
}
```

### When you are already inside `docs/`

```bash
cd docs
mdcp compile
mdcp compile --config mdcp.config.json --docs-root .
```

### Programmatic API

`loadConfig(configPath, configBase)` mirrors the CLI: pass the invocation directory as `configBase`, and the docs root as `docsRoot` when resolving guide paths. See [API — Config](../client-core/api-config.md).

## Path layout

Two roots (NPM-style):

| Root            | CLI / config                   | Role                                             |
| --------------- | ------------------------------ | ------------------------------------------------ |
| **Docs root**   | `--docs-root`                  | Human shard trees — one subdirectory = one guide |
| **Output root** | `outputDir` (default `_build`) | Generated markdown and cache — safe to delete    |

**One rule for all generated paths:** values are **relative to `outputDir`**, unless **absolute**.

```text
docs/                          ← --docs-root
  mdcp.config.json
  features/                    ← guide "features" (shards)
  client-cli/                  ← guide "client-cli"
  styles/                      ← support dir (not in compileOrder)
  _build/                      ← outputDir (generated)
    features.md
    client-cli.md
    guides.md                  ← optional monolith (when outputFile set)
    .caches/
      refs.json
```

### Guide = one subdirectory

Each guide is a **folder** directly under the docs root. The guide **`name`** matches the **directory name**. Omit `guides[].path` unless shards live elsewhere.

Only directories listed in `compileOrder` are compiled and linted. Support folders (for example `styles/`) stay on disk but are out of scope.

| Config field          | Resolved from | Example (`--docs-root docs`)              |
| --------------------- | ------------- | ----------------------------------------- |
| Default guide shards  | `docsRoot`    | `docs/features/`                          |
| `guides[].path`       | `docsRoot`    | `docs/features/`                          |
| `outputDir`           | `docsRoot`    | `docs/_build/`                            |
| Per-guide output      | `outputDir`   | `docs/_build/features.md`                 |
| Monolith `outputFile` | `outputDir`   | `docs/_build/guides.md` (opt-in)          |
| `refs.registryFile`   | `outputDir`   | `docs/_build/.caches/refs.json`           |
| `compile.outputFile`  | `outputDir`   | `../packages/foo/README.md` from `_build` |

Delete `_build/` to clean all generated output. `.caches/` holds derived state (refs registry) only.

---

Minimal `mdcp.config.json`:

```json
{
  "compileOrder": ["overview", "admin-guide"],
  "guides": [{ "name": "overview" }, { "name": "admin-guide" }]
}
```

Defaults: `outputDir` `_build`, per-guide outputs `overview.md` and `admin-guide.md`, refs at `.caches/refs.json`. No monolith unless you set top-level `outputFile`.

| Field                | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `compileOrder`       | Guide directories to compile, in stitch order for optional monolith  |
| `guides`             | Per-guide options (hooks, manifests, publish paths)                  |
| `outputDir`          | Generated output root (relative to `--docs-root`)                    |
| `outputFile`         | Optional stitched monolith (relative to `outputDir`)                 |
| `refs.registryFile`  | Cross-link lookup table (default `.caches/refs.json`)                |
| `compile.outputFile` | Override per-guide output path (relative to `outputDir` or absolute) |

### Default per-guide outputs

When `compile.outputFile` is omitted:

| Guides in `compileOrder` | Default file under `outputDir` |
| ------------------------ | ------------------------------ |
| 1                        | `guide.md`                     |
| 2+                       | `{name}.md` per guide          |

When `compile.outputFile` is set, that guide writes only to that path (for example npm README publish via `../packages/foo/README.md`) and is excluded from an optional monolith.

### Optional monolith

Set top-level `outputFile` (for example `"guides.md"`) to also stitch guides **without** explicit `compile.outputFile` into one file under `outputDir`.

### `sectionsHeading`

When a manifest has preamble prose with example inline links before an ordered `## Sections` list, set `compile.sectionsHeading`. See [Manifest compile order](../features/manifest-compile-order.md).

```json
{
  "name": "glossary",
  "compile": {
    "title": "Compound glossary",
    "sectionsHeading": "Sections",
    "outputFile": "glossary.md"
  }
}
```

## Schema-only fields

| Field                       | Notes                                                      |
| --------------------------- | ---------------------------------------------------------- |
| `refs.slugAlgorithm`        | Informational only — only `github` is implemented          |
| `export.llm.skipIndexFiles` | No-op — compile output never includes `index.md` manifests |

Full schema and examples: [mdcp.config.json in sample-guides](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json).
