# skills.sh audit sync

MDCP publishes Agent Skills to [skills.sh](https://skills.sh/betsalel-williamson/mdcp). Security partners (Gen Agent Trust Hub, Socket, Snyk, and others) publish audits on each skill page. Those findings drive install-time trust but previously had no durable trail in this repository for fix-or-accept-risk decisions.

This capability syncs **published** skills.sh audit results into GitHub Issues and a committed accepted-risks log. Public skills.sh audits remain the reputation source of truth; the repository adds a maintainer workflow for triage, escalation, and formal acceptance.

Tracking: [#153](https://github.com/betsalel-williamson/mdcp/issues/153). Decisions: [ADR 0004](./adr/0004-public-first-skills-audit-sync.md), [ADR 0005](./adr/0005-skills-audit-oidc-proxy.md), [ADR 0006](./adr/0006-project-skill-security-audit-issue.md). Maintainer runbook: [skills.sh audit sync (developer)](../developer/skills-audit-sync.md). One-time Vercel project: [skills.sh audit proxy — Vercel setup](../developer/skills-audit-proxy-vercel.md).

## Scope

**Implemented:**

- Skills published under `source=betsalel-williamson/mdcp` on skills.sh (discovered via owner search through the proxy), not every on-disk `skills/` folder
- Scheduled and dispatch sync from GitHub Actions through the Vercel OIDC proxy (`SKILLS_AUDIT_PROXY_URL`, audience `mdcp-skills-audit-proxy`)
- In-flight Issue (`skill-security`, `priority:P1`), urgent Issues for **high** severity, and accepted log at `security/skills-audit-accepted.yaml` (PR-reviewed entries only)

**Out of scope:**

- Native CI scanners as a substitute for public audits (dual-track `source:ci` is deferred)
- Blocking GitHub Release or npm publish until skills.sh audits are ready
- Scraping partner HTML detail pages for fine-grained finding IDs
- Trackers other than GitHub Issues

## Contracts

### Fingerprint

Stable finding identity (provider-level MVP granularity; one row per skills.sh `audits[]` entry). Ignores lone `auditedAt` churn. Implemented as canonical JSON over:

```text
{skill, providerSlug, status, summary, riskLevel}
```

(`scripts/skills-audit-sync/src/fingerprint.ts`.)

### Triage

Severity mapping for **new** findings (`scripts/skills-audit-sync/src/triage.ts`):

| Input (status / riskLevel)          | Level      |
| ----------------------------------- | ---------- |
| `pass`                              | —          |
| `fail`, or `HIGH` / `CRITICAL` risk | **high**   |
| `warn`, or `MEDIUM` risk (not high) | **medium** |
| other non-pass                      | **low**    |

Classification (`scripts/skills-audit-sync/src/classify.ts`):

| Classification  | Outcome                                                         |
| --------------- | --------------------------------------------------------------- |
| Accepted in log | Quiet ack; no re-alert spam                                     |
| In-flight       | Still assessing or in progress on the in-flight Issue           |
| New → **high**  | Dedicated urgent Issue + in-flight note                         |
| New → med / low | In-flight register only (+ change comment when new or worsened) |

Material change to a previously accepted fingerprint requires re-triage.

### State stores

| Store                                 | Holds                                            |
| ------------------------------------- | ------------------------------------------------ |
| In-flight Issue                       | New, assessing, and in-progress risks; sync meta |
| `security/skills-audit-accepted.yaml` | Formally accepted risks only (PR-reviewed)       |
| Urgent Issues                         | Separate Issues for **high** triage work         |

Accepted entries require `fingerprint`, `source`, `risk`, `date`, `reason`, and `accepter` (email). Top-level YAML: `version: 1`, `accepted: []`. Field definitions: [maintainer runbook — Accept a risk](../developer/skills-audit-sync.md#accept-a-risk). Loaded by `loadAcceptedFingerprints` in `scripts/skills-audit-sync/`.

### Proxy contract

GitHub Actions calls the Vercel deployment at `SKILLS_AUDIT_PROXY_URL` with a GitHub Actions OIDC JWT (`Authorization: Bearer …`, audience `mdcp-skills-audit-proxy`, repository `betsalel-williamson/mdcp`). The proxy verifies that JWT, mints a short-lived Vercel OIDC token (`@vercel/oidc`), and forwards to skills.sh. Vercel tokens are never returned to callers.

| Proxy route              | Upstream                                                                 | Response                                              |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| `GET /api/skills`        | skills.sh search by owner, filtered to `source=betsalel-williamson/mdcp` | `200` JSON with `data[]` skill summaries              |
| `GET /api/audit/{skill}` | skills.sh audit for `betsalel-williamson/mdcp/{skill}`                   | `200` audit JSON; `404` when audits are not ready yet |

Auth failures: `401` / `403`. Upstream `429` / `503` propagate with `Retry-After` when present. Issue updates and classification run in GitHub Actions — not in the proxy. Deploy: [Vercel proxy setup](../developer/skills-audit-proxy-vercel.md).

### Schedules

- **Post-release:** daily job ~20–28h after a `v*` release (skills.sh re-audit lag: minutes to ~1 day); exits 0 without updating `last_successful_sync_at` when no release is in window
- **Weekly:** full sync candidate (Monday 06:00 UTC cron)
- **Spacing:** ~24h minimum between successful syncs via `shouldSkipScheduledSync` (default 24h); daily and weekly must not double-hit. `workflow_dispatch` may bypass with `force: true`.
- **`workflow_dispatch`:** force sync; may override spacing

Implemented in [`.github/workflows/skills-audit-sync.yml`](../../.github/workflows/skills-audit-sync.yml) via `pnpm skills-audit:sync`.

## Acceptance criteria

1. Sync reads published audits for `betsalel-williamson/mdcp` skills only (via proxy), not unpublished on-disk packs.
2. Each finding is classified by fingerprint against the accepted log and in-flight Issue per ADR 0006.
3. **High** findings produce or update dedicated urgent Issues; medium/low stay on the in-flight Issue.
4. Accepted risks are recorded only via reviewed PRs to `security/skills-audit-accepted.yaml` with required fields — automation never auto-accepts.
5. Successful syncs respect ~24h spacing unless an operator forces `workflow_dispatch`.
6. Proxy auth failures fail the job without rewriting registers; skills.sh `404` is retried on the next eligible sync.
7. Maintainer runbook and SECURITY policy link this feature; release checklist notes post-release audit lag.

## Related docs

- [skills.sh audit sync (maintainer runbook)](../developer/skills-audit-sync.md)
- [skills.sh audit proxy — Vercel setup](../developer/skills-audit-proxy-vercel.md)
- [Agent Skill](./agent-skill.md) — consumer install and skills.sh publication
- [SECURITY.md](../../SECURITY.md) — private vulnerability reporting vs published audit trail
