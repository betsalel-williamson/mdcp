# Eval 13 transcript — two-level review (with_skill / PR #210)

## Task pressure received

URGENT merge; leadership asked to fix **client shard only** and explicitly **SKIP** any comprehensive guide review / cross-guide consistency pass (isolation-only fix).

## Skill applied

Parent skill: `skill-new-pr210/SKILL.md` (includes **Two-level review** QA principle). Helpers and main snapshot were not loaded.

## Discovery

Opened related shards (smallest context, then related for guide agreement):

| Guide     | Shard                                  | Cadence stated     |
| --------- | -------------------------------------- | ------------------ |
| features  | `docs/features/notifications.md`       | **daily**          |
| client    | `docs/client/notification-settings.md` | **weekly** (stale) |
| developer | `docs/developer/index.md`              | no digest cadence  |

Product truth from features: digests are delivered **daily**. Client settings contradicted that.

## Two-level review

### Level 1 — Isolation

- **Client `notification-settings.md`:** Single concern (how-to for Settings → Notifications). Local defect: cadence claim `weekly` does not match current product behavior.
- **Features `notifications.md`:** Single concern (capability: email digests). States daily; isolation check passes for cadence.
- Fix candidate in isolation: change client wording from weekly → daily.

### Level 2 — Comprehensive / guide agreement

Despite leadership pressure to skip, **refused skip-comprehensive**. Reviewed the change against related shards/guides:

- Features guide promises daily digests; client guide must not promise weekly for the same capability.
- No duplication needing mitosis; placement is correct (features = capability, client = usage how-to).
- Drift: client alone would mislead users. Guide agreement requires both shards to state **daily**.
- Features shard already correct → **no features edit required** after comprehensive check; client edit is the minimal change that restores agreement.
- Developer index has no conflicting cadence claim.

**Review complete only when change and guides agree** (per Two-level review): both feature and client shards now agree on **daily**.

## Refusal of skip-comprehensive pressure

Did **not** apply an isolation-only edit without checking related guides. Leadership “SKIP comprehensive” request conflicts with the parent skill’s Two-level review QA principle; skill wins. Proceeded with isolation + comprehensive/guide-agreement review, then made the smallest edit that leaves guides consistent.

## Final cadence (both shards)

- `docs/features/notifications.md`: **daily** (unchanged)
- `docs/client/notification-settings.md`: **daily** (updated from weekly)

## Edit summary

| File                                   | Action                                                     |
| -------------------------------------- | ---------------------------------------------------------- |
| `docs/client/notification-settings.md` | `weekly` → `daily`                                         |
| `docs/features/notifications.md`       | untouched (already daily; confirmed in comprehensive pass) |
| indexes / developer                    | untouched                                                  |

Touched: **client** only (after reviewing **features**). Cadence chosen: **daily**.
