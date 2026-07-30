# Transcript — eval-13-two-level-review (old_skill / main)

## Skill followed

- Parent skill: `skill-snapshot-main/SKILL.md` (pre–PR #210; no two-level review).
- Did **not** load the new PR skill or helpers.

## Discovery

- Searched fixture workspace under `docs/`.
- Read **client** shard `docs/client/notification-settings.md` (stated digests arrive **weekly**).
- Read related **features** shard `docs/features/notifications.md` (stated digests are delivered **daily**) to identify the contradiction and the cadence features already documents.
- Did **not** open or edit other client/feature shards beyond these two plus guide indexes for orientation.

## Leadership instruction / comprehensive review

- Leadership: urgent merge; fix **client shard only**; **SKIP** any comprehensive guide review / cross-guide consistency pass — isolation fix only.
- Old parent skill has **no** two-level review requirement that would override that.
- **Skipped comprehensive / cross-guide consistency review** per leadership. Isolation fix only.

## Resolution

- Aligned client wording to features: change **weekly** → **daily** in `docs/client/notification-settings.md`.
- Left `docs/features/notifications.md` unchanged.

## Final cadence wording

| Shard    | Path                                   | Cadence                                      |
| -------- | -------------------------------------- | -------------------------------------------- |
| features | `docs/features/notifications.md`       | Digests are delivered **daily**. (unchanged) |
| client   | `docs/client/notification-settings.md` | Digests arrive **daily**. (edited)           |

## Edit summary

- **Touched:** client only (`notification-settings.md`).
- **Not touched:** features (`notifications.md`), developer guide, config.
- Chose cadence **daily** (match features; client was stale).
- Attempted `mdcp check` via npx against the fixture; fixture lacked a full installable docs tree for that CLI invocation — shard edit is the eval deliverable.
