# Local setup

## Requirements

- Node.js **>= 22.12.0** (see `engines` in root [`package.json`](../../package.json); [`.nvmrc`](../../.nvmrc) pins major version `22` for `nvm use`)
- [pnpm](https://pnpm.io/) 9.x (see `packageManager` in root [`package.json`](../../package.json))

## First-time bootstrap

```bash
pnpm install
pnpm build
pnpm vale:sync            # once — Vale styles for docs/ and examples/sample-guides/
```

## Daily commands

| Command                  | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `pnpm build`             | Build all packages (`mdcp-core`, `mdcp-cli`)                  |
| `pnpm test`              | Run `vitest` in `mdcp-core`                                   |
| `pnpm run typecheck`     | TypeScript across packages                                    |
| `pnpm run lint`          | ESLint on TypeScript sources                                  |
| `pnpm run format:check`  | Prettier check                                                |
| `pnpm run check`         | Full gate: typecheck, lint, format, build, test, `docs:check` |
| `pnpm docs:compile:repo` | Regenerate `docs/guides.md` and package READMEs from shards   |
| `pnpm docs:check`        | Validate repo docs + `examples/sample-guides`                 |

Optional locally: `brew install gitleaks` (CI always scans).
