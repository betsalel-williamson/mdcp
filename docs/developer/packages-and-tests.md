# Packages and tests

## mdcp-core

Library source: [`packages/mdcp-core/src/`](../../packages/mdcp-core/src/).

| Area               | Path                          |
| ------------------ | ----------------------------- |
| Config schema      | `src/config/`                 |
| Compile / assemble | `src/compile/`                |
| Markdown helpers   | `src/markdown/`               |
| Locale packs       | `src/locale/`                 |
| Refs / slugs       | `src/refs/`                   |
| Validation         | `src/validate/`, `src/links/` |
| Shard (split)      | `src/shard/`                  |
| Protocol helpers   | `src/export/`                 |
| Peer linters       | `src/peers/`                  |

### Language boundary (maintainer map)

- **GFM ATX headings, marker cleanup** → `src/markdown/` — [GFM](../glossary/gfm.md), [xref](../glossary/xref.md)
- **Language-agnostic heading slugify** → `src/refs/` (`githubSlugify`) — [heading slug](../glossary/heading-slug.md)
- **GFM [cross-links](../glossary/cross-link.md) / dead targets** → `src/links/`, `src/validate/` — [refs](../glossary/refs.md)
- **Compile-time wording + locale heading-key patterns** → `src/locale/` (BCP 47 JSON) — [locale pack](../glossary/locale-pack.md)
- **Unlinked numbered heading mentions (en-US prose)** → Vale `MDCP` in `@bwilliamson/mdcp-presets` — [Locale and language boundary](../features/design-constraints/locale-and-language.md)
- **Pandoc [xref](../glossary/xref.md) after headings (remove)** → dogfood Vale `MDCP-Xref` (`docs/vale-local/`) — [xref](../glossary/xref.md)

Shared GFM helpers stay **language-agnostic** — Unicode heading text and GFM links, not English chapter/section vocabulary. Compile may strip leftover `{#…}` markers for cleanup; authoring opinion to **remove** them is Vale. See [Locale and language boundary](../features/design-constraints/locale-and-language.md).

```bash
pnpm --filter @bwilliamson/mdcp-core test
pnpm --filter @bwilliamson/mdcp-core run typecheck
```

Tests live under `packages/mdcp-core/test/`. Integration tests invoke the built CLI against `examples/sample-guides/`.

## mdcp-cli

Thin [CAC](https://github.com/cacjs/cac) wrapper around `mdcp-core`. Source: [`packages/mdcp-cli/src/cli.ts`](../../packages/mdcp-cli/src/cli.ts).

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

JSONC markdownlint configs plus the shippable `MDCP` Vale style (`vale/MDCP/`, Packages-ready under `vale/package/`). Edit preset files directly — no TypeScript build. Dogfood-only Vale styles (for example `MDCP-Xref`) live under [`docs/vale-local/`](../vale-local/README.md), not in the published package.

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
