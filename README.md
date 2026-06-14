# MDCP — Markdown Command Line Interface Processor

**mdcp** splits, compiles, validates, and exports sharded Markdown documentation for code repositories. You edit small shard files; mdcp weaves them into compiled output with correct heading levels, working cross-links, and structure checks.

Shards are the **source of truth**. Generated output includes a local `docs/guides.md` (gitignored), `docs/refs.json` (gitignored), and npm package READMEs compiled from `docs/client-cli/` and `docs/client-core/`.

## Quick start

```bash
pnpm install && pnpm build
pnpm docs:compile:repo    # docs/guides.md + package READMEs
pnpm docs:check           # repo docs + examples/sample-guides
```

Try the minimal fixture: [examples/sample-guides/](examples/sample-guides/).

**LLM collaboration:** copy the [bootstrap prompt](examples/prompts/docs-as-code-with-mdcp.prompt.md) and read the [LLM collaboration guide](docs/client-cli/llm-collaboration.md) for workflows with Cursor, Composer, Gemini CLI, and other agents.

## Documentation (sharded)

This repo dogfoods mdcp under [`docs/`](docs/):

| Guide             | Shards                                   | Compiled output                                                |
| ----------------- | ---------------------------------------- | -------------------------------------------------------------- |
| Tool capabilities | [`docs/features/`](docs/features/)       | `docs/guides.md` (local, gitignored)                           |
| Repo development  | [`docs/developer/`](docs/developer/)     | `docs/guides.md` (local, gitignored)                           |
| CLI consumers     | [`docs/client-cli/`](docs/client-cli/)   | [`packages/mdcp-cli/README.md`](packages/mdcp-cli/README.md)   |
| Core API          | [`docs/client-core/`](docs/client-core/) | [`packages/mdcp-core/README.md`](packages/mdcp-core/README.md) |

Edit shards, then `pnpm docs:compile:repo`. Agent context: `pnpm docs:context`.

Key shards:

- [Feature catalog](docs/features/feature-catalog.md) — commands, tiers, agent scripts
- [Design constraints](docs/features/design-constraints.md) — md-tree, GFM, peer linters
- [Developer guide](docs/developer/local-setup.md) — setup, tests, docs dogfooding, releases
- [CLI quick start](docs/client-cli/install-and-quick-start.md) — install and first compile
- [LLM collaboration](docs/client-cli/llm-collaboration.md) — bootstrap prompt and agent workflows

## Contributing

```bash
pnpm install
pnpm build
pnpm vale:sync
pnpm run check
```

Details: [docs/developer/local-setup.md](docs/developer/local-setup.md). Package changes need a changeset — [docs/developer/versioning-and-releases.md](docs/developer/versioning-and-releases.md).

## License

MIT
