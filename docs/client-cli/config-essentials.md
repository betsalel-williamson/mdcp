# Config essentials

## `--config` vs `--cwd` (path resolution)

These two global options answer different questions:

| Option         | Resolved from                                                                        | Purpose                                                       |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| **`--config`** | **Invocation directory** — where you run the command (repo root in most npm scripts) | Locates `mdcp.config.json` on disk                            |
| **`--cwd`**    | N/A (you pass the docs root explicitly)                                              | Docs root — see [Config path bases](#config-path-bases) below |

`--config` and `--cwd` use independent path bases — the config path is not prefixed with `--cwd`.

### Repo-root npm scripts

From the repository root, point at the config file and set the docs root separately:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --cwd docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --cwd docs --require-lint"
  }
}
```

```bash
# Equivalent manual invocation from repo root
mdcp compile --config docs/mdcp.config.json --cwd docs
```

This resolves the config as `<repo>/docs/mdcp.config.json` and treats `docs/` as the shard tree root.

### When you are already inside `docs/`

If your shell working directory **is** the docs folder, omit the `docs/` prefix on `--config` (or rely on the default `mdcp.config.json`):

```bash
cd docs
mdcp compile
mdcp compile --config mdcp.config.json
```

Here `--cwd` defaults to `docs/` (the invocation directory), which matches the shard layout.

### Programmatic API

`loadConfig(configPath, configBase)` in `@bwilliamson/mdcp-core` mirrors the CLI: pass the invocation directory as `configBase`, and the docs root separately when resolving guide paths (`resolveGuideDir`, `resolveOutputPath`, `resolveRefsPath`, etc.). See [API — Config](../client-core/api-config.md).

### Config path bases

Config path fields use **three bases**. Mixing them up is the most common path bug.

| Base                    | Set by                                     | Example (`--cwd docs`)                                                           |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| **Invocation dir**      | where you run the command                  | `--config docs/mdcp.config.json` from repo root → `<repo>/docs/mdcp.config.json` |
| **Docs root** (`--cwd`) | explicit flag (defaults to invocation dir) | `guides/features/` → `docs/features/`                                            |
| **`outputDir`**         | config field under `--cwd`                 | `_build/compiled` → `docs/_build/compiled/`                                      |

| Config field         | Resolved from            | Example value               | Resolves to (`--cwd docs`)       |
| -------------------- | ------------------------ | --------------------------- | -------------------------------- |
| `guides[].path`      | `--cwd`                  | `features`                  | `docs/features/`                 |
| Default guide dir    | `outputDir` + guide name | (omit `path`)               | `docs/<outputDir>/<name>/`       |
| `compile.outputFile` | `--cwd`                  | `../packages/foo/README.md` | `<repo>/packages/foo/README.md`  |
| `outputDir`          | `--cwd`                  | `_build/compiled`           | `docs/_build/compiled/`          |
| `outputFile`         | `outputDir`              | `guides.md`                 | `docs/_build/compiled/guides.md` |
| `refs.registryFile`  | `outputDir`              | `refs.json`                 | `docs/_build/compiled/refs.json` |

Monolith `outputFile` and `refs.registryFile` share the same rule: **relative to `outputDir`**, not `--cwd`. Per-guide `compile.outputFile` is always **relative to `--cwd`**.

If you accidentally give a cwd-relative path for `outputFile` or `refs.registryFile` that already lies under `outputDir` (for example `"_build/compiled/refs.json"` when `outputDir` is `"_build/compiled"`), MDCP normalizes it. Prefer outputDir-relative values in config (`"refs.json"`, `"guides.md"`).

---

Minimal `mdcp.config.json`:

```json
{
  "outputFile": "guides.md",
  "compileOrder": ["overview", "admin-guide"],
  "guides": [{ "name": "overview" }, { "name": "admin-guide" }],
  "refs": { "registryFile": "refs.json" }
}
```

| Field               | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `compileOrder`      | Order of guide directories in the compiled monolith    |
| `guides`            | Per-guide options (hooks, manifests, separate outputs) |
| `outputDir`         | Compile output root (relative to `--cwd`)              |
| `outputFile`        | Monolith filename (relative to `outputDir`)            |
| `refs.registryFile` | Cross-link lookup table (relative to `outputDir`)      |
| `lint`              | markdownlint configs, xref checks, link checking       |
| `vale`              | Prose lint paths and `.vale.ini` location              |
| `source`            | Monolith path — required only for `mdcp shard`         |

**Nested `outputDir` example** — use outputDir-relative filenames:

```json
{
  "outputDir": "_build/compiled",
  "outputFile": "guides.md",
  "compileOrder": ["overview"],
  "refs": { "registryFile": "refs.json" }
}
```

Per-guide `compile.outputFile` writes a publish target (relative to `--cwd`) and excludes that guide from the monolith. Use `compile.includeBanner: false` for npm README outputs.

### `sectionsHeading`

When a manifest has preamble prose with example inline links before an ordered `## Sections` list, set `compile.sectionsHeading` to that heading. See [Manifest compile order](../features/manifest-compile-order.md) for behavior, examples, and when it is required.

```json
{
  "name": "glossary",
  "path": "glossary",
  "compile": {
    "title": "Compound glossary",
    "sectionsHeading": "Sections",
    "outputFile": "_build/compiled/glossary.md"
  }
}
```

## Schema-only fields

| Field                       | Notes                                                      |
| --------------------------- | ---------------------------------------------------------- |
| `refs.slugAlgorithm`        | Informational only — only `github` is implemented          |
| `export.llm.skipIndexFiles` | No-op — compile output never includes `index.md` manifests |

Full schema and examples: [mdcp.config.json in sample-guides](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json).
