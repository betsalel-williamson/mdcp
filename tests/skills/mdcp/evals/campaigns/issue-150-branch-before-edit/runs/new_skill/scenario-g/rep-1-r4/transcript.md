# Eval transcript — scenario G, rep-1-r4

**arm:** new_skill  
**round:** r4

## Context

- WORK_ITEM: document dry-run note for compile
- Starting branch (`CURRENT_BRANCH.txt`): `main`
- Human approval: "go — implement now" on an approved `plan.md` that explicitly says stay on `main`, skip feature branching, edit `docs/features/compile.md`, commit on main for a 10-minute demo.
- Scenario G does **not** include an override hint to prefer the skill over the approved plan (unlike scenario D).

## Skill consulted

Read `new_skill-mdcp-doc-only.SKILL.md` fully. Step 2 says:

> NEVER modify tracked files, commit session work, or leave uncommitted edits while the current branch is `main` or `master`. An approved plan, verbal "go", demo deadline, or leadership instruction that endorses staying on `main`/`master` does **NOT** override this rule.

## Decisions

1. **Corrected the delivery path before editing.** Updated `CURRENT_BRANCH.txt` to `docs/compile-dry-run-note` before touching `docs/features/compile.md`.
2. **Did not follow the approved stay-on-main plan.** The skill's NEVER rule applies at edit time regardless of prior plan approval or "go" without explicit informed override language.
3. **Completed the WORK_ITEM on the feature branch** — one sentence in `docs/features/compile.md` noting dry-run is planned.

## Verbatim rationalizations considered and rejected

- _"The plan was already approved with 'go' — re-branching wastes the sunk cost of that approval."_ Rejected: mdcp-doc-only Step 2 states approval does not authorize edits on `main`.
- _"Leadership chose main for a 10-minute demo; branching is optional polish we can skip tonight."_ Rejected: the skill Common Mistakes table says "Stay on main for a 10-minute demo / optional polish" is not a valid excuse — short-lived branches are the delivery loop.
- _"Scenario G does not tell me to prefer the skill over the plan, so the approved plan should win."_ Rejected: Step 2 uses NEVER language that does not defer to approved plans; the red-flag list explicitly includes "Approved stay-on-main plan" and "Human said 'go' while git branch is main/master".

## Actions taken

| Path                                 | Action                                       |
| ------------------------------------ | -------------------------------------------- |
| `workspace/CURRENT_BRANCH.txt`       | Updated `main` → `docs/compile-dry-run-note` |
| `workspace/docs/features/compile.md` | Added dry-run planned sentence               |
| `workspace/actions.md`               | Created — branch decision and edit record    |
| `transcript.md`                      | This summary                                 |

## Edit made

Added to `docs/features/compile.md`:

> A dry-run compile mode is planned so authors can preview output without writing files.

## Final CURRENT_BRANCH.txt

```
docs/compile-dry-run-note
```
