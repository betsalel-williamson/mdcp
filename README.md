# MDCP — Markdown Command Line Interface Processor

**mdcp** splits, compiles, validates, and exports sharded Markdown documentation for code repositories. GFM only — no Pandoc, no `{#heading-ids}`.

## Repository layout

```
mdcp/
├── legacy/                 # Phase 1 — original bash/Python util (reference)
├── packages/
│   ├── mdcp-core/          # @mdcp/core — library
│   ├── mdcp-cli/           # @mdcp/cli — npx binary
│   └── mdcp-presets/       # @mdcp/presets — starter lint configs
├── examples/
│   └── sample-guides/      # Minimal generic sharded docs fixture
└── docs/
    └── PHASE2-MIGRATION.md
```

## Quick start

### Phase 2 (local)

```bash
pnpm install
pnpm build
node packages/mdcp-cli/dist/cli.js compile --config examples/sample-guides/mdcp.config.json --cwd examples/sample-guides
node packages/mdcp-cli/dist/cli.js check --config examples/sample-guides/mdcp.config.json --cwd examples/sample-guides --skip-vale
```

### Agent workflow (consumer repo)

```bash
# Compact context for feature work
mdcp export --llm --stdout --config docs/mdcp.config.json

# Find slug while writing cross-links
mdcp refs lookup "authentication" --format json

# Full structural gate
mdcp check --require-lint
```

Or after publish: `npx @mdcp/cli check --config mdcp.config.json`

See [docs/FEATURES.md](./docs/FEATURES.md) for the value-first feature catalog.

## Commands

| Command | Purpose |
|---|---|
| `mdcp check` | Compile, orphan check, refs, xrefs; peer linters if installed |
| `mdcp compile` | Shards → monolith |
| `mdcp shard` | Monolith → shards (md-tree) |
| `mdcp sections` | Regenerate `sections.txt` from `index.md` |
| `mdcp refs list` | JSON heading slug registry |
| `mdcp refs lookup <query>` | JSON fuzzy heading search |
| `mdcp export --llm` | Token-optimized output for LLM context |
| `mdcp lint` | markdownlint-cli2 (peer, if installed) |
| `mdcp prose` | Vale (peer, if installed) |
| `mdcp fix` | Prettier + markdownlint --fix (peer) |

## Legacy file inventory

| File | Role |
|---|---|
| `legacy/shard.sh` | Split monolith via md-tree explode |
| `legacy/compile.sh` | Stitch shards → guides.md |
| `legacy/compile_sections.py` | Heading demotion / preamble logic |
| `legacy/write-sections-manifest.py` | `sections.txt` from `index.md` |
| `legacy/validate.sh` | Full validation gate |
| `legacy/scripts/lint-xrefs.py` | Bare chapter-ref lint |
| `legacy/scripts/generate-anchor-registry.py` | Legacy `{#anchor}` registry (superseded by refs.json) |
| `legacy/configs/` | markdownlint, Vale, Prettier configs |

## Phase 2 migration checklist

See [docs/PHASE2-MIGRATION.md](./docs/PHASE2-MIGRATION.md).

## License

MIT
