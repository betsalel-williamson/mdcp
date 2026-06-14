# Publishing @mdcp/\*

Packages: `@mdcp/core`, `@mdcp/cli`, `@mdcp/presets` (fixed versioning via Changesets)

## Prerequisites

- npm account with access to publish `@mdcp/*`
- **2FA enabled** on npm (auth-and-writes) for all publishers
- `pnpm install` at repo root (includes `@changesets/cli`)
- Trusted Publishing configured on npmjs.com for each package (GitHub Actions → `betsalel-williamson/mdcp`, workflow `release.yml`)

## Trusted Publishing setup

1. On [npmjs.com](https://www.npmjs.com/), open each package → **Settings** → **Trusted Publisher** → GitHub Actions.
2. Repository: `betsalel-williamson/mdcp`, workflow: `release.yml`, branch: `main`.
3. Enable **Require 2FA** and disallow classic tokens for publish when ready.
4. Revoke any legacy `NPM_TOKEN` secrets from GitHub — the release workflow uses OIDC (`id-token: write`) and `NPM_CONFIG_PROVENANCE=true`.

## Release workflow

Automated via [`.github/workflows/release.yml`](./.github/workflows/release.yml) when Changesets merge to `main`.

Manual fallback:

```bash
pnpm run check
pnpm changeset
pnpm changeset version
git add . && git commit -m "chore: version packages"
pnpm build
pnpm changeset publish
```

Changesets config: [`.changeset/config.json`](./.changeset/config.json) — all three packages version together.

Before publishing a new package, dry-run tarball contents:

```bash
pnpm --filter @mdcp/core exec npm pack --dry-run
```

## Install surfaces

| Use case       | Command                                                   |
| -------------- | --------------------------------------------------------- |
| Dev dependency | `npm i -D @mdcp/cli @mdcp/presets`                        |
| Global CLI     | `npm i -g @mdcp/cli`                                      |
| Programmatic   | `import { compileGuides, stripForLlm } from '@mdcp/core'` |

Each package runs `prepublishOnly` to build (or verify) before publish.

See [SECURITY.md](./SECURITY.md) for vulnerability reporting.
