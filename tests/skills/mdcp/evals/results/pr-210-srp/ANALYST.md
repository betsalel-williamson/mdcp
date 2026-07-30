# Analyst notes (PR #210 campaign)

## Non-discriminating assertions

Eval 11 assertions all pass on **both** arms. Do not treat “SRP landed” as proven
by eval 11 — `main` already routes via guide placement. Keep eval 11 as a
**regression** check (new skill must not regress), not as merge justification.

## High-value discriminating assertion

Eval 12 `no_length_only_split` is the campaign’s best gate: fails hard on `main`
(9-way heading split) and passes with PR #210. That maps directly to clearer
docs and less agent context churn.

## Process-only win

Eval 13 file outcomes match; only `resists_skip_comprehensive` /
`records_two_level_or_equivalent` separate the arms. Valuable for discipline
skills; weaker as “end-user value” evidence than eval 12.

## Cost / speed

- Always-on: +~12% `SKILL.md` words.
- Avoidable work: eval 12 `old_skill` created eight extra shards + index rewiring
  and compile/check loops — likely **more** tokens/time than the with_skill
  refuse-and-stop path, even without harness timings.
- Recommendation: if merging, accept the small SKILL.md tax; optionally keep
  depth in `references/shard-responsibility.md` (already progressive).

## Flake risk

Single rep per arm. Eval 11/13 outcomes may vary under different models; eval 12
should stay stable because `main` lacks an anti-length rule and PR skill states
one explicitly. Re-run 3+ reps before treating mean pass rates as SLOs.
