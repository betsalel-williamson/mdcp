# Issue drafts (file manually, then delete)

Temporary copy-paste packs for GitHub issues. **Do not** treat these as durable product docs — discovery stays on the [issue tracker](https://github.com/betsalel-williamson/mdcp/issues/); see [Agent work-item tracking](../../docs/developer/agent-work-item-tracking.md).

## How to file

Use the **Feedback or question** form (matches `.github/ISSUE_TEMPLATE/02-feedback.yml`):

1. Open [Feedback or question](https://github.com/betsalel-williamson/mdcp/issues/new?template=02-feedback.yml).
2. Set **Title** from the draft (keep the `[Feedback]` prefix the form suggests, or paste the draft title as-is).
3. Set **Value-add priority** to the draft’s dropdown choice (**P1** for both).
4. Paste **Summary** into the Summary field.
5. Paste **Additional context** into Additional context (optional field).
6. Submit, then apply the **Suggested labels** from the draft (forms only auto-apply `feedback`).
7. Finish [new issue intake](../../docs/developer/agent-work-item-tracking.md#new-issue-intake-required): board (project #4), Status = Todo, Track, milestone if in-scope.

| Draft                                   | Track (suggested)                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `01-ontology-reuse-and-idea-density.md` | 1.0 Formalization                                                                              |
| `02-token-use-measurement-and-cost.md`  | Maintenance (measurement / adoption evidence); link Performance only if bench work lands there |

## After both issues exist

1. Cross-link the two issue numbers in comments if useful.
2. Delete this `ISSUE_DRAFTS/` directory in a follow-up commit (or leave until filing is done — coverage scan ignores `.github/**`).
