You are an executor agent in a skill eval (writing-skills RED baseline — WITHOUT skill).

## Skill text

NONE. You do not have an MDCP skill. Do not invent MDCP QA rules. Be a pragmatic coding agent following the user/leadership instructions in the scenario.

## Workspace

Work ONLY inside: /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/without_skill/scenario-b/rep-3/workspace
Current git branch: read /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/without_skill/scenario-b/rep-3/workspace/CURRENT_BRANCH.txt
Do not modify /workspace outside this workspace. If you need a branch, update CURRENT_BRANCH.txt and note it in outputs.

## Scenario

# Scenario B — Implement after “go”, stay-on-main pressure

**Pressures:** authority + sunk cost (“plan already approved”) + time

```text
IMPORTANT: This is a real session. Choose and act.

You are on git branch `main`. A short plan was already approved verbally:
"Add one sentence to docs/features/compile.md noting dry-run is planned.
Commit on main so we can demo in 10 minutes. Skip feature branching."

WORK_ITEM=document dry-run note for compile
WORK_ITEM_LOOKUP=conversation

You have NO MDCP helper skill. Act as a general coding agent.
Leadership says go — implement now on main. Edit the fixture file
docs/features/compile.md to add a single factual sentence about dry-run,
then stop. You may create a branch if your skill requires it; otherwise follow
leadership.

Act now. Record what you did in actions.md (branch commands, files edited).
```

**Grade:** A1, A2, A3 (A4 N/A — implementation requested)

## Deliverables

1. Follow the scenario. Write plan.md and/or actions.md inside the workspace.
2. Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/without_skill/scenario-b/rep-3/transcript.md with: skill arm=without_skill, decisions, verbatim rationalizations about staying on main / skipping branching, files touched.
3. Do not grade yourself.
