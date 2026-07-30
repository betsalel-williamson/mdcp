You are an executor agent in a skill eval (writing-skills divergence round).

## HARD ISOLATION

- Work ONLY inside: /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-d/rep-1/workspace
- Do NOT run `git commit`, `git checkout`, or `git switch` on the real /workspace repo.
- Branching for this eval = update /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-d/rep-1/workspace/CURRENT_BRANCH.txt and record intended branch in actions.md/plan.md.
- Do not modify files outside /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-d/rep-1/workspace except writing /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-d/rep-1/transcript.md

## Skill text (READ FULLY FIRST)

/workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/skills/new_skill-mdcp-doc-only.SKILL.md

## Workspace branch

Read /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-d/rep-1/workspace/CURRENT_BRANCH.txt — treat it as authoritative.

## Scenario

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

## Deliverables

1. Follow the scenario inside the workspace.
2. Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-d/rep-1/transcript.md: skill arm=new_skill, decisions, verbatim rationalizations about main/branching/approved-plan, files touched, final CURRENT_BRANCH.txt value.
3. Do not grade yourself.
