# Publishing

Packages: `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-presets` (independent versioning via Changesets). Agent Skills use private `@bwilliamson/skill-*` carriers and are **not** published to npm.

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
pnpm changeset publish       # publishes public @bwilliamson/mdcp-* packages that need publishing
```

Verify:

```bash
npm view @bwilliamson/mdcp-cli version
npm view @bwilliamson/mdcp-core version
npm view @bwilliamson/mdcp-presets version
```

### Step 2 — Configure Trusted Publishing (after packages exist)

**Important Security Requirement:** The `release.yml` workflow is bound to the `release` GitHub Environment. Maintainers **must** configure Environment protection rules (required reviewers) in GitHub Settings → Environments → release. This ensures that no release can be published without manual approval.

Option A — npm website (easiest):

1. Open each package → **Settings** → **Trusted Publisher** → **GitHub Actions**
2. Repository: `betsalel-williamson/mdcp`
3. Workflow filename: `release.yml` (filename only, including `.yml`)
4. Allow action: **npm publish**

Repeat for `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, and `@bwilliamson/mdcp-presets`.

Option B — CLI (after packages exist):

```bash
npm trust github @bwilliamson/mdcp-cli     --file release.yml --repo betsalel-williamson/mdcp --allow-publish -y
npm trust github @bwilliamson/mdcp-core    --file release.yml --repo betsalel-williamson/mdcp --allow-publish -y
npm trust github @bwilliamson/mdcp-presets --file release.yml --repo betsalel-williamson/mdcp --allow-publish -y
```

### Step 3 — Future releases via CI

Trusted Publishing must reference workflow **`release.yml`** (trigger: **push to `main`** and `workflow_dispatch`). See [Versioning and releases](./versioning-and-releases.md).

1. Merge feature PRs that include changesets to `main`.
2. CI opens or updates the **Version Packages** PR.
3. Merge that PR (after environment approval on the release job if configured).
4. CI runs `pnpm release:publish` for bumped public packages.

## Trusted Publishing notes

- Repository: `betsalel-williamson/mdcp`, workflow: `release.yml`
- Revoke any legacy `NPM_TOKEN` secrets from GitHub once OIDC is verified
- The release workflow uses OIDC (`id-token: write`) and `NPM_CONFIG_PROVENANCE=true`

## Routine releases

For every cut after Trusted Publishing is configured, follow the **Release checklist** in [Versioning and releases](./versioning-and-releases.md) (Version Packages PR on `main`). That checklist covers independent package/skill bumps, skills version sync, skills.sh telemetry, and npm verification.

Local versioning (consumes changesets — use a throwaway branch):

```bash
pnpm release:version
```

Manual fallback (publish from your machine, not CI):

```bash
pnpm run check
pnpm changeset
pnpm release:version
git add . && git commit -m "chore: version packages"
pnpm release:publish
```

Changesets config: [`.changeset/config.json`](../../.changeset/config.json) — packages and skills version independently.

## Install surfaces

| Use case       | Command                                                    |
| -------------- | ---------------------------------------------------------- |
| Dev dependency | `npm i -D @bwilliamson/mdcp-cli @bwilliamson/mdcp-presets` |
| Global CLI     | `npm i -g @bwilliamson/mdcp-cli`                           |
| Programmatic   | `import { compileGuides } from '@bwilliamson/mdcp-core'`   |

Each package runs `prepublishOnly` to build (or verify) before publish.

See [SECURITY.md](../../SECURITY.md) for vulnerability reporting. For advisory triage, deprecate-vs-unpublish, and when a finding is only transitive **dev** tooling: [Security-incident triage](./security-incident-triage.md).
