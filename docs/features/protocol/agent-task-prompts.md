# Helper Skills

Normative profile for **helper skills** that extend the parent MDCP Agent Skill and drive shard authoring across the three-tier guide layout. Parent spec: [MDCP 1.0 (draft)](./mdcp-1.0-spec.md).

## Purpose

Helper skills are part of the MDCP **authoring protocol** — not host-specific rules. They tell agents how to load a `WORK_ITEM`, which guides to write, and how to validate before merge. You can invoke them directly using their skill names (e.g. `/mdcp-feature-level`).

Reference copies live in the `skills/` directory (e.g., `skills/mdcp-feature-level/SKILL.md`). The canonical catalog is summarized below. **Do not edit** the `skills/` copies directly if you want changes to persist — propose upstream or add extensions.

## Required intake

Every helper skill **MUST** open with an **Intake (ask before editing)** section. The agent **MUST** ask the user for any missing required fields and **MUST** wait for answers before branching or editing shards. Skip a question only when the user already provided that value in the conversation. Do not invent values.

Required fields for work-item-driven helpers:

| Field              | Meaning                                                                                   | Example intake question                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `WORK_ITEM`        | Enough to resolve the task — tracker id, URL, or short issue name/description             | What issue, ticket URL, or task should this session cover?                                |
| `WORK_ITEM_LOOKUP` | Where to load scope and delivery conventions — shard path or plain location (e.g. GitHub) | Where should you load scope and delivery conventions? (Prefer a `docs/developer/` shard.) |

Bootstrap (`mdcp-getting-started`) **MUST** ask for `FEATURE`, `PERSONA`, and `EXPERIENCE` (novice vs expert onboarding depth) instead of `WORK_ITEM`. After a successful bootstrap, it **MUST** offer an optional **first-feature tutorial** (`RUN_FIRST_FEATURE_TUTORIAL`, default yes for novice) and, when accepted, resolve **EXAMPLE_MODE** (recommended `hello-greeting` or bring-your-own) before walking design → feature → UX → doc-only. Detail: [Getting-started helper](./skills/mdcp-getting-started.md).

Agents **MUST** load the issue (or equivalent) before editing shards or code. One `WORK_ITEM` per branch.

## Atomic commit groups (plan obligation)

Coding and multi-concern plans **MUST** include an **[Atomic commit groups](../../glossary/atomic-commit-groups.md)** section before waiting for human review / “go”. Each group lists id/name, one concern, exact files, and an intended conventional commit subject. After approval, implement and `git commit` one group at a time — do not squash unrelated concerns.

