# LLM collaboration

Bootstrap and follow-up prompts for coding agents. For the value proposition, see [Why mdcp for coding agents](./why-mdcp-for-agents.md). Standalone copies live under [examples/prompts/](https://github.com/betsalel-williamson/mdcp/tree/main/examples/prompts).

## Bootstrap prompt (copy-paste)

Fill in the **Replace before sending** code block, then paste into Cursor Agent, Composer, Gemini CLI, or any shell-capable coding agent.

A standalone copy lives at [examples/prompts/docs-as-code-with-mdcp.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/docs-as-code-with-mdcp.prompt.md).

```markdown
**Replace before sending:**

    FEATURE=
    PERSONA=

Set up a sharded docs-as-code pipeline using **mdcp** for FEATURE above. Analyze this codebase, then write:

- feature docs under `docs/features/` (what the product does)
- developer docs under `docs/developer/` (how to maintain and develop the repo)
- end-user docs under `docs/client/` — open with `about-this-guide.md` stating PERSONA above
  Use mdcp commands only — do not create custom compile or lint scripts.

1. **Install** dev dependencies:
   `npm install -D @bwilliamson/mdcp-cli @bwilliamson/mdcp-presets markdownlint-cli2`

   Install [Vale](https://vale.sh/docs/vale-cli/installation/) separately so `vale` is on your `PATH`. After copying `.vale.ini`, run `vale sync` in that directory.

2. **Config** — Copy https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json to `docs/mdcp.config.json`. Update `compileOrder`, `guides`, and `vale.scanGlobs` for your guides. Set `lint.markdownlint` to the preset files in `node_modules/@bwilliamson/mdcp-presets/`. Copy `.vale.ini` from the same sample-guides directory.

3. **npm scripts** — Add to `package.json`:
   - `docs:compile` → `mdcp compile --config docs/mdcp.config.json --docs-root docs`
   - `docs:check` → `mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint`
   - `docs:context` → `mdcp export --llm --stdout --config docs/mdcp.config.json --docs-root docs`
   - `docs:refs` → `mdcp refs lookup`

4. **Guide layout** — Under `docs/`:
   - `docs/features/` — product capabilities, design, and API surface
   - `docs/developer/` — repo setup, layout, tests, releases, and other maintainer workflows
   - `docs/client/` — end-user guide; open with `about-this-guide.md` stating PERSONA above
     Each guide: `index.md` and topic shards. Shards are the source of truth — do not hand-edit `guides.md` or `refs.json`.

5. **Write and validate** — After shards exist:
   - `npm run docs:compile`
   - `npm run docs:check`
     Fix xref, orphan, and lint errors before finishing.

**Cross-links:** Run `mdcp refs lookup "<topic>" --format json` before inserting `[text](#slug)`. The slug must match **compiled** output, not the shard alone.
```

## Follow-up prompts

Use these after the pipeline exists.

**Add documentation for a new feature:**

```markdown
Add shards for feature "{{FEATURE}}" under `docs/features/`, update `docs/developer/` if maintainer workflows changed, and add an end-user section under `docs/client/`.
Update each guide's `index.md`, then `mdcp compile` and `mdcp check --require-lint`.
Use `mdcp refs lookup` for every cross-link. Do not edit `guides.md` by hand.
```

**Fix validation failures:**

```markdown
`npm run docs:check` failed. Read the error output, fix only shard `.md` files and config if needed, then re-run until check passes.
Use `mdcp refs lookup` to correct broken fragment links.
```

**Regenerate manifest after TOC change:**

```markdown
I updated `index.md` in guide `{{GUIDE_NAME}}`. Run `mdcp compile` and `mdcp check`.
```

## Spec-flow: document before you code

The key to working with LLMs on product work is documenting ideas in phases **before** asking the model to implement. Walk through requirements, design, and tasks — then implement. This spec-flow approach reduces scope creep and gives the agent a clear contract to work against.

| Document   | Holds                                                              |
| ---------- | ------------------------------------------------------------------ |
| User story | End-user value and experience                                      |
| Design     | Technical requirements, API specifications, implementation details |
| Task       | Concrete steps, acceptance criteria, and validation gates          |

Keep that separation when you document. LLMs tend to say "yes" and add scope even when not prompted — work within a value-stream mindset and split oversized features into smaller deliverables.

Example layout in your repo:

```text
.work-items/{feature_name}/
├── user-story.md
├── design.md
└── task.md
```

Author these as mdcp shards (or plain markdown) and `@`-reference them in agent sessions. Use `mdcp export --llm` to load only the compiled guides an agent needs for the current phase.

### Sharding keeps context lean

Split guidance into focused, load-on-demand documents rather than one monolithic prompt. mdcp models this pattern:

- **Core workflow** — bootstrap and npm scripts (this guide)
- **On demand** — phase-specific prompts below; `@`-reference only what the current task needs
- **Compiled context** — `npm run docs:context` for token-stripped output scoped to registered guides

Prefer structured prompts over permanently importing rigid always-on rules into every repo. Use intentional, phase-specific prompts to guide planning and implementation.

## Work item tracking

Task-type prompts use a **Replace before sending** code block at the top:

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

`WORK_ITEM_LOOKUP` should point agents at **your repo's developer docs** — not a fixed list of every tracker CLI and MCP. Each team documents its stack once during setup (see [Agent work-item tracking](../developer/agent-work-item-tracking.md) in this repo).

Example:

```text
WORK_ITEM=39
WORK_ITEM_LOOKUP=Branch from main (pull first). Load WORK_ITEM per docs/developer/agent-work-item-tracking.md.
```

General pattern and discovery order for consumer repos: [examples/prompts/work-item-tracking.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/work-item-tracking.md).

## Task-type prompt templates

Reusable templates for common work types. Each embeds a version-control workflow (feature branch, atomic commits, release notes, code review) and keeps **end-user value** front and center. Fill in the code block at the top of each template.

Standalone copies: [examples/prompts/README.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/README.md) (index of all templates).

### Doc-only task

**Best for:** Technical writers or developers focusing entirely on documentation, tutorials, or user manuals.

```markdown
**Replace before sending:**

    WORK_ITEM=
    WORK_ITEM_LOOKUP=

**Role:** Act as an expert Technical Writer.

**Setup:** Follow WORK_ITEM_LOOKUP above. Treat loaded acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this documentation brings — how does it help the user understand or use the product? Keep this value front and center while writing.

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Revise & write:** Add or revise mdcp shards under the appropriate guide (`docs/features/`, `docs/developer/`, `docs/client/`). Update each guide's `index.md` for compile order. Use `mdcp refs lookup` for every cross-link — do not edit `guides.md` or `refs.json` by hand.
- **Review:** Meta-review the shards for accuracy against the as-built software.
- **Refactor & clean:** Remove deprecated references. Ensure docs reflect the current product, not old workflows.
- **Validate:** Run `npm run docs:compile` and `npm run docs:check` until all gates pass.
- **Wrap-up:** Record what changed in your release process (changeset, changelog, or tracker comment). Highlight old workflows that are no longer recommended.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link WORK_ITEM above, and request review.
```

### Design architecture task

**Best for:** System architects or senior engineers drafting RFCs, ADRs, or data models before writing code.

```markdown
**Replace before sending:**

    WORK_ITEM=
    WORK_ITEM_LOOKUP=

**Role:** Act as an expert Systems Architect.

**Setup:** Follow WORK_ITEM_LOOKUP above. Treat loaded acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this architectural change unlocks (for example faster load times, higher reliability, or enabling a highly requested feature).

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Design first:** Draft the architecture (system diagrams, API contracts, data models) as shards under `docs/features/`. Focus on how the design enables the desired end-user experience.
- **Review:** Meta-review the proposed architecture with engineering to identify bottlenecks early.
- **Refactor & clean:** Retire superseded design shards or ADRs. Ensure docs reflect the intended as-built architecture.
- **Validate:** Run `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record architectural changes in your release process (changeset, changelog, or tracker note). Document old system behaviors or constraints that no longer apply.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link WORK_ITEM above, and request review.
```

### Feature-level task

**Best for:** Server-side or full-stack engineers implementing new logic, APIs, or core system functionality.

```markdown
**Replace before sending:**

    WORK_ITEM=
    WORK_ITEM_LOOKUP=

**Role:** Act as an expert Software Engineer.

**Setup:** Follow WORK_ITEM_LOOKUP above. Treat loaded acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this feature provides. How will this make the user's life easier or better?

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Docs first & TDD:** Start with a docs-first pass — shards under `docs/features/` and `docs/client/` defining how the feature _should_ work for the user. Then use TDD to implement the core logic.
- **Review:** Meta-code review focusing on edge cases and performance.
- **Refactor & clean:** Refactor code, pay down relevant tech debt, update shards to match as-built behavior, and remove stale references.
- **Validate:** Run tests, then `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record what changed in your release process (changeset, changelog, or tracker comment). Detail any old behavior that no longer works.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link WORK_ITEM above, and request review.
```

### UX task

**Best for:** UX designers or frontend engineers focusing on interfaces, user flows, and accessibility.

```markdown
**Replace before sending:**

    WORK_ITEM=
    WORK_ITEM_LOOKUP=

**Role:** Act as an expert UX Designer and Frontend Engineer.

**Setup:** Follow WORK_ITEM_LOOKUP above. Treat loaded acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this UI/UX change brings. Focus on reducing friction, improving accessibility, and creating a delightful user journey.

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Design & implement:** Map the ideal user flow in shards under `docs/client/` (docs/specs first). Implement UI components; use TDD for frontend components where applicable.
- **Review:** Meta-review code and user flows with design/product stakeholders.
- **Refactor & clean:** Consolidate UI patterns. Update client-guide shards to match the as-built interface; remove references to old UI patterns.
- **Validate:** Run component tests, then `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record visual and interactive changes in your release process (changeset, changelog, or tracker comment). Highlight old UI behaviors or workflows that no longer exist.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link WORK_ITEM above, and request review.
```

## Phase-specific structured prompts

Short prompts for individual spec-flow phases. Each uses a **Replace before sending** code block at the top; the body stays static.

**User story (end-user value):**

```markdown
**Replace before sending:**

    FEATURE=

Create a user story in `.work-items/[feature]/user-story.md` using FEATURE above.
Lead with end-user value: who benefits, what problem is solved, and how success is measured.
Keep experience and outcomes here — defer API and implementation details to the design doc.
```

**Technical design (implementation details):**

```markdown
**Replace before sending:**

    FEATURE=

Create a technical design in `.work-items/[feature]/design.md` using FEATURE above.
Cover requirements, API contracts, data models, and edge cases.
Link to the user story for value context. When design stabilizes, add or update shards under `docs/features/`.
```

**Task breakdown:**

```markdown
**Replace before sending:**

    FEATURE=

Create an implementation task list in `.work-items/[feature]/task.md` using FEATURE above.
Break work into atomic steps with acceptance criteria and validation gates (`npm test`, `npm run docs:check`).
Reference the design doc — do not expand scope beyond what the user story justifies.
```

**Architecture decision:**

```markdown
**Replace before sending:**

    FEATURE=
    DECISION_QUESTION=

Evaluate DECISION_QUESTION above. Draft an ADR in `.work-items/[feature]/adr-[short-name].md`.
State context, options considered, decision, and consequences. When accepted, add a summary shard under `docs/features/`.
```

## Toolchain integration

mdcp exposes a **tool-agnostic contract**: agents need shell access and the ability to edit `.md` files. Wire the same npm scripts regardless of which agent you use.

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

| Tool                                         | How mdcp fits                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cursor / Composer**                        | Paste the bootstrap prompt in Agent or Composer. `@`-reference shard files under `docs/features/`, `docs/developer/`, or `docs/client/` for local context. Run `npm run docs:check` before ending a turn. Optional: copy [examples/agent-rules/docs-as-code.mdc](https://github.com/betsalel-williamson/mdcp/blob/main/examples/agent-rules/docs-as-code.mdc) into your repo's `.cursor/rules/`. |
| **Gemini CLI** (and similar terminal agents) | Start a session with `npm run docs:context` output as context, or instruct the agent to run it. Agent edits shards only — never `guides.md`. Verify with `npm run docs:check`.                                                                                                                                                                                                                   |
| **Generic CI / headless agents**             | Same npm scripts. `mdcp check` exit code is the quality gate.                                                                                                                                                                                                                                                                                                                                    |
| **Any agent writing links**                  | `npm run docs:refs -- "topic"` or `mdcp refs lookup "topic" --format json` before inserting cross-links.                                                                                                                                                                                                                                                                                         |

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

Never hand-edit generated `guides.md` or `refs.json`.

**Worked example:** this repository dogfoods under [`docs/features/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/features) (tool capabilities), [`docs/developer/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/developer) (repo development), and [`docs/client-cli/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/client-cli) (consumer adoption), wired by [`docs/mdcp.config.json`](https://github.com/betsalel-williamson/mdcp/blob/main/docs/mdcp.config.json). For a minimal fixture, see [examples/sample-guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides).

## Human review checklist

When reviewing an agent's documentation PR:

- Only shard `.md` files and config changed — not hand-edited `guides.md` or `refs.json`
- `index.md` link order matches intended compile order (use `compile.sectionsHeading` when the manifest has preamble example links)
- `npm run docs:check` passes locally and in CI
- Cross-links use slugs from `mdcp refs lookup`, not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`
- Task-type prompts fill in only the top code block (`WORK_ITEM`, `WORK_ITEM_LOOKUP`) — see [Work item tracking](#work-item-tracking)

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
- [examples/prompts/](https://github.com/betsalel-williamson/mdcp/tree/main/examples/prompts) — standalone copy-paste prompt files
- [Project layout](./project-layout.md) — shard directory structure
- [Cross-links and refs](./cross-links-and-refs.md) — slug lookup while authoring
- [Optional linters](./optional-linters.md) — markdownlint, Vale, link check peers
