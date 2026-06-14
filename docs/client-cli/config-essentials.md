# Config essentials

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
