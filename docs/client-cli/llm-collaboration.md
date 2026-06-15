# LLM collaboration

Bootstrap and task prompts for coding agents. For the value proposition, see [Why mdcp for coding agents](./why-mdcp-for-agents.md).

**Source of truth:** copy-paste prompts live under [examples/prompts/](https://github.com/betsalel-williamson/mdcp/tree/main/examples/prompts). This page indexes them and covers mdcp-specific workflow — not full prompt text.

## Prompt library

Copy from [examples/prompts/](https://github.com/betsalel-williamson/mdcp/tree/main/examples/prompts). Index: [README.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/README.md).

- [docs-as-code-with-mdcp.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/docs-as-code-with-mdcp.prompt.md) — bootstrap a sharded docs pipeline
- [work-item-tracking.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/work-item-tracking.md) — `WORK_ITEM` and `WORK_ITEM_LOOKUP` pattern
- [doc-only-task.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/doc-only-task.prompt.md) — documentation-only work
- [design-architecture-task.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/design-architecture-task.prompt.md) — RFCs, ADRs, data models
- [feature-level-task.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/feature-level-task.prompt.md) — feature work, docs-first
- [ux-task.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/ux-task.prompt.md) — UI flows and client-guide updates
- [phase-spec-flow.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/phase-spec-flow.prompt.md) — user story, design, task, ADR phases

Each prompt uses a **Replace before sending** code block at the top; the agent plans from repo context rather than vendor-specific commands baked into the template.

## Bootstrap prompt (copy-paste)

First-time setup for a consumer repo: [examples/prompts/docs-as-code-with-mdcp.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/docs-as-code-with-mdcp.prompt.md).

Fill in `FEATURE=` and `PERSONA=`, then send. The prompt instructs the agent to inspect the repository and mdcp docs before installing or configuring.

## Follow-up prompts

Use these after the pipeline exists (inline here — not duplicated in `examples/prompts/`).

**Add documentation for a new feature:**

```markdown
Add shards for feature "{{FEATURE}}" under `docs/features/`, update `docs/developer/` if maintainer workflows changed, and add an end-user section under `docs/client/`.
Update each guide's `index.md`, then run this repo's mdcp compile and check commands.
Use `mdcp refs lookup` for every cross-link. Do not edit generated compile output by hand.
```

**Fix validation failures:**

```markdown
Documentation check failed. Read the error output, fix only shard `.md` files and config if needed, then re-run until check passes.
Use `mdcp refs lookup` to correct broken fragment links.
```

**Regenerate manifest after TOC change:**

```markdown
I updated `index.md` in guide `{{GUIDE_NAME}}`. Run mdcp compile and check using this repo's documented commands.
```

## Spec-flow: document before you code

Document in phases **before** implementation. Walk through requirements, design, and tasks — then implement. This reduces scope creep and gives the agent a clear contract.

| Document   | Holds                                                              |
| ---------- | ------------------------------------------------------------------ |
| User story | End-user value and experience                                      |
| Design     | Technical requirements, API specifications, implementation details |
| Task       | Concrete steps, acceptance criteria, and validation gates          |

Example layout:

```text
.work-items/{feature_name}/
├── user-story.md
├── design.md
└── task.md
```

Phase prompts: [examples/prompts/phase-spec-flow.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/phase-spec-flow.prompt.md).

### Sharding keeps context lean

- **Core workflow** — bootstrap prompt and repo script wiring
- **On demand** — task-type and phase prompts from `examples/prompts/`; load only what the current task needs
- **Compiled context** — `mdcp export --llm` for token-stripped output scoped to registered guides

Prefer structured prompts over permanently importing rigid always-on rules into every repo.

## Work item tracking

Task-type prompts start with `WORK_ITEM=` and `WORK_ITEM_LOOKUP=`. Pattern and discovery order: [examples/prompts/work-item-tracking.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/work-item-tracking.md).

This repository documents its stack in [Agent work-item tracking](../developer/agent-work-item-tracking.md) — link there from `WORK_ITEM_LOOKUP` when dogfooding mdcp.

## Task-type prompt templates

- [doc-only-task.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/doc-only-task.prompt.md) — technical writers; documentation, tutorials, guides
- [design-architecture-task.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/design-architecture-task.prompt.md) — architects; RFCs, ADRs, data models before code
- [feature-level-task.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/feature-level-task.prompt.md) — server-side or full-stack feature work
- [ux-task.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/ux-task.prompt.md) — UX and frontend; flows, accessibility, client guides

## Toolchain integration

mdcp exposes a **tool-agnostic contract**: agents need shell access and the ability to edit `.md` files.

- **Cursor / Composer** — paste prompts from `examples/prompts/`; reference shard files for context; run the repo's doc check before ending a turn
- **Terminal agents** — start with `mdcp export --llm` output; edit shards only; verify with the repo's doc check
- **CI / headless agents** — wire npm scripts; `mdcp check` exit code is the quality gate
- **Cross-links** — `mdcp refs lookup "topic" --format json` before inserting fragment links

Example npm scripts:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --docs-root docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint",
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --docs-root docs",
    "docs:refs": "mdcp refs lookup"
  }
}
```

For npm script stubs only, see [Agent integration](./agent-integration.md).

## Three-tier doc layout

Split documentation into three guides:

| Guide directory   | Audience                   | Typical content                                                    |
| ----------------- | -------------------------- | ------------------------------------------------------------------ |
| `docs/features/`  | Maintainers, coding agents | What the product does — capabilities, design, API surface          |
| `docs/developer/` | Maintainers, contributors  | How to work on the repo — setup, layout, tests, releases           |
| `docs/client/`    | End users                  | How to use the product; persona and scope in `about-this-guide.md` |

Each guide directory needs:

- `index.md` — human table of contents (links to shard files; compile order comes from link order here)
- Topic shards — one file per section (for example `authentication.md`)
- Optional `about-this-guide.md` — preamble shard (persona, scope)

When a manifest has preamble prose with example links (not section shards), set `compile.sectionsHeading` in config (see [Manifest compile order](../features/manifest-compile-order.md)).

Never hand-edit generated compile output or `refs.json`.

**Worked example:** this repository dogfoods under [`docs/features/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/features), [`docs/developer/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/developer), and [`docs/client-cli/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/client-cli), wired by [`docs/mdcp.config.json`](https://github.com/betsalel-williamson/mdcp/blob/main/docs/mdcp.config.json). Minimal fixture: [examples/sample-guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides).

## Human review checklist

When reviewing an agent's documentation PR:

- Only shard `.md` files and config changed — not hand-edited generated compile output or `refs.json`
- `index.md` link order matches intended compile order (use `compile.sectionsHeading` when the manifest has preamble example links)
- Doc check passes locally and in CI (repo's documented commands)
- Cross-links use slugs from `mdcp refs lookup`, not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`
- Task prompts use only the top replace block — see [work-item-tracking.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/work-item-tracking.md)

## Legacy script port map

If you previously used bash/Python compile scripts, replace them with mdcp commands:

| Legacy pattern                    | Use mdcp instead                                                       |
| --------------------------------- | ---------------------------------------------------------------------- |
| Custom shard / split scripts      | `mdcp shard` (split only; requires `source` in config)                 |
| Custom compile / heading demotion | `mdcp compile`                                                         |
| Separate markdownlint configs     | `@bwilliamson/mdcp-presets` shard + compiled configs                   |
| Custom xref lint scripts          | `mdcp check` (built-in xref lint)                                      |
| Hand-maintained anchor registries | `mdcp refs lookup` / `refs.json` (GitHub slugs on **compiled** output) |
| Custom Vale term lists in scripts | `.vale.ini` + custom YAML in your repo                                 |
| Shell validate wrappers           | `mdcp check --require-lint` (+ optional `--require-vale`)              |

Full port map: [Legacy migration](../features/legacy-migration.md).

## See also

- [Why mdcp for coding agents](./why-mdcp-for-agents.md) — value proposition
- [Agent integration](./agent-integration.md) — npm scripts quick reference
- [examples/prompts/](https://github.com/betsalel-williamson/mdcp/tree/main/examples/prompts) — copy-paste prompt files
- [Project layout](./project-layout.md) — shard directory structure
- [Cross-links and refs](./cross-links-and-refs.md) — slug lookup while authoring
- [Optional linters](./optional-linters.md) — markdownlint, Vale, link check peers
