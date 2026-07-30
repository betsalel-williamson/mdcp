# Publishing

Packages: `@bwilliamson/mdcp-core`, `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-presets` (npm). Skill carriers: `@bwilliamson/skill-*` under `packages/skill-*` (GitHub Releases only; not npm).

## Prerequisites

- npm account **`bwilliamson`** with access to publish `@bwilliamson/*`
- **2FA enabled** on npm (auth-and-writes)
- Repository secret **`RELEASE_GITHUB_TOKEN`** — maintainer PAT with permission to push to `main` and create releases (Contents + metadata). Required for the single-step release job.
- `pnpm install` at repo root

## First-time publish (chicken-and-egg)

First npm publish must happen from your machine with `npm login` before Trusted Publishing can be configured. Historical one-off steps remain in git history; routine releases use CI.

### Trusted Publishing

**Important:** The `release.yml` workflow is bound to the `release` GitHub Environment. Configure Environment protection (required reviewers) and allow **`main`** as a deployment branch.

1. Each package → **Settings** → **Trusted Publisher** → **GitHub Actions**
2. Repository: `betsalel-williamson/mdcp`
3. Workflow filename: `release.yml`

Also enable **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests** only if you still use other bots that open PRs; the release path no longer opens a Version Packages PR.

### `RELEASE_GITHUB_TOKEN`

1. Create a fine-grained PAT (or classic `repo` PAT) for the maintainer.
2. Grant Contents read/write (push commits/tags, create releases).
3. Store as repository secret **`RELEASE_GITHUB_TOKEN`**.

Without it, `pnpm release:main` cannot push the release commit to protected `main` or create GitHub Releases reliably.

## Routine releases (one step)

1. Merge feature PRs that include changesets to `main`.
2. Approve the **`release` environment** when the Release workflow waits.
3. CI runs **`pnpm release:main`**: version → sync skill frontmatter → build → commit → `changeset publish` → GitHub Releases (npm packages **and** skill carriers) → push.

There is no separate Version Packages PR.

Preview locally (consumes changesets — use a throwaway branch):

```bash
pnpm release:main --dry-run
```

Manual fallback:

```bash
pnpm run check
pnpm release:main
```

## Install surfaces

| Use case       | Command                                                    |
| -------------- | ---------------------------------------------------------- |
| Dev dependency | `npm i -D @bwilliamson/mdcp-cli @bwilliamson/mdcp-presets` |
| Global CLI     | `npm i -g @bwilliamson/mdcp-cli`                           |
| Programmatic   | `import { compileGuides } from '@bwilliamson/mdcp-core'`   |
| Agent Skills   | `npx skills add betsalel-williamson/mdcp --skill mdcp`     |

See [SECURITY.md](../../SECURITY.md) and [Security-incident triage](./security-incident-triage.md).