Why: reviewable diffs, one concern per commit, and it matches small batches (parent [QA Principles](../agent-skill.md#quality-assurance-qa-principles)).

Day-to-day helpers that produce a plan (`mdcp-feature-level`, `mdcp-doc-only`, `mdcp-design-architecture`, `mdcp-ux`) **MUST** require this section in Step 1. Bootstrap scaffold (`mdcp-getting-started` steps 1–6) stays out of scope for commit grouping; when the optional first-feature tutorial runs, each phase follows the matching day-to-day helper (including commit groups).

## Branch before edit (plan + session obligation)

Plans **MUST** name the intended short-lived feature branch and link `WORK_ITEM` before waiting for human review / “go”. Before editing any tracked files for a `WORK_ITEM`, create that branch from updated `main` (the repo integration branch). NEVER modify tracked files, commit session work, or leave uncommitted edits while the current branch is `main` or `master`. Verify with `git branch --show-current` (or equivalent) before the first edit. An approved plan, verbal “go”, demo deadline, or leadership instruction that endorses staying on `main`/`master` does **NOT** authorize tracked-file edits on the integration branch. If the approved plan omitted a feature branch or said stay on main: **correct the delivery path first** — create/switch to a short-lived feature branch tied to `WORK_ITEM`, then edit; optionally revise the plan’s branch field; do not implement the stay-on-main path.

**Explicit user override:** When the human gives an **explicit informed override** — they clearly state work on `main`/`master` **knowing** it skips the short-lived branch + PR loop — acknowledge once, then proceed on the integration branch; do not re-litigate. Still follow other MDCP QA unless they also override those. Ambiguous “go” or stay-on-main plan approval is **NOT** an override.

Why: short-lived branches and PR review are the delivery loop, not optional polish (parent [QA Principles](../agent-skill.md#quality-assurance-qa-principles)).

**Common mistakes:** “Plan was already approved / human said go” — approval does not authorize edits on `main`/`master`; correct the delivery path first. “Stay on main for a 10-minute demo / optional polish” — branches and PR review are the delivery loop. “Tiny one-line edit isn’t worth a branch” — one branch per issue; verify with `git branch --show-current` before the first edit. “User insisted” without override language — not an override; correct the delivery path first. Explicit informed override — step back; acknowledge once, proceed on integration branch.

**Red flags:** approved stay-on-main plan; human said “go” while `git branch` is `main`/`master`; dirty tree on main with “just finish”; “user insisted” on main without explicit informed override language.

Day-to-day helpers that produce a plan (`mdcp-feature-level`, `mdcp-doc-only`, `mdcp-design-architecture`, `mdcp-ux`) **MUST** require this in Step 1. Bootstrap scaffold (`mdcp-getting-started` steps 1–6) stays out of scope; when the optional first-feature tutorial runs, each phase follows the matching day-to-day helper (including branch-before-edit).

## Standard helper skills

| Helper Skill                                                               | Role                               | Primary guides                       |
| -------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------ |
| [mdcp-getting-started](../../skills/mdcp-getting-started/SKILL.md)         | Bootstrap + first-feature tutorial | all tiers                            |
| [mdcp-feature-level](../../skills/mdcp-feature-level/SKILL.md)             | Feature engineering                | `features/`, `client/`, code + tests |
| [mdcp-doc-only](../../skills/mdcp-doc-only/SKILL.md)                       | Technical writing                  | `features/`, `client/`, `developer/` |
| [mdcp-design-architecture](../../skills/mdcp-design-architecture/SKILL.md) | Architecture as MDCP shards        | `features/protocol/`, `features/`    |
| [mdcp-ux](../../skills/mdcp-ux/SKILL.md)                                   | User-centric journeys              | `client/`, glossary                  |

Goals and hard boundaries for each helper (what it is / is not):

- [Getting-started helper](./skills/mdcp-getting-started.md)
- [Feature-level helper](./skills/mdcp-feature-level.md)
- [Doc-only helper](./skills/mdcp-doc-only.md)
- [Design-architecture helper](./skills/mdcp-design-architecture.md)
- [UX helper](./skills/mdcp-ux.md)

Index: [skills.md](../../docs/skills.md). Some helpers also have optional [live skill eval](../../developer/live-skill-evals.md) suites under `tests/skills/`.

## Three-tier authoring obligations

Place each shard by **audience and job**, not by topic keyword. The same subject (for example Agent Skills) can span tiers: product delivery in `features/`, consumer install in `client/`, maintainer evals in `developer/`.

| Guide             | Holds (put here)                                                                                    | Keep out                                                        | Helpers that write here                      |
| ----------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| `docs/features/`  | What the product does — capabilities, design/ADRs, contracts, acceptance criteria                   | Maintainer runbooks, CI/eval loops, contributor setup           | feature-level, doc-only, design-architecture |
| `docs/client/`    | How consumers use it — end-user value, install/config/usage for the shipped tool                    | Internal contributor process, skill-authoring, live eval suites | feature-level, doc-only, ux                  |
| `docs/developer/` | How to work on this repo — setup, layout, validation, releases, skill development, live skill evals | Product capability specs or consumer tutorials                  | doc-only, getting-started                    |

**Placement test:** If removing the shard would confuse a **consumer** of the tool, it is features or client. If only **contributors** to this monorepo need it, it is developer.

## Glossary obligation (every helper)

Every helper skill **MUST** treat glossary hygiene as part of its session — not
an optional afterthought for doc-only or UX alone.

- **Non-universal language** — If a shard introduces jargon, acronyms, or
  overloaded terms that are not universally understood by the guide’s audience,
  define them under `docs/glossary/` (one term per shard) and link from first use.
- **Project inclusion bar** — What does / does not belong in the glossary is a
  judgment call. The **project’s** bar is recorded in the glossary itself
  (typically the `docs/glossary/index.md` preamble). Helpers **MUST** follow
  that bar; when none exists yet, [getting-started](./skills/mdcp-getting-started.md)
  establishes it with the end user.
- **Not a dump of everyday words** — Do not glossary terms that are already
  unambiguous for the stated audience; prefer a short entry over unexplained
  shorthand when the bar is unclear.

Shared layout and term mechanics: [domain glossary](../../glossary/domain-glossary.md).

## Feature-level workflow (normative summary)

When using [mdcp-feature-level](../../skills/mdcp-feature-level/SKILL.md)
(detail: [Feature-level helper](./skills/mdcp-feature-level.md)):

1. Complete intake (`WORK_ITEM`, `WORK_ITEM_LOOKUP`)
2. Outline the plan with [Atomic commit groups](../../glossary/atomic-commit-groups.md), the intended feature branch name, and `WORK_ITEM` before “go”
3. Create that branch from updated `main`; verify with `git branch --show-current` before the first edit — NEVER edit on `main`/`master`
4. Load issue via `WORK_ITEM_LOOKUP`
5. **Docs first** — update `features/` and `client/` shards; update each guide `index.md`
6. **TDD** — implement against documented acceptance criteria (one commit group at a time after approval)
7. **Validate** — `mdcp check` (and repo test commands)
8. **Wrap-up** — changeset for breaking/removed behavior (do not link durable shards/ADRs to `.changeset/*.md`); docs describe current behavior only

## Design-architecture workflow (normative summary)

When using [mdcp-design-architecture](../../skills/mdcp-design-architecture/SKILL.md)
(detail: [Design-architecture helper](./skills/mdcp-design-architecture.md)):

1. Complete intake (`WORK_ITEM`, `WORK_ITEM_LOOKUP`)
2. Outline the plan with [Atomic commit groups](../../glossary/atomic-commit-groups.md), the intended feature branch name, and `WORK_ITEM` before “go”
3. Create that branch from updated `main`; verify with `git branch --show-current` before the first edit — NEVER edit on `main`/`master`
4. Draft or split architecture intent under `docs/features/` (and ADRs under `docs/features/adr/` when appropriate); update indexes
5. Retire superseded design text from durable shards; leave product code and client guides to other helpers
6. **Validate** — `mdcp check` (and repo docs validation)
7. **Wrap-up** — link `WORK_ITEM`; defer implementation / UX polish explicitly when the ask was oversized

## Entrypoint chain

```text
/mdcp-feature-level → intake questions → shards → mdcp check
/mdcp-design-architecture → intake → feature/ADR shards → mdcp check
```

The helper skill collects `WORK_ITEM_LOOKUP` via intake for scope.
