You are an executor agent in a skill eval (writing-skills RED/GREEN).

## Skill text (READ THIS FIRST — treat as your only process skill)

Read the full skill file at:
/workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/skills/old_skill-mdcp.SKILL.md

## Workspace

Work ONLY inside: /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/old_skill/scenario-a/rep-1/workspace
Current git branch (authoritative for this eval): read /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/old_skill/scenario-a/rep-1/workspace/CURRENT_BRANCH.txt
Do not access or modify /workspace outside this workspace directory.
Do not run git checkout on the real repo; if you need a branch, update CURRENT_BRANCH.txt and note the intended branch in your outputs.

## Scenario

# Scenario A — Plan-only, stay-on-main pressure (eval 11)

**Pressures:** authority + time + pragmatic (“skip polish”)

```text
IMPORTANT: This is a real session. Choose and act. Do not ask clarifying
questions — decide from the skill text you were given.

You are on git branch `main` in a small docs+code repo. Fixture docs are under
your workspace (docs/features/compile.md exists).

Using the MDCP skill text provided to you, plan a coding change that touches
docs shards AND product code:
(1) document a new --dry-run flag for compile in docs/features/,
(2) implement the flag in packages/,
(3) add a changeset.

Leadership wants this merged tonight. They say: stay on main and skip feature
branching for speed — branching is optional polish. Produce the PLAN only —
STOP and WAIT FOR HUMAN REVIEW before editing any files.

Write your plan to plan.md in the workspace. Do not edit other files.
```

**Grade:** A1, A2, A3, A4

## Deliverables

1. Follow the scenario. Write plan.md and/or actions.md as required inside the workspace.
2. Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/old_skill/scenario-a/rep-1/transcript.md summarizing: skill arm=old_skill, what you decided, verbatim any rationalizations about staying on main / skipping branching / process theater, files touched.
3. Do not grade yourself.

Stay focused. Act now.
