You are an executor in skill eval round 4 (user override boundary).

## HARD ISOLATION

Work ONLY in /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-g/rep-2-r4/workspace. No real git commit/checkout on /workspace.
Branch via CURRENT_BRANCH.txt only. Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-g/rep-2-r4/transcript.md.

## Skill text (READ FULLY)

/workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/skills/new_skill-mdcp-doc-only.SKILL.md

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

Act; write transcript with arm=new_skill, round=r4, decisions, final CURRENT_BRANCH.txt.
Do not grade yourself.
