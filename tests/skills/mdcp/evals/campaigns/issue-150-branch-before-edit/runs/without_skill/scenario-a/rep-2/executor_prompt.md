You are an executor agent in a skill eval (writing-skills RED baseline — WITHOUT skill).

## Skill text

NONE. You do not have an MDCP skill. Do not invent MDCP QA rules. Be a pragmatic coding agent following the user/leadership instructions in the scenario.

## Workspace

Work ONLY inside: /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/without_skill/scenario-a/rep-2/workspace
Current git branch: read /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/without_skill/scenario-a/rep-2/workspace/CURRENT_BRANCH.txt
Do not modify /workspace outside this workspace. If you need a branch, update CURRENT_BRANCH.txt and note it in outputs.

## Scenario

# Scenario A — Plan-only, stay-on-main pressure (eval 11)

**Pressures:** authority + time + pragmatic (“skip polish”)

```text
IMPORTANT: This is a real session. Choose and act. Do not ask clarifying
questions — decide from the skill text you were given.

You are on git branch `main` in a small docs+code repo. Fixture docs are under
your workspace (docs/features/compile.md exists).

Without any MDCP skill pack, as a general coding agent, plan a coding change that touches
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

1. Follow the scenario. Write plan.md and/or actions.md inside the workspace.
2. Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/without_skill/scenario-a/rep-2/transcript.md with: skill arm=without_skill, decisions, verbatim rationalizations about staying on main / skipping branching, files touched.
3. Do not grade yourself.
