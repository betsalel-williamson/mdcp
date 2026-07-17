# Getting-started helper

Product capability: the **`mdcp-getting-started`** helper skill bootstraps MDCP
in a greenfield or brownfield repository — config, four-tier guide layout, and
initial shards — so teams can adopt the documentation pipeline once and hand off
to day-to-day helpers.

Invoke (after the parent skill is installed):

```text
/mdcp-getting-started
```

Upstream pack: [`skills/mdcp-getting-started/`](../../../../skills/mdcp-getting-started/SKILL.md).
Shared helper contract (intake, guide placement, glossary): [Helper Skills](../agent-task-prompts.md).

## End-user value

Contributors get a working MDCP layout (guides, compile/check scripts, glossary
hooks) without inventing structure from scratch. Brownfield repos keep legacy
docs until review instead of destructive overwrite. The project’s glossary
**inclusion bar** is recorded up front so later helpers know which terms belong.

## What this helper is for

| Obligation                | As-built expectation                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Bootstrap intake          | Ask for `FEATURE`, `PERSONA`, and `EXPERIENCE` (novice vs expert) before editing                                   |
| Inspect repo state        | Detect greenfield vs brownfield; discover package manager and existing docs before scaffolding                     |
| Install toolchain         | Add CLI/presets with the repo’s package manager; wire `mdcp compile` / `mdcp check` into scripts                   |
| Scaffold four-tier guides | Create `docs/features/`, `docs/client/`, `docs/developer/`, `docs/glossary/` with indexes and starter shards       |
| Glossary inclusion bar    | With the end user, record the project inclusion bar in the glossary index preamble (what terms do / do not belong) |
| Seed domain terms         | Add initial glossary entries that meet the bar; link from starter shards                                           |
| Brownfield migration      | Scaffold **alongside** legacy docs; mark migrated legacy files ready to archive — never auto-delete                |
| Experience-adaptive depth | Novice: tutorial shards and concept pauses; expert: concise FEATURE starters only                                  |
| Validate                  | Run `mdcp compile` / `mdcp check` until clean; hand off to other helpers for ongoing work                          |

## What this helper is not

- **Day-to-day feature delivery (docs + code + tests)** — use
  [mdcp-feature-level](./mdcp-feature-level.md).
- **Docs-only cleanup or shard refactor with no bootstrap** — use
  [mdcp-doc-only](./mdcp-doc-only.md).
- **Architecture-as-shards / ADR drafting** — use
  [mdcp-design-architecture](./mdcp-design-architecture.md).
- **End-user / client journey and workflow design** — use [mdcp-ux](./mdcp-ux.md).
- **Code TDD rituals, atomic commit grouping, or local engineering process** —
  out of scope; use separate coding skills when implementing product code.
- **Inventing the inclusion bar without the end user** — the bar is project
  judgment recorded with the people who own the docs, not a one-size-fits-all list.

When the user asks for ongoing feature or docs work in the same session as
bootstrap, this helper **MUST** finish setup (or ask to narrow scope) and state
next steps for the matching day-to-day helper.

## Acceptance (as-built)

A successful getting-started session typically:

1. Leaves a configured docs root (`mdcp.config.json`, compile/check scripts)
2. Creates or updates the four-tier guide layout with discoverable indexes
3. Records the project glossary inclusion bar in the glossary (end-user agreed)
4. Seeds any initial domain terms that meet that bar
5. Preserves brownfield legacy files (archive banners only — no auto-delete)
6. Passes `mdcp check` (and repo docs validation)
7. Hands off clearly to feature-level, doc-only, design-architecture, or UX

Optional local with/without-skill grading for this helper:
[mdcp-getting-started live evals](../../../../tests/skills/mdcp-getting-started/evals/README.md)
(maintainer workflow — not a CI gate). See [Live skill evals](../../../developer/live-skill-evals.md).
