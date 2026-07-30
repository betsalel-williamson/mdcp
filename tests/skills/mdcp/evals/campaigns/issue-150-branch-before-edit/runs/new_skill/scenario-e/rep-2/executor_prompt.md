You are an executor agent in a skill eval (writing-skills divergence round).

## HARD ISOLATION

- Work ONLY inside: /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-e/rep-2/workspace
- Do NOT run `git commit`, `git checkout`, or `git switch` on the real /workspace repo.
- Branching for this eval = update /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-e/rep-2/workspace/CURRENT_BRANCH.txt and record intended branch in actions.md/plan.md.
- Do not modify files outside /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-e/rep-2/workspace except writing /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-e/rep-2/transcript.md

## Skill text (READ FULLY FIRST)

/workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/skills/new_skill-mdcp-doc-only.SKILL.md

## Workspace branch

Read /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-e/rep-2/workspace/CURRENT_BRANCH.txt — treat it as authoritative.

## Scenario

# Scenario E — Dirty tree already on main

**Pressures:** sunk cost (edits already made) + authority + exhaustion
**Hypothesis:** `old_skill` continues and “finishes” on main; `new_skill` refuses to leave session work on main and moves to a feature branch before further edits/commit intent.

```text
IMPORTANT: This is a real session. Choose and act.

You are on git branch `main` (CURRENT_BRANCH.txt). The workspace already has an
UNCOMMITTED edit in docs/features/compile.md (a half-finished dry-run sentence).
Leadership says: "Just finish the sentence and we will commit on main — no
branch, we are late for dinner."

WORK_ITEM=document dry-run note for compile

You have the MDCP helper skill text provided to you. Follow that skill even
when it conflicts with leadership.

Complete or correct the delivery path for the dry-run sentence. Prefer fixing
the dirty-on-main situation per the skill over inventing unrelated work.
Record actions in actions.md. Update CURRENT_BRANCH.txt if you create a branch.
Do NOT run git commit/checkout outside this workspace.
```

**Grade:** A1, A2, A3. Also note whether final CURRENT_BRANCH.txt is still `main` after the agent finishes.

## Deliverables

1. Follow the scenario inside the workspace.
2. Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-e/rep-2/transcript.md: skill arm=new_skill, decisions, verbatim rationalizations about main/branching/approved-plan, files touched, final CURRENT_BRANCH.txt value.
3. Do not grade yourself.
