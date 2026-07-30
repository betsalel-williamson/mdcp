# PR #210 eval campaign — go / no-go

**Subject:** parent `mdcp` skill changes on `cursor/shard-srp-philosophy-dbdb`
(shard single responsibility, idea mitosis, two-level review).

**Arms:** `old_skill` = `skills/mdcp` from `main`; `with_skill` = PR #210 skill.

**Bias:** prefer **no-go** unless discriminating edge cases show clear end-user value
(clearer docs, less wasted agent work / tokens) that `main` misses.

**Runtime tokens/time:** Task harness did not return `total_tokens` /
`duration_ms` for these runs. Cost signal = static skill size + qualitative
work (especially length-only over-split).

## Static load cost

| Metric                 | `main` | PR #210                                                                                     |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `SKILL.md` words       | 1593   | 1791 (**+198**, ~+12%)                                                                      |
| Always-on tax          | —      | Extra QA bullets in parent skill                                                            |
| Progressive disclosure | —      | +186 words `shard-responsibility.md` (only if opened); +123 acknowledgments (non-operative) |

## Pass rates (assertions)

| Eval                  | What it pressures                          | `old_skill` | `with_skill` |
| --------------------- | ------------------------------------------ | ----------- | ------------ |
| 11 `srp-overloaded`   | Ship tonight; keep export in one file      | **5/5**     | **5/5**      |
| 12 `length-only`      | Split long single-concern shard by length  | **0/3**     | **3/3**      |
| 13 `two-level-review` | Fix client only; skip comprehensive review | **2/4**     | **4/4**      |
| **Mean pass rate**    |                                            | **0.50**    | **1.00**     |

Full machine-readable grades: [`benchmark.json`](./benchmark.json),
[`grading/`](./grading/), transcripts under [`transcripts/`](./transcripts/).
Static HTML viewer: [`viewer.html`](./viewer.html).

## What actually differed

### Eval 11 — non-discriminating outcome

Both arms already split multi-audience export docs using **What belongs where** /
no-temp-info. New SRP/mitosis wording did **not** unlock a behavior `main`
lacked on this fixture. **No merge justification from eval 11 alone.**

### Eval 12 — strong discrimination (end-user value)

- `old_skill`: followed “Break it down” + leadership length pressure → **9**
  heading shards (over-split). Agents would load more files / more tokens for
  the same concern.
- `with_skill`: read `shard-responsibility.md`, **refused length-only split**,
  kept one responsible shard.

This is the clearest proof the PR adds value: prevents harmful fake mitosis
under length pressure. Fewer shards here means clearer information and less
context churn.

### Eval 13 — process win; same file outcome

Both arms ended with **daily** in client + features. `old_skill` explicitly
**skipped** comprehensive review per leadership. `with_skill` refused the skip
and recorded isolation + guide-agreement review. Outcome quality tied; discipline
under pressure improved.

## Verdict

**Conditional GO for merging PR #210.**

Reasons to merge (outweigh default no-go bias):

1. Eval 12 shows `main` **does not** “work okay” under a realistic length
   pressure — it damages the docs tree.
2. Idea mitosis’ “do not split only because a file is long” is the operative
   fix; two-level review is supporting discipline (eval 13).
3. Token story: small always-on `SKILL.md` tax (~+198 words) vs large avoidable
   work when agents over-split (eval 12 old arm).

Reasons still to hesitate:

1. Eval 11 shows existing placement rules already handle mixed-audience
   monoliths — do not oversell SRP as net-new for that case.
2. Eval 13’s durable file result matched `main`; value is process, not a new
   end state on this fixture.
3. Runtime token/time deltas were **not** measured by the harness — re-run with
   a harness that captures Task `total_tokens` / `duration_ms` if you need SLO
   evidence.

## Artifacts

| Path                           | Contents                               |
| ------------------------------ | -------------------------------------- |
| `benchmark.json`               | Aggregate pass rates + static size     |
| `grading/**/grading.json`      | Per-assertion evidence                 |
| `transcripts/**/transcript.md` | Agent decisions / rationalizations     |
| `outputs/eval-12-length-only/` | Docs trees for the discriminating case |
| `viewer.html`                  | skill-creator static review UI         |

Related: [PR #210](https://github.com/betsalel-williamson/mdcp/pull/210),
[issue #171](https://github.com/betsalel-williamson/mdcp/issues/171),
companion PR for this campaign on branch `cursor/shard-srp-eval-results-bb00`.
