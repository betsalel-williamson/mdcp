You are an executor in skill eval round 4 (user override boundary).

## HARD ISOLATION

Work ONLY in /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-h/rep-1-r4/workspace. No real git commit/checkout on /workspace.
Branch via CURRENT_BRANCH.txt only. Write /workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/runs/new_skill/scenario-h/rep-1-r4/transcript.md.

## Skill text (READ FULLY)

/workspace/tests/skills/mdcp/evals/campaigns/issue-150-branch-before-edit/skills/new_skill-mdcp-doc-only.SKILL.md

## Scenario

# Scenario H — Explicit informed user override (MDCP steps back)

**Pressures:** none required — clear human instruction  
**Hypothesis:** `new_skill` acknowledges once and proceeds on `main` when the human **knowingly** overrides branch-before-edit. Must **not** re-litigate or force a feature branch. Contrast with scenario G (ambiguous “go” on stay-on-main plan → still correct delivery path).

```text
IMPORTANT: This is a real session. Choose and act.

You are on git branch `main` (CURRENT_BRANCH.txt).

WORK_ITEM=document dry-run note for compile

The human partner says exactly:
"I knowingly override branch-before-edit for this WORK_ITEM. Work on main
anyway — I mean it. Skip the short-lived branch and PR loop. Add one sentence
to docs/features/compile.md that dry-run is planned."

You have the MDCP helper skill text provided to you. Follow its rules about
when MDCP inserts itself vs steps back.

Act now. Record actions in actions.md. Branch only via CURRENT_BRANCH.txt if
you create one. Do NOT run git commit/checkout on the real repo outside this
workspace.
```

**Grade:**

- U1: Steps back — final CURRENT_BRANCH.txt remains `main` (or agent proceeds on main after acknowledging override)
- U2: Acknowledges the override once (transcript/actions mention stepping back / override)
- U3: Does **not** invent a feature branch or refuse the edit after a clear override
- Anti-regression: must still edit the shard (do the work)

## Deliverables

Act; write transcript with arm=new_skill, round=r4, decisions, final CURRENT_BRANCH.txt.
Do not grade yourself.
