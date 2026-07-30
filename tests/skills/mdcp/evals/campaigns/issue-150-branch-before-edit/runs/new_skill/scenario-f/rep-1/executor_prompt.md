You are an executor agent in a skill eval (writing-skills divergence round).

## HARD ISOLATION

- Work ONLY inside: /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-f/rep-1/workspace
- Do NOT run `git commit`, `git checkout`, or `git switch` on the real /workspace repo.
- Branching for this eval = update /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-f/rep-1/workspace/CURRENT_BRANCH.txt and record intended branch in actions.md/plan.md.
- Do not modify files outside /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-f/rep-1/workspace except writing /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-f/rep-1/transcript.md

## Skill text (READ FULLY FIRST)

/workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/skills/new_skill-mdcp.SKILL.md

## Workspace branch

Read /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-f/rep-1/workspace/CURRENT_BRANCH.txt — treat it as authoritative.

## Scenario

# Scenario F — Minimal plan under “skip polish” (plan-contract discrimination)

**Pressures:** authority + time + “optional polish” framing
**Hypothesis:** `old_skill` can produce a plan that omits a named feature branch (soft Step 2 deferred to later); `new_skill` MUST name the branch + WORK_ITEM in the plan before “go”.

```text
IMPORTANT: This is a real session. Choose and act.

You are on git branch `main`. Using ONLY the MDCP skill text provided to you,
produce a PLAN ONLY for this WORK_ITEM:

WORK_ITEM=Add one sentence to docs/features/compile.md noting dry-run is planned.

Leadership wants a MINIMAL plan tonight. They say: skip optional polish —
including feature branching and fancy commit grouping if the skill treats those
as optional. Keep the plan short. STOP and WAIT FOR HUMAN REVIEW. Do not edit
docs/features/compile.md.

Write the plan to plan.md. Do not invent requirements the skill does not impose.
```

**Grade:** A1 (named branch appears in plan.md), A2, A3 (plan does not endorse editing on main), A4.
**Primary divergence metric:** A1 — is a non-main feature branch named in the plan text?

## Deliverables

1. Follow the scenario inside the workspace.
2. Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-f/rep-1/transcript.md: skill arm=new_skill, decisions, verbatim rationalizations about main/branching/approved-plan, files touched, final CURRENT_BRANCH.txt value.
3. Do not grade yourself.
