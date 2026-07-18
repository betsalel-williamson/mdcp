# skills.sh audit sync (maintainer runbook)

Published partner audits on [skills.sh](https://skills.sh/betsalel-williamson/mdcp) are the public trust source of truth for install-time reputation. This repository mirrors those findings into GitHub Issues and a committed accepted-risks log so maintainers can fix, track, or formally accept risk without relying on the skills.sh UI alone.

Tracking: [#153](https://github.com/betsalel-williamson/mdcp/issues/153). Architecture: [ADR 0004](../features/adr/0004-public-first-skills-audit-sync.md), [ADR 0005](../features/adr/0005-skills-audit-oidc-proxy.md), [ADR 0006](../features/adr/0006-project-skill-security-audit-issue.md). Product contracts: [skills.sh audit sync](../features/skills-audit-sync.md).

## What sync does

On each successful run, automation:

1. Calls the monorepo Vercel proxy (GitHub Actions OIDC → proxy → skills.sh audit API) for skills published under `source=betsalel-williamson/mdcp`.
2. Classifies each finding fingerprint against the accepted log and the in-flight Issue.
3. Updates the in-flight Issue, opens or updates urgent Issues for **high** severity, and records sync metadata.

The proxy is auth gate + OIDC mint + forward only — classification and Issue writes stay in this repository.

## Schedules

### After a release

```text
GitHub Release (v*)
  → skills.sh re-audits (minutes … ~1 day)
  → Daily job (~20–28h after release) calls the Vercel proxy
  → Classification flow (below)
```

Releases are **not** gated on skills.sh audit readiness. Audit latency is handled with retries and the post-release sync window.

### Cron

| Trigger               | When it runs                                                                |
| --------------------- | --------------------------------------------------------------------------- |
| **Daily**             | If a Release was published ~20–28h ago → run sync (else no-op for that arm) |
| **Weekly**            | Full sync candidate                                                         |
| **workflow_dispatch** | Force sync; may override spacing (below)                                    |

**Spacing:** skip any scheduled sync when a **successful** sync ran within the last **~24 hours** (`shouldSkipScheduledSync(lastSuccessfulSyncAt, now)` with default `minIntervalMs = 24h`). Equivalent rule: skip when `last_successful_sync_at > now - 24h`. This prevents daily and weekly from both running on the same day. `last_successful_sync_at` is recorded in in-flight Issue meta (or an equivalent durable place the job reads). `workflow_dispatch` may pass `force: true` to bypass spacing.

Operators may use `workflow_dispatch` to force a run when spacing would otherwise skip.

## Classification

Each finding is identified by a **fingerprint** (stable identity; ignores lone `auditedAt` churn). The sync library computes it as canonical JSON over:

```text
{skill, providerSlug, status, summary, riskLevel}
```

(`scripts/skills-audit-sync/src/fingerprint.ts` — `auditedAt` is ignored.)

### Severity triage

Before classification, unseen findings are triaged (`scripts/skills-audit-sync/src/triage.ts`):

| Input (status / riskLevel)          | Triage                              |
| ----------------------------------- | ----------------------------------- |
| `pass`                              | — (no triage; register-only if new) |
| `fail`, or `HIGH` / `CRITICAL` risk | **high**                            |
| `warn`, or `MEDIUM` risk (not high) | **medium**                          |
| other non-pass                      | **low**                             |

For each fingerprint from the proxy / skills.sh API:

| State                         | Action                                                           |
| ----------------------------- | ---------------------------------------------------------------- |
| **Accepted** in log           | Acknowledge quietly; update last-seen if useful; no urgency spam |
| **In-flight** on Issue        | Note still assessing or in progress                              |
| **Never seen** → **high**     | Create or update a dedicated urgent Issue + in-flight note       |
| **Never seen** → medium / low | In-flight register only (+ change comment when new or worsened)  |

Unchanged in-flight findings: bump `last-seen` only — **no** new comment. Cleared on skills.sh: remove from in-flight; post a change note. If a previously **accepted** fingerprint **changes** materially, treat as new (needs re-triage); do not silently keep the old acceptance.

Change comments (events only) include a human-readable summary, skills.sh link, and suggested next steps.

## In-flight Issue

- Title pattern: `Security audit trail: betsalel-williamson/mdcp skills`
- Labels: `priority:P1`, `skill-security`
- Body marker: `<!-- skill-security-audit: betsalel-williamson/mdcp -->`
- Re-runs find the same open Issue via label + marker (create once if missing)
- Body holds the **in-flight** register and meta (last successful sync, triage instructions) — not the accepted log

## Accepting a risk

Formal accept is a **durable product decision** and belongs in git. Automation must not invent acceptances.

1. Open a PR that adds an entry to [`security/skills-audit-accepted.yaml`](../../security/skills-audit-accepted.yaml).
1. Use this top-level shape and required fields:

```yaml
version: 1
accepted:
  - fingerprint: <stable finding identity from sync library>
    source: skills.sh/<provider>/<skill>
    risk: <human-readable summary>
    date: <ISO 8601 date or datetime>
    reason: <why accepted>
    accepter: <email>
```

| Field         | Meaning                                                    |
| ------------- | ---------------------------------------------------------- |
| `fingerprint` | Stable finding identity ([fingerprint](#classification))   |
| `source`      | Where the risk came from (skills.sh, provider, skill slug) |
| `risk`        | Human-readable summary (may echo fingerprint fields)       |
| `date`        | When accepted (ISO 8601 date or datetime)                  |
| `reason`      | Why the risk is accepted                                   |
| `accepter`    | Email of the person who accepted                           |

Merge after review. Sync reads this file via `loadAcceptedFingerprints` (`scripts/skills-audit-sync/src/acceptedLog.ts`) before alerting; matching fingerprints are treated as accepted.

### Sync library (as-built)

Pure helpers under [`scripts/skills-audit-sync/`](../../scripts/skills-audit-sync/):

| Module           | Export                          | Role                                            |
| ---------------- | ------------------------------- | ----------------------------------------------- |
| `fingerprint.ts` | `fingerprint(finding)`          | Stable identity string                          |
| `triage.ts`      | `triageFinding(finding)`        | `high` / `medium` / `low` / `null`              |
| `classify.ts`    | `classifyFinding(...)`          | `accepted` / `in_flight` / `new` + triage       |
| `spacing.ts`     | `shouldSkipScheduledSync(...)`  | Enforce ~24h between successful scheduled syncs |
| `acceptedLog.ts` | `loadAcceptedFingerprints(...)` | Read accepted fingerprints from YAML            |
| `github.ts`      | Issue upsert helpers            | In-flight + urgent Issue body parse/render      |
| `proxy.ts`       | OIDC + proxy fetch              | `/api/skills`, `/api/audit/{slug}`              |
| `run.ts`         | `runSync(...)`                  | GitHub Actions entrypoint                       |

```bash
pnpm skills-audit:sync
pnpm --filter @bwilliamson/mdcp-skills-audit-sync test
pnpm --filter @bwilliamson/mdcp-skills-audit-sync run typecheck
```

Workflow: [`.github/workflows/skills-audit-sync.yml`](../../.github/workflows/skills-audit-sync.yml) — weekly cron (Monday 06:00 UTC), daily cron (06:00 UTC), and `workflow_dispatch` with optional `force`. The job sets `SKILLS_AUDIT_TRIGGER` (`daily` | `weekly` | `dispatch`) and reads `SKILLS_AUDIT_PROXY_URL` from repository variables.

In-flight Issue body stores machine-readable meta and register blocks:

```text
<!-- skills-audit-meta
last_successful_sync_at: <ISO-8601>
audits_pending: <comma-separated skill slugs>
-->
<!-- skills-audit-in-flight
[ ... JSON entries ... ]
-->
```

## Configuration

GitHub Actions ([`skills-audit-sync.yml`](../../.github/workflows/skills-audit-sync.yml)):

| Setting / secret / var   | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `SKILLS_AUDIT_PROXY_URL` | Repository variable — public base URL of the Vercel proxy       |
| `SKILLS_AUDIT_TRIGGER`   | Set by workflow: `daily`, `weekly`, or `dispatch`               |
| `SKILLS_AUDIT_FORCE`     | `1` on `workflow_dispatch` when `force: true` (bypass spacing)  |
| `GITHUB_TOKEN`           | Issue search/create/update and release window lookup            |
| OIDC audience            | `mdcp-skills-audit-proxy` (configured on proxy + job)           |
| `id-token: write`        | Mint GitHub Actions OIDC JWT for the proxy                      |
| `issues: write`          | Update in-flight and urgent Issues                              |
| `contents: read`         | Read accepted log (write only if a future bot opens accept PRs) |

### Proxy contract (as-built)

Base URL: `SKILLS_AUDIT_PROXY_URL` (Vercel deployment of `packages/mdcp-skills-audit-proxy`). Every route requires `Authorization: Bearer <github-actions-oidc-jwt>` with audience `mdcp-skills-audit-proxy` and repository claim `betsalel-williamson/mdcp`.

| Route                    | Success                   | Upstream                                                                            | Notes                                                                 |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `GET /api/skills`        | `200` JSON search results | `GET /api/v1/skills/search?owner=betsalel-williamson&q=mdcp&limit=200` on skills.sh | Response `data[]` filtered to `source=betsalel-williamson/mdcp` only  |
| `GET /api/audit/{skill}` | `200` audit JSON          | `GET /api/v1/skills/audit/betsalel-williamson/mdcp/{skill}`                         | `{skill}` is the skills.sh slug (for example `mdcp`, `mdcp-doc-only`) |

Proxy-only errors: `401` missing/invalid GitHub OIDC; `403` wrong repository; `405` non-GET. Upstream `404` (audits pending), `429`, and `503` pass through with `Retry-After` when present. The proxy never returns Vercel OIDC tokens.

Deploy and OIDC Federation: [proxy README](../../packages/mdcp-skills-audit-proxy/README.md). Architecture: [ADR 0005](../features/adr/0005-skills-audit-oidc-proxy.md).

## First-time deploy (human ops)

The sync workflow and proxy code ship in this repository; **production deploy is a maintainer step**. Do not invent or document a Vercel URL until after deploy assigns one. Package overview: [proxy README](../../packages/mdcp-skills-audit-proxy/README.md).

Complete the checklist below once before scheduled sync can succeed. Hobby / free tier is enough (ADR 0005).

### 1. Templates — import Git, do not use a framework template

1. Sign in at [vercel.com](https://vercel.com) (same team/account that will own the proxy).
2. **Add New… → Project**.
3. Under **Import Git Repository**, choose **GitHub** and select **`betsalel-williamson/mdcp`**.
   - If the repo is missing, connect the GitHub app / grant access to that organization or account, then refresh.
4. **Do not** pick a Marketplace or starter **template** (Next.js blog, etc.). This app is the existing monorepo package with serverless routes under `api/` — Import Git only.

Optional later: CLI-only link (`cd packages/mdcp-skills-audit-proxy && vercel link`) instead of dashboard import; dashboard + Git is preferred so production tracks `main`.

### 2. Application presets (framework)

On the **Configure Project** screen (or later under **Settings → Build and Deployment**):

| Field                | Value                                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| **Framework Preset** | **Other** (not Next.js, not Vite)                                                |
| **Project Name**     | e.g. `mdcp-skills-audit-proxy` (any unique name; used in the `*.vercel.app` URL) |

Leave “Include files outside the Root Directory” **off** — the proxy package is self-contained (no workspace deps at runtime).

### 3. Root Directory

| Field              | Value                              |
| ------------------ | ---------------------------------- |
| **Root Directory** | `packages/mdcp-skills-audit-proxy` |

Edit (pencil) → enter that path → continue. Vercel will only install and build from that folder (`vercel.json` and `api/**/*.ts` live there).

### 4. Build and output settings

Override Framework defaults so Vercel does not look for a static `dist/` site:

| Field                | Value                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Build Command**    | leave **empty** (or clear override) — serverless `api/` routes compile without an app build |
| **Output Directory** | leave **empty**                                                                             |
| **Install Command**  | `pnpm install` (packageManager is pnpm; do not use `npm install` unless you must)           |
| **Node.js Version**  | **22.x** or **24.x** (must be ≥ 18; match CI when practical)                                |

Ignored Build Step (optional cost save): under **Settings → Build and Deployment → Ignored Build Step**, you may choose **Only build if there are changes in a folder** and set `packages/mdcp-skills-audit-proxy` so unrelated monorepo pushes skip proxy rebuilds.

### 5. Environment variables

In **Configure Project → Environment Variables**, or after create under **Settings → Environment Variables**:

| Name            | Value                     | Environments                                  | Required?                                                                       |
| --------------- | ------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| `OIDC_AUDIENCE` | `mdcp-skills-audit-proxy` | Production (and Preview if you test previews) | No — code defaults to this; set explicitly so dashboard and GitHub stay aligned |

**Do not** add:

- skills.sh API keys or long-lived secrets (skills.sh auth is Vercel OIDC at runtime)
- GitHub PATs for the proxy
- `VERCEL_OIDC_TOKEN` as a hand-managed secret (Vercel injects OIDC when Federation is on)

### 6. Deployment

1. Click **Deploy**. Wait for the Production deployment to succeed.
2. Open the deployment → copy the **base URL** (e.g. `https://mdcp-skills-audit-proxy.vercel.app`) with **no trailing slash**.
3. Enable **OIDC Federation** (required for skills.sh):
   - Project → **Settings → Security**
   - **OIDC Federation** — turn **on** (Vercel Settings → Security; label may read “Secure … access with OIDC Federation”)
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

### 7. Wire GitHub Actions + labels

1. In GitHub **`betsalel-williamson/mdcp`** → **Settings → Secrets and variables → Actions → Variables**: set `SKILLS_AUDIT_PROXY_URL` to the Vercel base URL from step 6.
2. Ensure labels **`skill-security`** and **`priority:P1`** exist (sync creates the in-flight Issue with both).
3. Run smoke tests below (`workflow_dispatch` with `force: true`).

Automation names (reference): `SKILLS_AUDIT_PROXY_URL`, OIDC audience `mdcp-skills-audit-proxy`, `SKILLS_AUDIT_FORCE` (`1` when dispatch runs with `force: true`).

## Smoke tests

After deploy and variable setup:

| Check                                                                 | Expected                                                              |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Unauthenticated `GET {SKILLS_AUDIT_PROXY_URL}/api/skills` (no Bearer) | `401` — missing or invalid GitHub OIDC                                |
| Actions → **Skills audit sync** → **Run workflow** → `force: true`    | Job succeeds; in-flight Issue created or updated with sync meta       |
| PR merging an entry into `security/skills-audit-accepted.yaml`        | Next sync treats matching fingerprints as accepted (no re-alert spam) |

Use `workflow_dispatch` with `force: true` for the first production sync or to bypass ~24h spacing after config changes.

## Error handling

| Case                        | Behavior                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| Proxy `401` / `403`         | Fail the job; do not rewrite registers or post misleading events  |
| skills.sh `404` for a skill | Meta notes “audits pending”; retry next eligible sync             |
| Partial skill failures      | Continue other skills; fail the job at the end if any hard errors |
| Rate limit                  | Respect `Retry-After`; backoff                                    |

## Related docs

- [skills.sh audit sync (feature)](../features/skills-audit-sync.md) — capability and acceptance criteria
- [Agent Skill development](./agent-skill.md) — publishing and skills.sh policy
- [Versioning and releases](./versioning-and-releases.md) — release checklist and post-release audit window
- [SECURITY.md](../../SECURITY.md) — vulnerability reporting vs published audit trail
