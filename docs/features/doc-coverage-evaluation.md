# Docs coverage evaluation

Host-agnostic contract for deciding whether a change set has adequate MDCP shard coverage. Automations and CI call this surface instead of embedding MDCP taxonomy rules in host-specific prompts.

This is distinct from the [documentation coverage scan](./coverage-scan.md), which asks whether markdown files in the repo are accounted for by guides. Docs coverage **evaluation** asks whether **changed work** is accompanied by the right guide shards.

## End-user value

Teams that adopt MDCP can plug the same evaluator into Cursor Automations, GitHub Actions, or any other host. Authors get a precise recommendation (or a short clarification request) when a PR changes code without matching shards — without requiring every contributor to remember the skill workflow.

## Inputs

| Input          | Role                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| Changed paths  | Repo-relative paths from a PR, push, or local diff                                        |
| Docs root      | Guide tree root (typically `docs`)                                                        |
| Mode           | `advisory` (report only) or `gate` (non-covered statuses fail)                            |
| Guide taxonomy | Default Code Repository Archetype surfaces: `features`, `client`, `developer`, `glossary` |

Hosts gather changed paths; they **MUST NOT** re-implement MDCP surface inference. Optional PR metadata may be used by adapters for comments, not for the core verdict.

## Outputs

Machine-readable JSON:

| Field             | Meaning                                                |
| ----------------- | ------------------------------------------------------ |
| `status`          | `covered` \| `missing_docs` \| `needs_clarification`   |
| `mode`            | Echo of `advisory` or `gate`                           |
| `docSurfaces`     | Inferred guide surfaces that the change likely affects |
| `candidateShards` | Suggested guide areas or paths to create or extend     |
| `reasons`         | Why each surface was inferred (paths + confidence)     |
| `questions`       | Human-in-the-loop prompts when confidence is low       |
| `changedPaths`    | Normalized input paths                                 |
| `docsChanged`     | Subset under the docs root                             |
| `codeChanged`     | Subset classified as product or packaging code         |

## Inference model

Classify each changed path, then map to guide surfaces:

| Path class                         | Typical surfaces                         | Confidence |
| ---------------------------------- | ---------------------------------------- | ---------- |
| `docs/features/**` (or equivalent) | `features` (already touched)             | high       |
| `docs/client*/**`                  | `client` (already touched)               | high       |
| `docs/developer/**`                | `developer` (already touched)            | high       |
| `docs/glossary/**`                 | `glossary` (already touched)             | high       |
| Product / package source           | `features` (and often `client` for CLIs) | high       |
| Contributor tooling / CI / skills  | `developer`                              | high       |
| Ambiguous or mixed unknown paths   | —                                        | low → HIL  |

### Verdict rules

1. **Covered** — every high-confidence required surface already has matching docs changes, or the change set is docs-only / ignore-only.
2. **Missing docs** — at least one high-confidence required surface has no matching docs change.
3. **Needs clarification** — inference cannot choose surfaces with high confidence (for example only opaque paths). Never report low-confidence gaps as `missing_docs`.

## Modes

| Mode       | Behavior                                                               |
| ---------- | ---------------------------------------------------------------------- |
| `advisory` | Always emit JSON; exit `0` for evaluation outcomes (including gaps)    |
| `gate`     | Exit non-zero when `status` is `missing_docs` or `needs_clarification` |

Adopt **advisory** first. Switch to **gate** once the heuristics and HIL prompts fit the repo.

## Human-in-the-loop

When `status` is `needs_clarification`, hosts **MUST** surface `questions` rather than inventing product intent. Interactive hosts (for example Cursor) ask the author; CI hosts leave a check failure or PR comment with the same questions. After answers, re-run evaluation or hand off to the [doc-only helper](./protocol/skills/mdcp-doc-only.md).

## CLI and library

- CLI: `mdcp evaluate-doc-coverage` — see [Evaluate doc coverage](../client-cli/evaluate-doc-coverage.md)
- Core: `evaluateDocCoverage` — see [API — Refs and validation](../client-core/api-refs-validation.md)

## Acceptance criteria

1. Given only docs-path changes, status is `covered`.
2. Given product-source changes with no matching feature/client shards, status is `missing_docs` with those surfaces listed.
3. Given contributor-tooling changes with no developer shards, status is `missing_docs` for `developer`.
4. Given only ambiguous paths, status is `needs_clarification` with non-empty `questions` — never `missing_docs`.
5. Advisory mode exits `0` for all three statuses; gate mode fails on non-covered statuses.
6. Host adapters only supply paths and render JSON — they do not encode taxonomy rules.

## Related

- [Documentation coverage scan](./coverage-scan.md)
- [Usage model](./protocol/usage-model.md)
- [Extensions and archetypes](./protocol/extensions-and-archetypes.md)
- [Doc-only helper](./protocol/skills/mdcp-doc-only.md)
