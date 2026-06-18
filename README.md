# MDCP — MarkDown Context Protocol

**mdcp** is a protocol for repository documentation context — sharded intent and design in Markdown, validated compile output for agents, CI, and human readers. You edit small shard files; mdcp weaves them into compiled output with correct heading levels, working cross-links, and structure checks. The CLI is one surface for `compile`, `check`, `refs lookup`, and `export --llm`.

> **Open alpha (0.4.0).** MDCP is moving fast — this release is a working foundation for early adopters. Tooling and the draft protocol profile may change in 0.5+. Pin `@bwilliamson/mdcp-cli@0.4.0`. Fetch the agent bootstrap with `mdcp export --llms-index --fetch --fetch-profile alpha --fetch-ref v0.4.0 --docs-root docs`. There is **no API stability guarantee** until npm 1.0.
>
> **Get involved:** Visit [github.com/betsalel-williamson/mdcp](https://github.com/betsalel-williamson/mdcp), **star** the repo to follow progress, and **open or comment on [GitHub Issues](https://github.com/betsalel-williamson/mdcp/issues)** with feedback, adoption stories, or bugs.

Shards are the **source of truth**. Generated output includes a local `docs/guides.md` (features review — gitignored), `docs/refs.json` (gitignored), [`DEVELOPERS.md`](DEVELOPERS.md) (from `docs/developer/`), and npm package READMEs compiled from `docs/client-cli/` and `docs/client-core/`.

## Quick start

```bash
pnpm install && pnpm build
pnpm docs:compile:repo    # docs/guides.md + DEVELOPERS.md + package READMEs
pnpm docs:check           # repo docs + examples/sample-guides
```

Try the minimal fixture: [examples/sample-guides/](examples/sample-guides/).

**LLM pair-coding:** documentation shards hold context and the high-level plan; code holds implementation. See [Why mdcp for coding agents](docs/client-cli/why-mdcp-for-agents.md) for the pain each command addresses, then [LLM collaboration](docs/client-cli/llm-collaboration.md) for prompts and workflow.

## Documentation (sharded)

This repo dogfoods mdcp under [`docs/`](docs/):

| Guide             | Shards                                   | Compiled output                                                |
| ----------------- | ---------------------------------------- | -------------------------------------------------------------- |
| Tool capabilities | [`docs/features/`](docs/features/)       | `docs/guides.md` (local review — gitignored)                   |
| Repo development  | [`docs/developer/`](docs/developer/)     | [`DEVELOPERS.md`](DEVELOPERS.md)                               |
| CLI consumers     | [`docs/client-cli/`](docs/client-cli/)   | [`packages/mdcp-cli/README.md`](packages/mdcp-cli/README.md)   |
| Core API          | [`docs/client-core/`](docs/client-core/) | [`packages/mdcp-core/README.md`](packages/mdcp-core/README.md) |

Edit shards, then `pnpm docs:compile:repo`. Agent context: `pnpm docs:context`.

Key shards:

- [Feature catalog](docs/features/feature-catalog.md) — commands, tiers, agent scripts
- [Design constraints](docs/features/design-constraints/index.md) — md-tree, GFM, peer linters
- [Developer guide](docs/developer/local-setup.md) — setup, tests, docs dogfooding, releases
- [Why mdcp for coding agents](docs/client-cli/why-mdcp-for-agents.md) — developer pain and which commands address it
- [CLI install and quick start](docs/client-cli/install-and-quick-start.md) — install and first compile
- [LLM collaboration](docs/client-cli/llm-collaboration.md) — spec-driven workflow, prompts, and agent integration

## Contributing

```bash
pnpm install
pnpm build
pnpm vale:sync
pnpm run check
```

Details: [DEVELOPERS.md](DEVELOPERS.md) and [docs/developer/local-setup.md](docs/developer/local-setup.md). Package changes need a changeset — [docs/developer/versioning-and-releases.md](docs/developer/versioning-and-releases.md).

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT
