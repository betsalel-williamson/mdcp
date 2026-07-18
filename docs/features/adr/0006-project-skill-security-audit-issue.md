# ADR 0006: Project skill-security risk register Issue

- **Status:** Accepted
- **Date:** 2026-07-18
- **Tracking:** [#153](https://github.com/betsalel-williamson/mdcp/issues/153)
- **Depends on:** [ADR 0004](./0004-public-first-skills-audit-sync.md), [ADR 0005](./0005-skills-audit-oidc-proxy.md)

## Context

Public audit findings need a durable place for fix-or-accept-risk decisions. Goals for the tracker:

1. Keep an **open list of risks** that still need attention.
2. Record **accepted risks** so the same finding does not re-alert when it reappears unchanged.
3. **Alert on important changes** so maintainers can prioritize work.
4. Preserve an **audit trail**: monitoring, decisions, work-in-progress, and timelines — without flooding the thread with identical weekly scan dumps.

Opening one Issue per skill scatters triage. Posting one comment per skill per weekly scan creates noise when the same concern persists. Fully automated accept-risk is unsafe.

## Decision

Maintain **one rolling GitHub Issue** for all published `betsalel-williamson/mdcp` skills as a **risk register** (body = state, comments = events).

### Identity

- Title: e.g. `Security audit trail: betsalel-williamson/mdcp skills`
- Labels: `priority:P1`, `skill-security`
- Body marker: `<!-- skill-security-audit: betsalel-williamson/mdcp -->`
- Re-runs find the same open Issue via label + marker (create once if missing)

### Fingerprint

A finding’s stable identity ignores lone `auditedAt` churn:

`{skill, providerSlug, status, summary, riskLevel}`

(Provider-level MVP granularity; one row per skills.sh `audits[]` entry.)

### Body = registers (state)

Automation maintains structured sections in the Issue body:

| Section      | Holds                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Open**     | Risks that still need attention (skill, provider, status, link, first-seen, last-seen)                                              |
| **Accepted** | Fingerprints humans accepted, with rationale and accepted-at; sync may bump `last-seen` quietly when the same fingerprint reappears |
| **Meta**     | Purpose, triage instructions, last successful sync timestamp, skills.sh source links                                                |

Unchanged open findings: update `last-seen` only — **no new comment**.

Cleared on skills.sh (`pass` / gone): remove from Open; post a **change** comment that it cleared.

### Comments = events (timeline)

Automation posts comments **only on deltas**, for example:

- New open risk
- Status worsened (e.g. `warn` → `fail`) or fingerprint changed on a previously known item
- Previously **Accepted** fingerprint changed materially (needs re-triage; treat as new open until re-accepted)
- Open risk cleared on skills.sh

Each change comment includes:

- Human-readable summary + skills.sh security link
- A ready-to-paste accept line: `accept-risk: <fingerprint>` (guardrail: copy-paste, not hand-typed hashes)
- Optional draft triage prompt (“fix vs accept-risk”)

Humans (or agent drafts awaiting human send) record decisions as **replies** using markers — not by hand-editing Accepted for the happy path.

### Accept-risk via markers (choice B)

1. Human replies with `accept-risk: <fingerprint>` plus rationale (and optionally a target date / fix PR link for “working on it” notes in prose).
2. Automation **must not** invent accept-risk; it only applies markers authored in the thread.
3. On the next sync (or an explicit apply path), sync parses markers, promotes matching fingerprints into **Accepted**, removes them from **Open**, and **acknowledges** on the marker comment or with a short follow-up (“Accepted applied: …”) (guardrail: ack on apply).
4. Unknown / mismatched fingerprints: sync comments that the marker did not match — do not fail the whole job solely for a bad marker.
5. Hand-editing the Accepted section remains an emergency escape hatch if sync is down; MVP does not promise reconciling arbitrary hand-edits with markers (defer dual-write / C).

Deferred (not MVP): `workflow_dispatch` “apply dispositions now” so markers take effect without waiting for the next cron.

### Schedule

GitHub Actions (permissions: `contents: read`, `issues: write`, `id-token: write`):

1. **Daily cron** — runs sync when a GitHub Release was published about 20–28 hours ago.
2. **Weekly cron** — full sync (for example Mondays 15:00 UTC — tunable).
3. **`workflow_dispatch`** — operator-forced sync (optional override to run even if already synced that UTC day).

**Dedup:** the weekly job **skips** when a successful sync already ran earlier that **UTC calendar day**.

### Error handling

| Case                        | Behavior                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| Proxy `401` / `403`         | Fail the job; do not rewrite registers or post misleading events  |
| skills.sh `404` for a skill | Job summary / meta notes “audits pending”; retry next schedule    |
| Partial skill failures      | Continue other skills; fail the job at the end if any hard errors |
| Rate limit                  | Respect `Retry-After`; backoff                                    |
| Bad `accept-risk` marker    | Note on Issue; continue                                           |

## Consequences

- One open P1 `skill-security` Issue is the project risk register for published skills.
- Open and Accepted lists stay accurate without weekly comment floods for unchanged findings.
- Accepted fingerprints do not re-alert until the fingerprint changes.
- Change comments + marker replies form the decision timeline; body holds current state.
- Weekly and daily crons do not double-run successfully on the same UTC day unless forced.
- Native CI dual-track findings and richer agent triage remain deferred; they must still respect the human accept-risk gate.
