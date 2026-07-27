# skills.sh audit proxy — Vercel setup (one-time)

One-time creation of the Hobby Vercel project that hosts [`packages/mdcp-skills-audit-proxy`](../../packages/mdcp-skills-audit-proxy/). Day-to-day sync ops live in [skills.sh audit sync (maintainer runbook)](./skills-audit-sync.md). Architecture: [ADR 0005](../features/adr/0005-skills-audit-oidc-proxy.md).

Do **not** invent or document a production URL until deploy assigns one.

## Before you start

- Vercel account on the team that will own the proxy (Hobby is enough)
- Access to import GitHub repo **`betsalel-williamson/mdcp`**
- Permission to set GitHub Actions **variables** and create Issue labels on that repo

## 1. Templates — import Git, do not use a framework template

1. Sign in at [vercel.com](https://vercel.com).
2. **Add New… → Project**.
3. Under **Import Git Repository**, choose **GitHub** and select **`betsalel-williamson/mdcp`**.
   - If the repo is missing, connect the GitHub app / grant access, then refresh.
4. **Do not** pick a Marketplace or starter **template** (Next.js blog, etc.). This app is the monorepo package with serverless routes under `api/` — Import Git only.

Optional later: CLI-only link (`cd packages/mdcp-skills-audit-proxy && vercel link`) instead of dashboard import; dashboard + Git is preferred so production tracks `main`.

## 2. Application presets (framework)

On the **Configure Project** screen (or later under **Settings → Build and Deployment**):

| Field                | Value                                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| **Framework Preset** | **Other** (not Next.js, not Vite)                                                |
| **Project Name**     | e.g. `mdcp-skills-audit-proxy` (any unique name; used in the `*.vercel.app` URL) |

Leave “Include files outside the Root Directory” **off** — the proxy package is self-contained (no workspace deps at runtime).

## 3. Root Directory

| Field              | Value                              |
| ------------------ | ---------------------------------- |
| **Root Directory** | `packages/mdcp-skills-audit-proxy` |

Edit (pencil) → enter that path → continue. Vercel installs and builds only from that folder (`vercel.json` and `api/**/*.ts` live there).

## 4. Build and output settings

Override Framework defaults so Vercel does not look for a static `dist/` site:

| Field                | Value                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Build Command**    | leave **empty** (or clear override) — serverless `api/` routes compile without an app build |
| **Output Directory** | leave **empty**                                                                             |
| **Install Command**  | `pnpm install` (packageManager is pnpm; do not use `npm install` unless you must)           |
| **Node.js Version**  | **22.x** or **24.x** (must be ≥ 18; match CI when practical)                                |

Ignored Build Step (optional cost save): under **Settings → Build and Deployment → Ignored Build Step**, choose **Only build if there are changes in a folder** and set `packages/mdcp-skills-audit-proxy` so unrelated monorepo pushes skip proxy rebuilds.

## 5. Environment variables

In **Configure Project → Environment Variables**, or after create under **Settings → Environment Variables**:

| Name            | Value                     | Environments                                  | Required?                                                                       |
| --------------- | ------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| `OIDC_AUDIENCE` | `mdcp-skills-audit-proxy` | Production (and Preview if you test previews) | No — code defaults to this; set explicitly so dashboard and GitHub stay aligned |

**Do not** add:

- skills.sh API keys or long-lived secrets (skills.sh auth is Vercel OIDC at runtime)
- GitHub PATs for the proxy
- `VERCEL_OIDC_TOKEN` as a hand-managed secret (Vercel injects OIDC when Federation is on)

## 6. Deployment

1. Click **Deploy**. Wait for the Production deployment to succeed.
2. Open the deployment → copy the **base URL** (e.g. `https://mdcp-skills-audit-proxy.vercel.app`) with **no trailing slash**.
3. Enable **OIDC Federation** (required for skills.sh):
   - Project → **Settings → Security**
   - **OIDC Federation** — turn **on** (label may read “Secure … access with OIDC Federation”)
   - Prefer **Team** issuer mode when available
   - Save; redeploy Production if the toggle was off on the first deploy so functions pick up OIDC
4. Confirm `api/skills` and `api/audit/[skill]` appear as Serverless Functions on the deployment.

CLI alternative (same Root Directory settings after `vercel link`):

```bash
cd packages/mdcp-skills-audit-proxy
vercel link          # select the Git-connected project
vercel env pull      # optional local .env.local — do not commit
vercel deploy --prod
```

## 7. Wire GitHub Actions + labels

1. In GitHub **`betsalel-williamson/mdcp`** → **Settings → Secrets and variables → Actions → Variables**: set `SKILLS_AUDIT_PROXY_URL` to the Vercel base URL from step 6.
2. Ensure labels **`skill-security`** and **`priority:P1`** exist (the sync job creates the in-flight Issue with both).

Automation names: `SKILLS_AUDIT_PROXY_URL`, OIDC audience `mdcp-skills-audit-proxy`, `SKILLS_AUDIT_FORCE` (`1` when `workflow_dispatch` runs with `force: true`).

## 8. One-time smoke checks

After deploy and variable setup:

| Check                                                                 | Expected                                                        |
| --------------------------------------------------------------------- | --------------------------------------------------------------- |
| Unauthenticated `GET {SKILLS_AUDIT_PROXY_URL}/api/skills` (no Bearer) | `401` — missing or invalid GitHub OIDC                          |
| Actions → **Skills audit sync** → **Run workflow** → `force: true`    | Job succeeds; in-flight Issue created or updated with sync meta |

Then use the [maintainer runbook](./skills-audit-sync.md) for ongoing sync, triage, and accept-risk PRs.

## Related

- [skills.sh audit sync (maintainer runbook)](./skills-audit-sync.md)
- [proxy package README](../../packages/mdcp-skills-audit-proxy/README.md)
- [skills.sh audit sync (feature)](../features/skills-audit-sync.md)
