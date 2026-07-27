# skills.sh audit sync (maintainer runbook)

Published partner audits on [skills.sh](https://skills.sh/betsalel-williamson/mdcp) are the public trust source of truth for install-time reputation. This repository mirrors those findings into GitHub Issues and a committed accepted-risks log so maintainers can fix, track, or formally accept risk without relying on the skills.sh UI alone.

Tracking: [#153](https://github.com/betsalel-williamson/mdcp/issues/153). Architecture: [ADR 0004](../features/adr/0004-public-first-skills-audit-sync.md), [ADR 0005](../features/adr/0005-skills-audit-oidc-proxy.md), [ADR 0006](../features/adr/0006-project-skill-security-audit-issue.md). Product contracts: [skills.sh audit sync](../features/skills-audit-sync.md).

- **One-time Vercel project:** [skills.sh audit proxy — Vercel setup](./skills-audit-proxy-vercel.md)
- **Day-to-day sync / triage / accept-risk:** this runbook

## What sync does

On each successful run, automation:

1. Calls the monorepo Vercel proxy (GitHub Actions OIDC → proxy → skills.sh audit API) for skills published under `source=betsalel-williamson/mdcp`.
2. Classifies each finding fingerprint against the accepted log and the in-flight Issue.
3. Updates the in-flight Issue, opens or updates urgent Issues for **high** severity, and records sync metadata.

The proxy is auth gate + OIDC mint + forward only — classification and Issue writes stay in this repository.

## One-time setup

Complete once before scheduled sync can succeed:

1. Deploy the proxy and set `SKILLS_AUDIT_PROXY_URL` — follow [Vercel proxy setup](./skills-audit-proxy-vercel.md) end to end (Import Git, Root Directory, build settings, OIDC Federation, labels, smoke checks).
2. Confirm labels **`skill-security`** and **`priority:P1`** exist.

You should not need that guide again unless the Vercel project is rebuilt or the production URL changes (then update the GitHub Actions variable).

## Regular tasks

### After a release

```text
GitHub Release (v*)
  → skills.sh re-audits (minutes … ~1 day)
  → Daily job (~20–28h after release) calls the Vercel proxy
  → Classification updates the in-flight Issue (and urgent Issues for high)
```

Releases are **not** gated on skills.sh audit readiness. Prefer waiting for the daily window; use a forced sync only if you need earlier visibility.

### Force a sync

Actions → **Skills audit sync** → **Run workflow** → set `force: true` when you must bypass ~24h spacing (first production sync, config change, or urgent re-check).

### Triage in-flight findings

Open the rolling Issue titled `Security audit trail: betsalel-williamson/mdcp skills` (labels `priority:P1`, `skill-security`). Review change comments and the in-flight register. High findings also get dedicated urgent Issues.

### Accept a risk

Formal accept is a **durable product decision** in git. Automation must not invent acceptances.

1. Open a PR that adds an entry to [`security/skills-audit-accepted.yaml`](../../security/skills-audit-accepted.yaml).
2. Use this top-level shape and required fields:

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
| `risk`        | Human-readable summary                                     |
| `date`        | When accepted (ISO 8601 date or datetime)                  |
| `reason`      | Why the risk is accepted                                   |
| `accepter`    | Email of the person who accepted                           |

Merge after review. The next sync treats matching fingerprints as accepted (no re-alert spam).

### Local / CI commands

```bash
pnpm skills-audit:sync
pnpm --filter @bwilliamson/mdcp-skills-audit-sync test
pnpm --filter @bwilliamson/mdcp-skills-audit-sync run typecheck
pnpm --filter @bwilliamson/mdcp-skills-audit-proxy test
```

## Schedules (reference)

| Trigger               | When it runs                                                                |
| --------------------- | --------------------------------------------------------------------------- |
| **Daily**             | If a Release was published ~20–28h ago → run sync (else no-op for that arm) |
| **Weekly**            | Full sync candidate                                                         |
| **workflow_dispatch** | Force sync; `force: true` bypasses spacing                                  |

**Spacing:** skip any scheduled sync when a **successful** sync ran within the last **~24 hours**. `last_successful_sync_at` lives in in-flight Issue meta.

Workflow: [`.github/workflows/skills-audit-sync.yml`](../../.github/workflows/skills-audit-sync.yml).

## Classification

Each finding is identified by a **fingerprint** (stable identity; ignores lone `auditedAt` churn):

```text
{skill, providerSlug, status, summary, riskLevel}
```

(`scripts/skills-audit-sync/src/fingerprint.ts`.)

### Severity triage

| Input (status / riskLevel)          | Triage                              |
| ----------------------------------- | ----------------------------------- |
| `pass`                              | — (no triage; register-only if new) |
| `fail`, or `HIGH` / `CRITICAL` risk | **high**                            |
| `warn`, or `MEDIUM` risk (not high) | **medium**                          |
| other non-pass                      | **low**                             |

| State                         | Action                                                           |
| ----------------------------- | ---------------------------------------------------------------- |
| **Accepted** in log           | Acknowledge quietly; update last-seen if useful; no urgency spam |
| **In-flight** on Issue        | Note still assessing or in progress                              |
| **Never seen** → **high**     | Create or update a dedicated urgent Issue + in-flight note       |
| **Never seen** → medium / low | In-flight register only (+ change comment when new or worsened)  |

Unchanged in-flight findings: bump `last-seen` only — **no** new comment. Cleared on skills.sh: remove from in-flight; post a change note. If a previously **accepted** fingerprint **changes** materially, treat as new (needs re-triage).

### In-flight Issue identity

- Title: `Security audit trail: betsalel-williamson/mdcp skills`
- Labels: `priority:P1`, `skill-security`
- Body marker: `<!-- skill-security-audit: betsalel-williamson/mdcp -->`
- Meta / register blocks: `<!-- skills-audit-meta ... -->` and `<!-- skills-audit-in-flight ... -->`

## Configuration (reference)

| Setting / secret / var                                 | Purpose                                                   |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `SKILLS_AUDIT_PROXY_URL`                               | Repository variable — public base URL of the Vercel proxy |
| `SKILLS_AUDIT_TRIGGER`                                 | Set by workflow: `daily`, `weekly`, or `dispatch`         |
| `SKILLS_AUDIT_FORCE`                                   | `1` on `workflow_dispatch` when `force: true`             |
| `GITHUB_TOKEN`                                         | Issue search/create/update and release window lookup      |
| OIDC audience                                          | `mdcp-skills-audit-proxy`                                 |
| `id-token: write` / `issues: write` / `contents: read` | Workflow permissions                                      |

### Proxy contract

Base URL: `SKILLS_AUDIT_PROXY_URL`. Every route requires `Authorization: Bearer <github-actions-oidc-jwt>` with audience `mdcp-skills-audit-proxy` and repository claim `betsalel-williamson/mdcp`.

| Route                    | Success          | Upstream                                                              |
| ------------------------ | ---------------- | --------------------------------------------------------------------- |
| `GET /api/skills`        | `200` JSON       | skills.sh owner search, filtered to `source=betsalel-williamson/mdcp` |
| `GET /api/audit/{skill}` | `200` audit JSON | `GET /api/v1/skills/audit/betsalel-williamson/mdcp/{skill}`           |

Proxy-only errors: `401` / `403` / `405`. Upstream `404` / `429` / `503` pass through with `Retry-After` when present. Never returns Vercel OIDC tokens. Deploy: [Vercel setup](./skills-audit-proxy-vercel.md).

### Sync library modules

| Module           | Export                          | Role                                       |
| ---------------- | ------------------------------- | ------------------------------------------ |
| `fingerprint.ts` | `fingerprint(finding)`          | Stable identity string                     |
| `triage.ts`      | `triageFinding(finding)`        | `high` / `medium` / `low` / `null`         |
| `classify.ts`    | `classifyFinding(...)`          | `accepted` / `in_flight` / `new` + triage  |
| `spacing.ts`     | `shouldSkipScheduledSync(...)`  | ~24h between successful scheduled syncs    |
| `acceptedLog.ts` | `loadAcceptedFingerprints(...)` | Read accepted fingerprints from YAML       |
| `github.ts`      | Issue upsert helpers            | In-flight + urgent Issue body parse/render |
| `proxy.ts`       | OIDC + proxy fetch              | `/api/skills`, `/api/audit/{slug}`         |
| `run.ts`         | `runSync(...)`                  | GitHub Actions entrypoint                  |

## Error handling

| Case                        | Behavior                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| Proxy `401` / `403`         | Fail the job; do not rewrite registers or post misleading events  |
| skills.sh `404` for a skill | Meta notes “audits pending”; retry next eligible sync             |
| Partial skill failures      | Continue other skills; fail the job at the end if any hard errors |
| Rate limit                  | Respect `Retry-After`; backoff                                    |

## Related docs

- [Vercel proxy setup (one-time)](./skills-audit-proxy-vercel.md)
- [skills.sh audit sync (feature)](../features/skills-audit-sync.md)
- [Agent Skill development](./agent-skill.md)
- [Versioning and releases](./versioning-and-releases.md)
- [SECURITY.md](../../SECURITY.md)
