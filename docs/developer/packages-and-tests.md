# Packages and tests

## mdcp-core

Library source: [`packages/mdcp-core/src/`](../../packages/mdcp-core/src/).

| Area               | Path                          |
| ------------------ | ----------------------------- |
| Config schema      | `src/config/`                 |
| Compile / assemble | `src/compile/`                |
| Markdown helpers   | `src/markdown/`               |
| Refs / slugs       | `src/refs/`                   |
| Validation         | `src/validate/`, `src/xrefs/` |
| Shard (split)      | `src/shard/`                  |
| Protocol helpers   | `src/export/`                 |
| Peer linters       | `src/peers/`                  |

Shared heading and `{#id}` helpers live under `src/markdown/` — see [Safe markdown parsing](./safe-markdown-parsing.md) for why.

```bash
pnpm --filter @bwilliamson/mdcp-core test
pnpm --filter @bwilliamson/mdcp-core run typecheck
```

Tests live under `packages/mdcp-core/test/`. Integration tests invoke the built CLI against `examples/sample-guides/`.

## mdcp-cli

Thin Commander wrapper around `mdcp-core`. Source: [`packages/mdcp-cli/src/cli.ts`](../../packages/mdcp-cli/src/cli.ts).

```bash
pnpm --filter @bwilliamson/mdcp-cli run build
node packages/mdcp-cli/dist/cli.js --help
```

## Test code coverage

Vitest coverage for `@bwilliamson/mdcp-core` and `@bwilliamson/mdcp-cli` (not root `scripts/` tests). This is **test** coverage of TypeScript sources — distinct from the [documentation coverage scan](../features/coverage-scan.md). Note that CLI package totals are understated because smoke tests drive the built binary out-of-process (V8 coverage does not follow that subprocess).

```bash
pnpm test:coverage
```

Local runs print a text summary and write HTML/lcov under each package’s `coverage/` directory (gitignored). CI runs the same command in a separate **coverage** job, appends package totals to the Actions job summary, and uploads those `coverage/` trees as artifacts. Default `pnpm test` / `pnpm check` do not collect coverage and do not enforce percentage thresholds.

## mdcp-presets

JSONC markdownlint configs only — no TypeScript build. Edit `*.markdownlint-cli2.jsonc` directly.

## Pull request checklist

1. `pnpm run build && pnpm test`
2. `pnpm run lint && pnpm run format:check`
3. `pnpm docs:compile:repo && pnpm docs:check` if you touched `docs/` shards
4. `pnpm changeset` if you changed published package behavior (see [Versioning and releases](./versioning-and-releases.md))

CI runs the same core gates as `pnpm run check` (typecheck, lint, format, build, test, `docs:check`), plus:

- `pnpm run verify:peers` — confirm markdownlint-cli2 and Vale are on PATH
- `pnpm audit --audit-level=high` — dependency vulnerability scan
- `pnpm run prepare:docs` — `verify:peers` + `vale:sync` before `docs:check`
- a separate **coverage** job runs `pnpm test:coverage`, appends package totals to the Actions job summary, and uploads `coverage/` artifacts (informational; no threshold enforcement)

Pull requests also run the **changeset** job when package sources change.
