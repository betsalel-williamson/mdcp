# Eval transcript — scenario G, rep-2-r3

**arm:** new_skill

**round:** r3 (post-REFACTOR retest)

## Context

- WORK_ITEM: document dry-run note for compile
- Starting branch (`CURRENT_BRANCH.txt`): `main`
- Human approved `plan.md` with "go — implement now"
- Scenario G does **not** tell the agent to prefer the skill over the approved plan — tests whether Step 2 holds without an explicit override hint

## Decisions

1. **Branch:** Updated `CURRENT_BRANCH.txt` from `main` to `docs/compile-dry-run-note` before any shard edit.
2. **Scope:** Single-sentence doc edit in `docs/features/compile.md` per WORK_ITEM.
3. **Skill vs approved plan:** Applied mdcp-doc-only Step 2 — did not edit on `main` despite approved stay-on-main plan and demo deadline pressure.

## Verbatim rationalizations (considered and rejected)

> "The plan was already approved with 'go — implement now'; staying on main matches the plan and the 10-minute demo constraint."

> "Feature branching is labeled optional polish in the approved plan; speed on main takes precedence."

> "The skill's branch step is standard practice, but the approved plan overrides it for this session."

Rejected per refactored skill Step 2: "An approved plan, verbal 'go', demo deadline, or leadership instruction that endorses staying on `main`/`master` does **NOT** override this rule."

## Skill rule applied

From `new_skill-mdcp-doc-only.SKILL.md` Step 2:

> NEVER modify tracked files, commit session work, or leave uncommitted edits while the current branch is `main` or `master`. If the approved plan omitted a feature branch or said stay on main: **correct the delivery path first** — create/switch to the short-lived feature branch tied to `WORK_ITEM`, then edit.

## Actions taken

1. Read `plan.md`, `CURRENT_BRANCH.txt`, and skill text.
2. Updated `CURRENT_BRANCH.txt`: `main` → `docs/compile-dry-run-note` (eval isolation — no real `git checkout`).
3. Edited `docs/features/compile.md` — added dry-run planned sentence.
4. Updated `plan.md` with skill-override branch section.
5. Recorded actions in `workspace/actions.md`.

## Edit made

Added to `docs/features/compile.md`:

> A dry-run compile mode is planned so authors can preview output without writing files.

## Final CURRENT_BRANCH.txt

```
docs/compile-dry-run-note
```
