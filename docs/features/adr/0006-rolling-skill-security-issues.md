# ADR 0006: Rolling per-skill security audit Issues

- **Status:** Accepted
- **Date:** 2026-07-18
- **Tracking:** [#153](https://github.com/betsalel-williamson/mdcp/issues/153)
- **Depends on:** [ADR 0004](./0004-public-first-skills-audit-sync.md), [ADR 0005](./0005-skills-audit-oidc-proxy.md)

## Context

Public audit findings need a durable place for fix-or-accept-risk decisions. Opening a new Issue per sync run creates noise. Closing Issues automatically when a partner flips to `pass` erases trail history. Fully automated accept-risk is unsafe for security posture.

## Decision

Maintain **one rolling GitHub Issue per published skill** as the ongoing security audit trail.

### Identity

- Title: `Security audit trail: {slug}`
- Labels: `priority:P1`, `skill-security`, `skill:<slug>`
- Optional body marker: `<!-- skill-security-audit: {slug} -->`
- Re-runs find the same open Issue via labels and/or marker

### Content

- Treat each skills.sh `audits[]` entry as one checklist item (provider-level MVP granularity).
- Stable item key: `{providerSlug}:{auditedAt}` (or a hash of provider, status, and summary).
- New keys add an unchecked item linking to `https://www.skills.sh/betsalel-williamson/mdcp/{skill}/security/{providerSlug}`.
- Unchanged keys keep human disposition.
- When status improves to `pass`, comment that it cleared on skills.sh; do not delete history.

### Schedule

GitHub Actions (permissions: `contents: read`, `issues: write`, `id-token: write`):

1. Weekly cron (for example Mondays 15:00 UTC — tunable).
2. Daily cron that runs sync when a GitHub Release was published about 20–28 hours ago (post-release ≈24h without multi-hour job sleep).
3. `workflow_dispatch` for operator-forced sync.

### Hybrid triage

- On new or changed `warn` / `fail` (or notable `riskLevel` at MEDIUM or higher), automation may post a **draft** triage comment (template is enough for MVP).
- Automation **must not** close the rolling Issue or mark accept-risk without a human.
- Humans record accept-risk rationale or link fix PRs on the Issue.

### Error handling

| Case                   | Behavior                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| Proxy `401` / `403`    | Fail the job; do not create misleading Issues                     |
| skills.sh `404`        | Record “audits pending”; retry on next schedule                   |
| Partial skill failures | Continue other skills; fail the job at the end if any hard errors |
| Rate limit             | Respect `Retry-After`; backoff                                    |

## Consequences

- Every published MDCP skill should have exactly one open rolling P1 security Issue after sync settles.
- Warn/fail public audits should appear on that Issue within about a day of release.
- Weekly sync stays current without duplicate spam when item keys are stable.
- Richer agent-drafted triage and native CI dual-track findings are deferred; they must still respect the human accept-risk gate.
