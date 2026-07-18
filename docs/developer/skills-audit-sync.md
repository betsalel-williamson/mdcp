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

**Spacing:** skip any scheduled sync when a **successful** sync ran within the last **~24 hours** (`last_successful_sync_at > now - 24h`, default 24h). This prevents daily and weekly from both running on the same day. `last_successful_sync_at` is recorded in in-flight Issue meta (or an equivalent durable place the job reads).

Operators may use `workflow_dispatch` to force a run when spacing would otherwise skip.

## Classification

Each finding is identified by a **fingerprint** (stable identity; ignores lone `auditedAt` churn):

```text
{skill, providerSlug, status, summary, riskLevel}
```

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
2. Each entry **must** include:

| Field         | Meaning                                                    |
| ------------- | ---------------------------------------------------------- |
| `fingerprint` | Stable finding identity ([fingerprint](#classification))   |
| `source`      | Where the risk came from (skills.sh, provider, skill slug) |
| `risk`        | Human-readable summary (may echo fingerprint fields)       |
| `date`        | When accepted (ISO 8601 date or datetime)                  |
| `reason`      | Why the risk is accepted                                   |
| `accepter`    | Email of the person who accepted                           |

Merge after review. Sync reads this file before alerting; matching fingerprints are treated as accepted.

## Configuration

GitHub Actions (when sync ships):

| Setting / secret         | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `SKILLS_AUDIT_PROXY_URL` | Public base URL of the Vercel proxy deployment                  |
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
