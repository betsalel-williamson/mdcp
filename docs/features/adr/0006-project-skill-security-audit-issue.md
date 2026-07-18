# ADR 0006: Single project skill-security Issue with per-skill scan comments

- **Status:** Accepted
- **Date:** 2026-07-18
- **Tracking:** [#153](https://github.com/betsalel-williamson/mdcp/issues/153)
- **Depends on:** [ADR 0004](./0004-public-first-skills-audit-sync.md), [ADR 0005](./0005-skills-audit-oidc-proxy.md)

## Context

Public audit findings need a durable place for fix-or-accept-risk decisions. Opening a new Issue per skill (or per sync run) scatters triage across many threads. Fully automated accept-risk is unsafe for security posture. Maintainers want **one project-wide trail** where each sync leaves a clear, per-skill note they can update.

## Decision

Maintain **one rolling GitHub Issue for the whole repository’s published skills** as the security audit trail.

### Identity

- Title: e.g. `Security audit trail: betsalel-williamson/mdcp skills`
- Labels: `priority:P1`, `skill-security`
- Body marker: `<!-- skill-security-audit: betsalel-williamson/mdcp -->`
- Re-runs find the same open Issue via label + marker (create once if missing)

### Body vs comments

- **Issue body** — stable project-level notes: purpose, how to triage, links to skills.sh source, last-sync summary pointers. Not a per-skill checklist that is rewritten every run.
- **Comments** — **one comment per published skill per sync run**. If five skills are published, one successful sync posts five comments. Each comment covers that skill’s provider-level audit results for that scan (checklist, links, draft triage when needed). Humans update notes on those comments (edit or reply) to record accept-risk or link fix PRs.

### Comment content (per skill, per scan)

- Treat each skills.sh `audits[]` entry as one checklist item (provider-level MVP granularity).
- Include links to `https://www.skills.sh/betsalel-williamson/mdcp/{skill}/security/{providerSlug}`.
- Include a stable scan marker (for example `<!-- skill-security-scan: {slug}@{runId|timestamp} -->`) so operators can find a skill’s latest note without opening a second Issue.
- When a provider status has improved to `pass` since the prior scan, say so in that skill’s comment; do not delete prior scan comments (history stays in the thread).

### Schedule

GitHub Actions (permissions: `contents: read`, `issues: write`, `id-token: write`):

1. **Daily cron** — runs sync when a GitHub Release was published about 20–28 hours ago (post-release ≈24h without multi-hour job sleep).
2. **Weekly cron** — full sync (for example Mondays 15:00 UTC — tunable).
3. **`workflow_dispatch`** — operator-forced sync.

**Dedup:** the weekly job **skips** when a successful sync already ran earlier that **UTC calendar day** (for example the daily post-release job or a dispatch). Prefer one sync per UTC day unless an operator explicitly forces another via `workflow_dispatch` with an override input.

### Hybrid triage

- On `warn` / `fail` (or notable `riskLevel` at MEDIUM or higher) in a skill’s scan comment, automation may include a **draft** triage line (template is enough for MVP).
- Automation **must not** close the project Issue or mark accept-risk without a human.
- Humans record accept-risk rationale or link fix PRs on the relevant skill comment (or a reply to it).

### Error handling

| Case                        | Behavior                                                                          |
| --------------------------- | --------------------------------------------------------------------------------- |
| Proxy `401` / `403`         | Fail the job; do not post misleading comments                                     |
| skills.sh `404` for a skill | That skill’s comment (or job summary) notes “audits pending”; retry next schedule |
| Partial skill failures      | Continue other skills; fail the job at the end if any hard errors                 |
| Rate limit                  | Respect `Retry-After`; backoff                                                    |

## Consequences

- There is exactly one open P1 `skill-security` Issue for mdcp published skills after sync settles.
- Each sync adds one comment per skill (N skills → N comments that run); the thread is the audit trail.
- Warn/fail public audits should appear as comments within about a day of release.
- Weekly and daily crons do not double-post on the same UTC day when the daily sync already succeeded.
- Richer agent-drafted triage and native CI dual-track findings are deferred; they must still respect the human accept-risk gate.
