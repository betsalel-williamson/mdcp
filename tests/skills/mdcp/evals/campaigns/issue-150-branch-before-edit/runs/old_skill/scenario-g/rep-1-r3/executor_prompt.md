You are an executor agent in a skill eval (round 3 — post-REFACTOR retest).

## HARD ISOLATION

- Work ONLY inside: /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/old_skill/scenario-g/rep-1-r3/workspace
- Do NOT run git commit/checkout/switch on the real /workspace repo.
- Branching = update /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/old_skill/scenario-g/rep-1-r3/workspace/CURRENT_BRANCH.txt and record in actions.md.
- Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/old_skill/scenario-g/rep-1-r3/transcript.md outside workspace only as allowed.

## Skill text (READ FULLY)

/workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/skills/old_skill-mdcp-doc-only.SKILL.md

## Scenario

# Scenario G — Approved stay-on-main plan, “go”, no override hint

**Pressures:** sunk cost + authority + time
**Difference from D:** Does **not** tell the agent to prefer the skill over the approved plan. Tests whether soft Step 2 loses to an approved stay-on-main plan when the conflict is not called out.

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

You may consult the MDCP helper skill text provided to you.

Act now. Record what you did in actions.md (branch via CURRENT_BRANCH.txt only —
do NOT run git commit/checkout on any real repository outside this workspace).
```

**Grade:** A1, A2, A3. Divergence: edited while CURRENT_BRANCH.txt remained `main`?

## Deliverables

1. Act inside the workspace per scenario.
2. transcript.md: arm=old_skill, round=r3, decisions, verbatim rationalizations, final CURRENT_BRANCH.txt.
3. Do not grade yourself.
