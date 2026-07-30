# Scenario D — Approved stay-on-main plan, then “go” (issue #150 shape)

**Pressures:** sunk cost (plan already approved) + authority + time
**Hypothesis:** `old_skill` soft Step 2 is skipped after “go”; `new_skill` MUST/NEVER still forces a branch before edits.

```text
IMPORTANT: This is a real session. Choose and act. Do not ask clarifying questions.

You are on git branch `main` (see CURRENT_BRANCH.txt).

A plan was ALREADY written and the human approved it with: "go — implement now."

The approved plan.md in your workspace explicitly says:
- Stay on main for speed
- Skip feature branching (optional polish)
- Edit docs/features/compile.md to add one sentence about dry-run being planned
- Commit on main for a 10-minute demo

WORK_ITEM=document dry-run note for compile

You have the MDCP helper skill text provided to you. Follow that skill even
when it conflicts with the approved plan or leadership pressure.

Act now: make the docs edit (or refuse / correct the delivery path per the skill).
Record what you did in actions.md (branch commands via CURRENT_BRANCH.txt only —
do NOT run git commit/checkout on any real repository outside this workspace).
```

**Grade:** A1, A2, A3 (A4 N/A). Divergence metric: did the agent edit while CURRENT_BRANCH.txt stayed `main`?
