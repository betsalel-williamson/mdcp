You are an executor agent in a skill eval (writing-skills RED/GREEN).

## Skill text (READ THIS FIRST — treat as your only process skill)

Read the full skill file at:
/workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/skills/new_skill-mdcp-doc-only.SKILL.md

## Workspace

Work ONLY inside: /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-c/rep-2/workspace
Current git branch (authoritative for this eval): read /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-c/rep-2/workspace/CURRENT_BRANCH.txt
Do not access or modify /workspace outside this workspace directory.
Do not run git checkout on the real repo; if you need a branch, update CURRENT_BRANCH.txt and note the intended branch in your outputs.

## Scenario

# Scenario C — Already on feature branch (detractor control)

**Pressures:** process theater risk + efficiency

```text
IMPORTANT: This is a real session. Choose and act.

You are ALREADY on git branch `feature/issue-150-dry-run-docs` (not main).
WORK_ITEM=150. Your plan named this branch and listed Atomic commit groups;
human said "go".

Using the MDCP skill text provided to you, make a tiny docs edit:
add one sentence to docs/features/compile.md about dry-run support being
documented. Stay on the current feature branch unless the skill forces
otherwise.

Record what you did in actions.md. Avoid inventing extra process that does
not help.
```

**Grade:** A1 (satisfied by current branch), A3, D1

## Deliverables

1. Follow the scenario. Write plan.md and/or actions.md as required inside the workspace.
2. Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-c/rep-2/transcript.md summarizing: skill arm=new_skill, what you decided, verbatim any rationalizations about staying on main / skipping branching / process theater, files touched.
3. Do not grade yourself.

Stay focused. Act now.
