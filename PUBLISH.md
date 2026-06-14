# Publishing @bwilliamson/mdcp-\*

Packages: `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-presets` (fixed versioning via Changesets)

## Prerequisites

- npm account **`bwilliamson`** with access to publish `@bwilliamson/*`
- **2FA enabled** on npm (auth-and-writes) for all publishers
- `pnpm install` at repo root (includes `@changesets/cli`)

## First-time publish (chicken-and-egg)

npm **cannot** configure Trusted Publishing (`npm trust` or the website UI) until the package record exists on the registry. A 404 on:

```text
POST https://registry.npmjs.org/-/package/@bwilliamson%2fmdcp-cli/trust
```

means the package has not been published yet — not that the command syntax is wrong.

**First publish must happen from your machine** with `npm login` (classic auth). After that, configure OIDC for CI.

### Step 1 — Publish locally (one time)

```bash
npm install -g npm@latest
npm login                    # log in as bwilliamson; complete 2FA when prompted

cd /path/to/mdcp
pnpm install
pnpm build
pnpm changeset publish       # publishes all three @bwilliamson/mdcp-* packages at 0.1.0
```

Verify:

```bash
npm view @bwilliamson/mdcp-cli version
npm view @bwilliamson/mdcp-core version
npm view @bwilliamson/mdcp-presets version
```

### Step 2 — Configure Trusted Publishing (after packages exist)

Option A — npm website (easiest):

1. Open each package → **Settings** → **Trusted Publisher** → **GitHub Actions**
2. Repository: `betsalel-williamson/mdcp`
3. Workflow filename: `release.yml` (filename only, including `.yml`)
4. Allow action: **npm publish**

Repeat for:

- `@bwilliamson/mdcp-core`
- `@bwilliamson/mdcp-cli`
- `@bwilliamson/mdcp-presets`

Option B — CLI (after packages exist):

```bash
npm trust github @bwilliamson/mdcp-cli     --file release.yml --repo betsalel-williamson/mdcp --allow-publish -y
npm trust github @bwilliamson/mdcp-core    --file release.yml --repo betsalel-williamson/mdcp --allow-publish -y
npm trust github @bwilliamson/mdcp-presets --file release.yml --repo betsalel-williamson/mdcp --allow-publish -y
```

### Step 3 — Future releases via CI

Once Trusted Publishing is configured, [`.github/workflows/release.yml`](./.github/workflows/release.yml) publishes on Changesets merges to `main` using OIDC (no `NPM_TOKEN`).

## Trusted Publishing notes

- Repository: `betsalel-williamson/mdcp`, workflow: `release.yml`
- Revoke any legacy `NPM_TOKEN` secrets from GitHub once OIDC is verified
- The release workflow uses OIDC (`id-token: write`) and `NPM_CONFIG_PROVENANCE=true`

## Release workflow

Automated via [`.github/workflows/release.yml`](./.github/workflows/release.yml) when Changesets merge to `main`.

Manual fallback (after first publish):

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
pnpm --filter @bwilliamson/mdcp-core exec npm pack --dry-run
```

## Install surfaces

| Use case       | Command                                                               |
| -------------- | --------------------------------------------------------------------- |
| Dev dependency | `npm i -D @bwilliamson/mdcp-cli @bwilliamson/mdcp-presets`            |
| Global CLI     | `npm i -g @bwilliamson/mdcp-cli`                                      |
| Programmatic   | `import { compileGuides, stripForLlm } from '@bwilliamson/mdcp-core'` |

Each package runs `prepublishOnly` to build (or verify) before publish.

See [SECURITY.md](./SECURITY.md) for vulnerability reporting.
