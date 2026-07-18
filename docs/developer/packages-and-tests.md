# Packages and tests

## mdcp-core

Library source: [`packages/mdcp-core/src/`](../../packages/mdcp-core/src/).

| Area               | Path                          |
| ------------------ | ----------------------------- |
| Config schema      | `src/config/`                 |
| Compile / assemble | `src/compile/`                |
| Refs / slugs       | `src/refs/`                   |
| Validation         | `src/validate/`, `src/xrefs/` |
| Shard (split)      | `src/shard/`                  |
| Protocol helpers   | `src/export/`                 |
| Peer linters       | `src/peers/`                  |

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

## mdcp-skills-audit-proxy

Private Vercel OIDC bridge for [skills.sh audit sync](./skills-audit-sync.md). Source: [`packages/mdcp-skills-audit-proxy/src/`](../../packages/mdcp-skills-audit-proxy/src/). One-time deploy: [Vercel setup](./skills-audit-proxy-vercel.md).

| Area        | Path            |
| ----------- | --------------- |
| Config      | `src/config.ts` |
| GitHub OIDC | `src/auth.ts`   |

```bash
pnpm --filter @bwilliamson/mdcp-skills-audit-proxy test
pnpm --filter @bwilliamson/mdcp-skills-audit-proxy run typecheck
```

Auth tests sign local JWTs with `jose` `generateKeyPair` and inject JWKS via `createLocalJWKSet` — no network calls. Route handlers and skills.sh forwarding land in later tasks.

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

Pull requests also run the **changeset** job when package sources change.
