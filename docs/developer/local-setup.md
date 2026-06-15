# Local setup

## Requirements

- Node.js **>= 22.12.0** (see `engines` in root [`package.json`](../../package.json); [`.nvmrc`](../../.nvmrc) pins major version `22` for `nvm use`)
- [pnpm](https://pnpm.io/) 9.x (see `packageManager` in root [`package.json`](../../package.json))
- [Vale](https://vale.sh/docs/vale-cli/installation/) on `PATH` for prose lint (`pnpm docs:check` uses `--require-vale`). macOS: `brew install vale`; Linux: `snap install vale` or a [GitHub release](https://github.com/vale-cli/vale/releases) tarball. CI pins **3.15.1**.

## First-time bootstrap

```bash
pnpm install
pnpm build
pnpm vale:sync            # once — requires Vale on PATH; syncs styles for docs/ and examples/sample-guides/
```

## Work-item tracking setup step

If you use coding agents with task-type prompts ([examples/prompts/](../../examples/prompts/)), document how to load tracker issues **once per repo**. This project maintains that in [Agent work-item tracking](./agent-work-item-tracking.md) — add it to your setup checklist alongside install and build steps. Consumer repos should add a similar shard under `docs/developer/` and link it from local setup.

## Daily commands

| Command                  | Purpose                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `pnpm build`             | Build all packages (`mdcp-core`, `mdcp-cli`)                             |
| `pnpm test`              | Run `vitest` in `mdcp-core`                                              |
| `pnpm run typecheck`     | TypeScript across packages                                               |
| `pnpm run lint`          | ESLint on TypeScript sources                                             |
| `pnpm run format:check`  | Prettier check                                                           |
| `pnpm run check`         | Full gate: typecheck, lint, format, build, test, `docs:check`            |
| `pnpm docs:compile:repo` | Regenerate compiled docs (`guides.md`, `DEVELOPERS.md`, package READMEs) |
| `pnpm docs:check`        | Validate repo docs + `examples/sample-guides`                            |

Optional locally: `brew install gitleaks` (CI always scans).

## Git hooks

Pre-commit runs in two phases:

| Phase           | What runs                                                                                |
| --------------- | ---------------------------------------------------------------------------------------- |
| lint-staged     | Prettier and ESLint on staged files (including `.jsonc`)                                 |
| affected checks | `scripts/pre-commit-affected.mjs` — build and test only packages touched by staged paths |

| Staged paths                                            | Extra checks                                             |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `packages/mdcp-core/**`                                 | typecheck, build, `vitest related` on changed files      |
| `packages/mdcp-cli/**`                                  | core build (dependency), then cli typecheck, build, test |
| `packages/mdcp-presets/**`                              | JSONC preset validation                                  |
| `docs/**`, `DEVELOPERS.md`, package README shards       | `docs:compile:repo` + `docs:check:repo`                  |
| Root config (`package.json`, lockfile, eslint/tsconfig) | repo-wide typecheck + `format:check`                     |

CI runs the full gate: `pnpm run check`.
