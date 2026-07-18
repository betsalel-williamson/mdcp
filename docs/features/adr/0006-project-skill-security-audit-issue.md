# ADR 0006: Project skill-security risk register

- **Status:** Accepted
- **Date:** 2026-07-18
- **Tracking:** [#153](https://github.com/betsalel-williamson/mdcp/issues/153)
- **Depends on:** [ADR 0004](./0004-public-first-skills-audit-sync.md), [ADR 0005](./0005-skills-audit-oidc-proxy.md)

## Context

Public audit findings need a durable place for fix-or-accept-risk decisions. Goals:

1. Keep an **open / in-flight** list of risks still being assessed or worked.
2. Record **accepted risks** so the same finding does not re-alert when it reappears unchanged.
3. **Alert on important changes** and escalate **high** severity into actionable work.
4. Preserve an **audit trail** of monitoring, decisions, and timelines — without flooding a thread with identical weekly dumps.

Accepted risk is a durable product decision and belongs in git. In-flight assessment is ephemeral and belongs on a GitHub Issue. Formal accept must capture who accepted (email), why, and when.

## Decision

Split state across three stores:

| Store                                                  | Holds                                                          |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| **In-flight Issue**                                    | New, assessing, and in-progress risks; change notes; questions |
| **Accepted log file** (committed YAML or JSON in-repo) | Formally accepted risks only                                   |
| **Urgent Issues**                                      | Separate Issues for **high** triage work                       |

### Identity (in-flight Issue)

- Title: e.g. `Security audit trail: betsalel-williamson/mdcp skills`
- Labels: `priority:P1`, `skill-security`
- Body marker: `<!-- skill-security-audit: betsalel-williamson/mdcp -->`
- Re-runs find the same open Issue via label + marker (create once if missing)
- Body holds **in-flight** register + meta (last successful sync, triage instructions) — not the accepted log

### Fingerprint

A finding’s stable identity ignores lone `auditedAt` churn:

`{skill, providerSlug, status, summary, riskLevel}`

(Provider-level MVP granularity; one row per skills.sh `audits[]` entry.)

### Accepted log file

Path to be chosen at implementation (for example `security/skills-audit-accepted.yaml`). Each accepted entry **must** include:

| Field    | Meaning                                                    |
| -------- | ---------------------------------------------------------- |
| source   | Where the risk came from (skills.sh, provider, skill slug) |
| risk     | Fingerprint and human-readable summary                     |
| date     | When it was accepted (ISO 8601 date or datetime)           |
| reason   | Why the risk is accepted                                   |
| accepter | Email of the person who accepted                           |

Sync **reads** this file before alerting. Matching fingerprints are treated as accepted: acknowledge quietly (update last-seen / note if useful) and **do not** re-open urgency or spam change alerts.

Humans add or amend entries through normal git review (PR). Automation must not invent acceptances. Optional later: a comment marker that opens a PR drafting a log entry — not required for MVP if maintainers edit the file directly.

### Classification on each sync

For each finding fingerprint from the Vercel proxy / skills.sh API:

```text
accepted in log?     → ack / note; no urgency spam
in-flight on Issue?  → note still assessing or in progress
never seen?          → triage low | medium | high
     high            → create (or update) a dedicated urgent Issue + in-flight note
     medium | low    → in-flight register only (+ change comment when new or worsened)
```

Unchanged in-flight findings: bump `last-seen` only — **no** new comment. Cleared on skills.sh: remove from in-flight; post a change note that it cleared. If a previously **accepted** fingerprint **changes** materially, treat as new (needs re-triage); do not silently keep the old acceptance.

Change comments (events only) include a human-readable summary, skills.sh link, and suggested next steps. Ready-to-paste accept guidance may point maintainers at the log-file fields (guardrail: make the required metadata obvious).

### Publish timeline

```text
GitHub Release (v*)
  → skills.sh re-audits (minutes … ~1 day)
  → Daily job (~20–28h after release) calls Vercel proxy
  → Classification flow above
```

### Cron timeline

```text
Daily:  if a Release was published ~20–28h ago → run sync (else no-op for that trigger)
Weekly: full sync candidate
Dispatch: force sync (optional override to ignore spacing)
```

**Spacing:** skip any scheduled sync when a **successful** sync ran within the last **~24 hours** (`last_successful_sync_at > now - 24h`, configurable, default 24h). This prevents daily and weekly from both running inside the same day. Record `last_successful_sync_at` in Issue meta (or an equivalent durable place the job can read).

`workflow_dispatch` may override spacing when an operator explicitly requests it.

### Permissions

GitHub Actions: `contents: read` (and `contents: write` only if a future bot opens accept PRs), `issues: write`, `id-token: write`.

### Error handling

| Case                        | Behavior                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| Proxy `401` / `403`         | Fail the job; do not rewrite registers or post misleading events  |
| skills.sh `404` for a skill | Meta / summary notes “audits pending”; retry next eligible sync   |
| Partial skill failures      | Continue other skills; fail the job at the end if any hard errors |
| Rate limit                  | Respect `Retry-After`; backoff                                    |

## Consequences

- One in-flight `skill-security` Issue tracks assessment and work-in-progress for published skills.
- Accepted risks live in git with source, risk, date, reason, and accepter email — reviewable and blameable.
- High findings get dedicated urgent Issues; medium/low stay on the in-flight Issue.
- Scheduled syncs stay about **24 hours** apart so daily and weekly do not double-hit.
- Native CI dual-track findings remain deferred; they must still respect the human accept gate and the accepted log file.
