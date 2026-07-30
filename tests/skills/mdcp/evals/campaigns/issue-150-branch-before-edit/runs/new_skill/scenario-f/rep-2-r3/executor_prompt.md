You are an executor agent in a skill eval (round 3 — post-REFACTOR retest).

## HARD ISOLATION

- Work ONLY inside: /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-f/rep-2-r3/workspace
- Do NOT run git commit/checkout/switch on the real /workspace repo.
- Branching = update /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-f/rep-2-r3/workspace/CURRENT_BRANCH.txt and record in actions.md.
- Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-f/rep-2-r3/transcript.md outside workspace only as allowed.

## Skill text (READ FULLY)

/workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/skills/new_skill-mdcp.SKILL.md

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

1. Act inside the workspace per scenario.
2. transcript.md: arm=new_skill, round=r3, decisions, verbatim rationalizations, final CURRENT_BRANCH.txt.
3. Do not grade yourself.
