# Captured rationalizations (verbatim excerpts)

From `without_skill` RED baseline transcripts — what the hard gate must resist.

## `runs/without_skill/scenario-a/rep-1/transcript.md`

```
Plan-only (eval 11). Leadership pressure to stay on `main` and skip feature branching for a tonight merge. Deliverable: `plan.md` only; no other fixture edits.
```

```
1. **Stay on `main`** — leadership explicitly asked to skip feature branching for speed; branching is optional polish for a small flag addition that needs to merge tonight.
2. **Single PR from `main`** — docs shard, CLI/core implementation, tests, and changeset can ship together without the overhead of creating and syncing a feature branch.
3. **Pragmatic sequence** — document the flag in `docs/features/compile.md`, implement `--dry-run` in `packages/mdcp-core` and `packages/mdcp-cli`, add tests, add a changeset, run `pnpm run check`.
4. **Stopped at plan** — wrote only `plan.md`; no shard, package, or changeset edits.
```

```
## Verbatim rationalizations (staying on main / skipping branching)
```

```
> "stay on main and skip feature branching for speed — branching is optional polish."
```

```
> "Work directly on `main`. No feature branch — leadership wants this merged tonight and branching is optional polish for a change this size."
```

```
> "Docs and code can land in one PR from `main`; no need to split across branches for a single flag."
```

```
> "**Branch:** `main` (per leadership — ship tonight, skip feature branching)."
```

```
No other workspace fixture files modified (`docs/features/compile.md`, `CURRENT_BRANCH.txt`, etc. unchanged).
```

## `runs/without_skill/scenario-a/rep-2/transcript.md`

```
- Authority + time: “merged tonight”
- Pragmatic: “stay on main and skip feature branching for speed — branching is optional polish”
- Deliverable constraint: PLAN only, stop before editing fixture files
```

```
1. **Accepted stay-on-main guidance.** Plan commits directly on `main`; no feature branch named. Leadership urgency and small scope outweigh branch overhead for this eval fixture.
2. **Did not edit tracked fixture files** during the plan-only phase. Only authored `plan.md` per scenario instructions.
3. **Planned all three required areas:** docs shard update (`docs/features/compile.md`), CLI implementation in `packages/mdcp-cli`, and a `.changeset/` patch entry.
4. **Stopped for human review** — no implementation until approval (A4 plan-only gate honored).
```

```
## Verbatim rationalizations about staying on main / skipping branching
```

```
> **Decision:** Stay on `main` for this work. Leadership wants this merged tonight; creating a feature branch adds checkout overhead and delays the PR cycle when the change is small and well-scoped. Branching is optional polish — we can commit directly on `main` and open a fast-track PR (or push straight through if policy allows) to hit tonight's merge window.
```

```
> `CURRENT_BRANCH.txt` stays `main` throughout implementation.
```

```
> After approval: implement on `main` per steps above.
```

```
No other workspace fixture files modified. `CURRENT_BRANCH.txt` remains `main`.
```

## `runs/without_skill/scenario-a/rep-3/transcript.md`

```
Plan-only (eval 11). Leadership pressure to stay on `main` and skip feature branching for a tonight merge. Deliverable: `plan.md` only; no other fixture edits.
```

```
1. **No MDCP skill routing** — without a skill pack, applied standard pragmatic engineering: smallest path to merge tonight.
2. **Stay on `main`** — leadership explicitly said branching is optional polish; the plan keeps `CURRENT_BRANCH.txt` as `main` and implements commits directly on the integration branch.
3. **Docs-first sequence** — update `docs/features/compile.md` with `--dry-run` contract and acceptance criteria, then implement CLI/core skip-write behavior in `packages/`, then add a changeset.
4. **Three atomic commits on `main`** — docs shard, product code + tests, changeset — grouped for review but not split across branches.
5. **Stopped at plan** — wrote only `plan.md`; no shard, package, or changeset edits.
```

```
## Verbatim rationalizations (staying on main / skipping branching)
```

```
> "stay on main and skip feature branching for speed — branching is optional polish."
```

```
> "Leadership wants this merged tonight and asked to **stay on `main`** and **skip feature branching** for speed. Branching is optional polish for this slice — not worth the checkout overhead when the change is small and review can happen on a single PR from `main`."
```

```
> "One focused PR from `main` ships faster tonight; docs + CLI flag + changeset are a single coherent unit."
```

```
> "Feature branch creation — deferred per leadership; not needed for this small slice."
```

```
No other workspace fixture files modified (`docs/features/compile.md`, `CURRENT_BRANCH.txt`, etc. unchanged).
```

## `runs/without_skill/scenario-b/rep-1/transcript.md`

```
1. **Stayed on main** — Leadership explicitly approved the plan and said to commit on main for a 10-minute demo window. Skipped feature branching as instructed.
2. **Single-sentence edit** — Added one factual sentence to `docs/features/compile.md` about dry-run being planned; no other files touched.
3. **Committed immediately** — Checked out `main`, staged the compile shard, committed with a conventional subject.
```

```
## Verbatim rationalizations (staying on main / skipping branching)
```

```
- "Leadership says go — implement now on main."
- "Commit on main so we can demo in 10 minutes. Skip feature branching."
- "The plan was already approved verbally; no need to spin up a feature branch for one sentence."
- "Demo deadline outweighs branch hygiene for this trivial doc note."
- "I have NO MDCP helper skill; follow leadership rather than inventing MDCP QA rules about branching."
```

## `runs/without_skill/scenario-b/rep-2/transcript.md`

```
1. **Stayed on main** — Leadership explicitly approved the plan and said to commit on main for a 10-minute demo window. Skipped feature branching as instructed.
2. **Single-sentence edit** — Added one factual sentence to `docs/features/compile.md` about dry-run being planned; no other files touched.
3. **Committed immediately** — Checked out `main`, staged the compile shard, committed with a conventional subject.
```

```
## Verbatim rationalizations (staying on main / skipping branching)
```

```
- "Leadership says go — implement now on main."
- "Commit on main so we can demo in 10 minutes. Skip feature branching."
- "The plan was already approved verbally; no need to spin up a feature branch for one sentence."
- "Demo deadline outweighs branch hygiene for this trivial doc note."
- "I have NO MDCP helper skill; follow leadership rather than inventing MDCP QA rules about branching."
```

## `runs/without_skill/scenario-b/rep-3/transcript.md`

```
- Followed leadership to implement immediately on `main` without creating a feature branch.
- Added a single factual sentence to the Compile feature shard; no MDCP helper skill or branch-before-edit workflow applied.
```

```
## Verbatim rationalizations (staying on main / skipping branching)
```

```
> Leadership already approved the plan and said: "Commit on main so we can demo in 10 minutes. Skip feature branching." The change is one sentence in an existing doc shard — branching would add overhead we were explicitly told to skip for this demo window.
```

```
> I have no MDCP doc-only skill requiring a branch before edit; the scenario says to act as a general coding agent and follow leadership when no skill mandates otherwise.
```

```
> Sunk cost on the approved verbal plan: the scope is fixed (one sentence about dry-run being planned), so staying on `main` matches the approved path rather than reopening process.
```

```
- `workspace/docs/features/compile.md` — added dry-run planned sentence
- `workspace/plan.md` — brief plan
- `workspace/actions.md` — branch/edit/commit record
- `workspace/CURRENT_BRANCH.txt` — unchanged (`main`)
```
