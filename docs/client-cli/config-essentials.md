# Config essentials

## `--config` vs `--cwd` (path resolution)

These two global options answer different questions:

| Option         | Resolved from                                                                        | Purpose                                                         |
| -------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| **`--config`** | **Invocation directory** — where you run the command (repo root in most npm scripts) | Locates `mdcp.config.json` on disk                              |
| **`--cwd`**    | N/A (you pass the docs root explicitly)                                              | Guide directories, compile outputs, and paths inside the config |

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
mdcp sections --config docs/mdcp.config.json --cwd docs
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

`loadConfig(configPath, configBase)` in `@bwilliamson/mdcp-core` mirrors the CLI: pass the invocation directory as `configBase`, and the docs root separately when resolving guide paths (`resolveGuideDir`, `resolveOutputPath`, etc.). See [API — Config](../client-core/api-config.md).

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
| `outputFile`        | Compiled monolith path                                 |
| `refs.registryFile` | Cross-link lookup table path                           |
| `lint`              | markdownlint configs, xref checks, link checking       |
| `vale`              | Prose lint paths and `.vale.ini` location              |
| `source`            | Monolith path — required only for `mdcp shard`         |

Per-guide `compile.outputFile` writes a publish target (relative to `--cwd`) and excludes that guide from the monolith. Use `compile.includeBanner: false` for npm README outputs.

## Schema-only fields

| Field                       | Notes                                                      |
| --------------------------- | ---------------------------------------------------------- |
| `refs.slugAlgorithm`        | Informational only — only `github` is implemented          |
| `export.llm.skipIndexFiles` | No-op — compile output never includes `index.md` manifests |

Full schema and examples: [mdcp.config.json in sample-guides](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json).
