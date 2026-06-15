# @bwilliamson/mdcp-cli

## Why mdcp for coding agents

**mdcp** splits, compiles, validates, and exports sharded Markdown documentation. You edit small shard files; mdcp weaves them into compiled output with correct heading levels, working cross-links, and structure checks.

### Why use it with coding agents?

Agents edit individual `.md` shards instead of a monolithic README. mdcp compiles shards into a single guide, validates cross-references, and exports token-stripped context (`mdcp export --llm`) for the next agent turn. No custom bash or Python compile scripts to maintain.

**Get started:** copy the [bootstrap prompt](#bootstrap-prompt-copy-paste) below into Cursor Agent, Composer, Gemini CLI, or any shell-capable agent. Fill in `{{FEATURE}}` and `{{PERSONA}}`.

For depth on capabilities and design, read the [feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md).

## LLM collaboration

Bootstrap and follow-up prompts for coding agents. For the value proposition, see [Why mdcp for coding agents](#why-mdcp-for-coding-agents). Standalone copies live under [examples/prompts/](https://github.com/betsalel-williamson/mdcp/tree/main/examples/prompts).

### Bootstrap prompt (copy-paste)

Fill in `{{FEATURE}}` and `{{PERSONA}}`, then paste into Cursor Agent, Composer, Gemini CLI, or any shell-capable coding agent.

A standalone copy lives at [examples/prompts/docs-as-code-with-mdcp.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/docs-as-code-with-mdcp.prompt.md).

```markdown
For the feature: {{FEATURE}}

The end user for client docs is: {{PERSONA}}

Set up a sharded docs-as-code pipeline using **mdcp**. Analyze this codebase, then write:

- feature docs under `docs/features/` (what the product does)
- developer docs under `docs/developer/` (how to maintain and develop the repo)
- end-user docs under `docs/client/`
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
   - `docs/client/` — end-user guide; open with `about-this-guide.md` stating the persona above
     Each guide: `index.md` and topic shards. Shards are the source of truth — do not hand-edit `guides.md` or `refs.json`.

5. **Write and validate** — After shards exist:
   - `npm run docs:compile`
   - `npm run docs:check`
     Fix xref, orphan, and lint errors before finishing.

**Cross-links:** Run `mdcp refs lookup "<topic>" --format json` before inserting `[text](#slug)`. The slug must match **compiled** output, not the shard alone.
```

### Follow-up prompts

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

### Spec-flow: document before you code

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

#### Sharding keeps context lean

Split guidance into focused, load-on-demand documents rather than one monolithic prompt. mdcp models this pattern:

- **Core workflow** — bootstrap and npm scripts (this guide)
- **On demand** — phase-specific prompts below; `@`-reference only what the current task needs
- **Compiled context** — `npm run docs:context` for token-stripped output scoped to registered guides

Prefer structured prompts over permanently importing rigid always-on rules into every repo. Use intentional, phase-specific prompts to guide planning and implementation.

### Work item tracking

Task-type prompts use placeholders for **your** project-management stack — not only GitHub. Wire whichever tracker your agent can reach: shell CLI, MCP server, or local spec files.

| Placeholder       | Replace with                                                          |
| ----------------- | --------------------------------------------------------------------- |
| `{{WORK_ITEM}}`   | Issue/ticket ID, URL, Linear key, Notion page, or `.work-items/` path |
| `{{BASE_BRANCH}}` | Integration branch (often `main`)                                     |
| `{{FEATURE}}`     | Short feature slug for `.work-items/` paths and doc shards            |

**Shell CLI** — `gh issue view`, `glab issue view`, `jira issue view`, and similar.

**MCP** — Linear, Notion, GitHub, or Jira MCP tools (structured fetch; uses IDE auth).

**Local specs** — `.work-items/{{FEATURE}}/user-story.md`, `design.md`, `task.md`; `@`-reference in Cursor or paste into the session.

**Delivery** — Map "changeset/changelog" and "pull request" to your repo (Changesets, `CHANGELOG.md`, GitLab MR, tracker comments).

Full examples and Setup customization: [examples/prompts/work-item-tracking.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/work-item-tracking.md).

### Task-type prompt templates

Reusable templates for common work types. Each embeds a version-control workflow (feature branch, atomic commits, release notes, code review) and keeps **end-user value** front and center. Replace placeholders per the table above.

Standalone copies: [examples/prompts/README.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/README.md) (index of all templates).

#### Doc-only task

**Best for:** Technical writers or developers focusing entirely on documentation, tutorials, or user manuals.

```markdown
**Role:** Act as an expert Technical Writer.

**Setup:** Create a feature branch from `{{BASE_BRANCH}}` (sync with remote first). Load work item **{{WORK_ITEM}}** using your team's tracker — shell CLI (`gh`, `glab`, `jira`), MCP (Linear, Notion, GitHub), or local `.work-items/{{FEATURE}}/` spec files. Treat acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this documentation brings — how does it help the user understand or use the product? Keep this value front and center while writing.

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Revise & write:** Add or revise mdcp shards under the appropriate guide (`docs/features/`, `docs/developer/`, `docs/client/`). Update each guide's `index.md` for compile order. Use `mdcp refs lookup` for every cross-link — do not edit `guides.md` or `refs.json` by hand.
- **Review:** Meta-review the shards for accuracy against the as-built software.
- **Refactor & clean:** Remove deprecated references. Ensure docs reflect the current product, not old workflows.
- **Validate:** Run `npm run docs:compile` and `npm run docs:check` until all gates pass.
- **Wrap-up:** Record what changed in your release process (changeset, changelog, or tracker comment). Highlight old workflows that are no longer recommended.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link **{{WORK_ITEM}}**, and request review.
```

#### Design architecture task

**Best for:** System architects or senior engineers drafting RFCs, ADRs, or data models before writing code.

```markdown
**Role:** Act as an expert Systems Architect.

**Setup:** Create a feature branch from `{{BASE_BRANCH}}` (sync with remote first). Load work item **{{WORK_ITEM}}** using your team's tracker — shell CLI (`gh`, `glab`, `jira`), MCP (Linear, Notion, GitHub), or local `.work-items/{{FEATURE}}/` spec files. Treat acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this architectural change unlocks (for example faster load times, higher reliability, or enabling a highly requested feature).

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Design first:** Draft the architecture (system diagrams, API contracts, data models) as shards under `docs/features/`. Focus on how the design enables the desired end-user experience.
- **Review:** Meta-review the proposed architecture with engineering to identify bottlenecks early.
- **Refactor & clean:** Retire superseded design shards or ADRs. Ensure docs reflect the intended as-built architecture.
- **Validate:** Run `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record architectural changes in your release process (changeset, changelog, or tracker note). Document old system behaviors or constraints that no longer apply.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link **{{WORK_ITEM}}**, and request review.
```

#### Feature-level task

**Best for:** Server-side or full-stack engineers implementing new logic, APIs, or core system functionality.

```markdown
**Role:** Act as an expert Software Engineer.

**Setup:** Create a feature branch from `{{BASE_BRANCH}}` (sync with remote first). Load work item **{{WORK_ITEM}}** using your team's tracker — shell CLI (`gh`, `glab`, `jira`), MCP (Linear, Notion, GitHub), or local `.work-items/{{FEATURE}}/` spec files. Treat acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this feature provides. How will this make the user's life easier or better?

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Docs first & TDD:** Start with a docs-first pass — shards under `docs/features/` and `docs/client/` defining how the feature _should_ work for the user. Then use TDD to implement the core logic.
- **Review:** Meta-code review focusing on edge cases and performance.
- **Refactor & clean:** Refactor code, pay down relevant tech debt, update shards to match as-built behavior, and remove stale references.
- **Validate:** Run tests, then `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record what changed in your release process (changeset, changelog, or tracker comment). Detail any old behavior that no longer works.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link **{{WORK_ITEM}}**, and request review.
```

#### UX task

**Best for:** UX designers or frontend engineers focusing on interfaces, user flows, and accessibility.

```markdown
**Role:** Act as an expert UX Designer and Frontend Engineer.

**Setup:** Create a feature branch from `{{BASE_BRANCH}}` (sync with remote first). Load work item **{{WORK_ITEM}}** using your team's tracker — shell CLI (`gh`, `glab`, `jira`), MCP (Linear, Notion, GitHub), or local `.work-items/{{FEATURE}}/` spec files. Treat acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this UI/UX change brings. Focus on reducing friction, improving accessibility, and creating a delightful user journey.

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Design & implement:** Map the ideal user flow in shards under `docs/client/` (docs/specs first). Implement UI components; use TDD for frontend components where applicable.
- **Review:** Meta-review code and user flows with design/product stakeholders.
- **Refactor & clean:** Consolidate UI patterns. Update client-guide shards to match the as-built interface; remove references to old UI patterns.
- **Validate:** Run component tests, then `npm run docs:compile` and `npm run docs:check`.
- **Wrap-up:** Record visual and interactive changes in your release process (changeset, changelog, or tracker comment). Highlight old UI behaviors or workflows that no longer exist.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link **{{WORK_ITEM}}**, and request review.
```

### Phase-specific structured prompts

Short prompts for individual spec-flow phases. Adapt the format to your repo's standards files or `.work-items/` layout.

**User story (end-user value):**

```markdown
Create a user story for {{FEATURE}} in `.work-items/{{FEATURE}}/user-story.md`.
Lead with end-user value: who benefits, what problem is solved, and how success is measured.
Keep experience and outcomes here — defer API and implementation details to the design doc.
```

**Technical design (implementation details):**

```markdown
Create a technical design for {{FEATURE}} in `.work-items/{{FEATURE}}/design.md`.
Cover requirements, API contracts, data models, and edge cases.
Link to the user story for value context. When design stabilizes, add or update shards under `docs/features/`.
```

**Task breakdown:**

```markdown
Create an implementation task list for {{FEATURE}} in `.work-items/{{FEATURE}}/task.md`.
Break work into atomic steps with acceptance criteria and validation gates (`npm test`, `npm run docs:check`).
Reference the design doc — do not expand scope beyond what the user story justifies.
```

**Architecture decision:**

```markdown
Should we {{DECISION_QUESTION}}?
Draft an ADR in `.work-items/{{FEATURE}}/adr-{{SHORT_NAME}}.md`.
State context, options considered, decision, and consequences. When accepted, add a summary shard under `docs/features/`.
```

### Toolchain integration

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

For npm script stubs only, see [Agent integration](#agent-integration).

### Three-tier doc layout

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

When a manifest has preamble prose with example links (not section shards), set `compile.sectionsHeading` in config (see [Manifest compile order](#manifest-compile-order)).

Never hand-edit generated `guides.md` or `refs.json`.

**Worked example:** this repository dogfoods under [`docs/features/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/features) (tool capabilities), [`docs/developer/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/developer) (repo development), and [`docs/client-cli/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/client-cli) (consumer adoption), wired by [`docs/mdcp.config.json`](https://github.com/betsalel-williamson/mdcp/blob/main/docs/mdcp.config.json). For a minimal fixture, see [examples/sample-guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides).

### Human review checklist

When reviewing an agent's documentation PR:

- Only shard `.md` files and config changed — not hand-edited `guides.md` or `refs.json`
- `index.md` link order matches intended compile order (use `compile.sectionsHeading` when the manifest has preamble example links)
- `npm run docs:check` passes locally and in CI
- Cross-links use slugs from `mdcp refs lookup`, not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`
- Task-type prompts use `{{WORK_ITEM}}` and tracker-specific Setup lines — see [Work item tracking](#work-item-tracking)

### Legacy script port map

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

Full port map: [Legacy migration](#legacy-migration).

### See also

- [Why mdcp for coding agents](#why-mdcp-for-coding-agents) — value proposition
- [Agent integration](#agent-integration) — npm scripts quick reference
- [examples/prompts/](https://github.com/betsalel-williamson/mdcp/tree/main/examples/prompts) — standalone copy-paste prompt files
- [Project layout](#project-layout) — shard directory structure
- [Cross-links and refs](#cross-links-and-refs) — slug lookup while authoring
- [Optional linters](#optional-linters) — markdownlint, Vale, link check peers

## Install and quick start

This package installs the `mdcp` command for use in your repo or CI.

### Requirements

- Node.js **>= 22.12.0**

### Install

```bash
# Dev dependency (recommended)
npm install -D @bwilliamson/mdcp-cli

# Or run without installing
npx @bwilliamson/mdcp-cli check --config mdcp.config.json

# Global install
npm install -g @bwilliamson/mdcp-cli
```

### Stability

**Pre-1.0:** There is **no API stability guarantee** until **1.0.0**. CLI commands, flags, `mdcp.config.json` schema, and compile output may change in any `0.x.y` release. Pin a specific version and read package changelogs before upgrading.

Optional lint tooling (install in your repo when you want `mdcp lint`, `mdcp prose`, or `mdcp check --require-lint`):

```bash
npm install -D markdownlint-cli2 @bwilliamson/mdcp-presets
```

For prose lint (`mdcp prose`, `mdcp check --require-vale`), install [Vale](https://vale.sh/docs/vale-cli/installation/) separately so `vale` is on your `PATH`.

### Quick start

1. Copy a starter config from the [mdcp repo](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json) into your docs directory as `mdcp.config.json`.

2. Lay out shards under guide directories (each with `index.md` and chapter files). See [examples/sample-guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides).

3. Run:

```bash
# When your shell is in the docs directory
mdcp compile --config mdcp.config.json
mdcp check --config mdcp.config.json
```

From the **repository root** (typical npm scripts), pass both `--config` and `--docs-root`:

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
mdcp check --config docs/mdcp.config.json --docs-root docs
```

`--config` is resolved from where you run the command; `--docs-root` sets the docs root. Details: [Config essentials](#--config-vs---docs-root).

Global options (apply to every command):

| Option                | Default            | Purpose                                                                          |
| --------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `-c, --config <path>` | `mdcp.config.json` | Config file path, resolved from the **invocation directory** (not `--docs-root`) |
| `--docs-root <path>`  | current directory  | Docs root — one subdirectory per guide shard tree                                |

## Agent integration

npm script stubs for wiring mdcp into any coding agent. For bootstrap, follow-up, spec-flow, and task-type prompt templates, see [LLM collaboration](#llm-collaboration).

Add npm scripts in your consumer repo:

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

```bash
# Compact context for feature work
mdcp export --llm --stdout --config docs/mdcp.config.json

# Find the right section link while writing
mdcp refs lookup "authentication" --format json

# Full structural gate
mdcp check --require-lint
```

### Related packages

| Package                                                                                | Use                                                         |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`@bwilliamson/mdcp-core`](https://www.npmjs.com/package/@bwilliamson/mdcp-core)       | Programmatic compile, refs, and validation API              |
| [`@bwilliamson/mdcp-presets`](https://www.npmjs.com/package/@bwilliamson/mdcp-presets) | Starter markdownlint configs for shards and compiled output |

### Further reading

- [Why mdcp for coding agents](#why-mdcp-for-coding-agents) — value proposition for agent workflows
- [LLM collaboration](#llm-collaboration) — bootstrap prompt, spec-flow, task-type templates, toolchain integration
- [Project README](https://github.com/betsalel-williamson/mdcp#readme) — concepts and design rationale
- [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md) — full maintainer docs
- [Sample guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides)

### License

MIT

## Project layout

### One subdirectory = one guide

Each folder directly under the docs root (`--docs-root`) is a **guide** when its name appears in `compileOrder`. The guide **`name`** in config matches the **directory name**.

| Piece                                           | Role                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| Guide directory (`features/`, `client-cli/`, …) | One logical guide — human-edited shards only                     |
| `index.md` (or `shards.md`)                     | Human table of contents — **compile order** from link order here |
| `chapter-*.md` (typical)                        | One topic or chapter per file                                    |
| `about-this-guide.md`                           | Optional preamble shard                                          |

Support directories (for example `styles/` for Vale) are **not** guides unless listed in `compileOrder`.

### Generated output (`outputDir`, default `_build/`)

All generated files live under `outputDir`. Safe to delete the entire directory (like `dist/`).

| Output            | Default location                                    | Notes                                                   |
| ----------------- | --------------------------------------------------- | ------------------------------------------------------- |
| Per-guide compile | `_build/{name}.md` or `_build/guide.md` (one guide) | Overridden by `compile.outputFile`                      |
| Optional monolith | `_build/guides.md`                                  | Only when top-level `outputFile` is set                 |
| Refs registry     | `_build/.caches/refs.json`                          | Derived — regenerated by `mdcp check` / `mdcp refs gen` |

```text
docs/
  features/           ← source
  client-cli/         ← source
  _build/             ← outputDir (gitignore)
    features.md
    client-cli.md
    guides.md         ← optional monolith
    .caches/
      refs.json
```

Publish outside `_build` (npm READMEs, repo-root docs) via `compile.outputFile` paths relative to `outputDir` (for example `../../packages/mdcp-cli/README.md`).

When a manifest has preamble prose with example links, set `compile.sectionsHeading`. See [Manifest compile order](#manifest-compile-order).

## Config essentials

### `--config` vs `--docs-root`

These two global options answer different questions:

| Option            | Resolved from                                                                        | Purpose                                                     |
| ----------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **`--config`**    | **Invocation directory** — where you run the command (repo root in most npm scripts) | Locates `mdcp.config.json` on disk                          |
| **`--docs-root`** | N/A (you pass the shard tree root explicitly)                                        | Root of guide directories — see [Path layout](#path-layout) |

`--config` is never prefixed with `--docs-root`.

#### Repo-root npm scripts

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --docs-root docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint"
  }
}
```

#### When you are already inside `docs/`

```bash
cd docs
mdcp compile
mdcp compile --config mdcp.config.json --docs-root .
```

#### Programmatic API

`loadConfig(configPath, configBase)` mirrors the CLI: pass the invocation directory as `configBase`, and the docs root as `docsRoot` when resolving guide paths. See [API — Config](#api-config).

### Path layout

Two roots (NPM-style):

| Root            | CLI / config                   | Role                                             |
| --------------- | ------------------------------ | ------------------------------------------------ |
| **Docs root**   | `--docs-root`                  | Human shard trees — one subdirectory = one guide |
| **Output root** | `outputDir` (default `_build`) | Generated markdown and cache — safe to delete    |

**One rule for all generated paths:** values are **relative to `outputDir`**, unless **absolute**.

```text
docs/                          ← --docs-root
  mdcp.config.json
  features/                    ← guide "features" (shards)
  client-cli/                  ← guide "client-cli"
  styles/                      ← support dir (not in compileOrder)
  _build/                      ← outputDir (generated)
    features.md
    client-cli.md
    guides.md                  ← optional monolith (when outputFile set)
    .caches/
      refs.json
```

#### Guide = one subdirectory

Each guide is a **folder** directly under the docs root. The guide **`name`** matches the **directory name**. Omit `guides[].path` unless shards live elsewhere.

Only directories listed in `compileOrder` are compiled and linted. Support folders (for example `styles/`) stay on disk but are out of scope.

| Config field          | Resolved from | Example (`--docs-root docs`)        |
| --------------------- | ------------- | ----------------------------------- |
| Default guide shards  | `docsRoot`    | `docs/features/`                    |
| `guides[].path`       | `docsRoot`    | `docs/features/`                    |
| `outputDir`           | `docsRoot`    | `docs/_build/`                      |
| Per-guide output      | `outputDir`   | `docs/_build/features.md`           |
| Monolith `outputFile` | `outputDir`   | `docs/_build/guides.md` (opt-in)    |
| `refs.registryFile`   | `outputDir`   | `docs/_build/.caches/refs.json`     |
| `compile.outputFile`  | `outputDir`   | `../../DEVELOPERS.md` from `_build` |

Delete `_build/` to clean all generated output. `.caches/` holds derived state (refs registry) only.

---

Minimal `mdcp.config.json`:

```json
{
  "compileOrder": ["overview", "admin-guide"],
  "guides": [{ "name": "overview" }, { "name": "admin-guide" }]
}
```

Defaults: `outputDir` `_build`, per-guide outputs `overview.md` and `admin-guide.md`, refs at `.caches/refs.json`. No monolith unless you set top-level `outputFile`.

| Field                | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `compileOrder`       | Guide directories to compile, in stitch order for optional monolith  |
| `guides`             | Per-guide options (hooks, manifests, publish paths)                  |
| `outputDir`          | Generated output root (relative to `--docs-root`)                    |
| `outputFile`         | Optional stitched monolith (relative to `outputDir`)                 |
| `refs.registryFile`  | Cross-link lookup table (default `.caches/refs.json`)                |
| `compile.outputFile` | Override per-guide output path (relative to `outputDir` or absolute) |

#### Default per-guide outputs

When `compile.outputFile` is omitted:

| Guides in `compileOrder` | Default file under `outputDir` |
| ------------------------ | ------------------------------ |
| 1                        | `guide.md`                     |
| 2+                       | `{name}.md` per guide          |

When `compile.outputFile` is set, that guide writes only to that path (for example npm README publish via `../../packages/foo/README.md`) and is excluded from an optional monolith.

#### Optional monolith

Set top-level `outputFile` (for example `"guides.md"`) to also stitch guides **without** explicit `compile.outputFile` into one file under `outputDir`.

#### `sectionsHeading`

When a manifest has preamble prose with example inline links before an ordered `## Sections` list, set `compile.sectionsHeading`. See [Manifest compile order](#manifest-compile-order).

```json
{
  "name": "glossary",
  "compile": {
    "title": "Compound glossary",
    "sectionsHeading": "Sections",
    "outputFile": "glossary.md"
  }
}
```

### Schema-only fields

| Field                       | Notes                                                      |
| --------------------------- | ---------------------------------------------------------- |
| `refs.slugAlgorithm`        | Informational only — only `github` is implemented          |
| `export.llm.skipIndexFiles` | No-op — compile output never includes `index.md` manifests |

Full schema and examples: [mdcp.config.json in sample-guides](https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json).

## Commands reference

### Global options

Every command accepts:

| Option                | Default            | Purpose                                                                          |
| --------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `-c, --config <path>` | `mdcp.config.json` | Config file path, resolved from the **invocation directory** (not `--docs-root`) |
| `--docs-root <path>`  | current directory  | Docs root — one subdirectory per guide shard tree                                |

**Repo-root npm scripts** typically use both flags:

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
```

`--config` locates the file from where the command runs; `--docs-root` sets the shard tree root. These bases are independent — see [Config essentials](#--config-vs---docs-root).

### Daily workflow

```bash
# Regenerate the monolith from shards (link order from each guide's index.md / shards.md)
mdcp compile

# Full validation gate (orphans → compile → refs → xrefs; optional linters)
mdcp check
```

### Command summary

| Command                    | When you need it                                                     |
| -------------------------- | -------------------------------------------------------------------- |
| `mdcp compile`             | Regenerate the monolith from shards                                  |
| `mdcp check`               | Full gate: orphans → compile → refs → xrefs; optional peer linters   |
| `mdcp shard`               | Split a monolith into shards (requires `config.source`)              |
| `mdcp refs list`           | List heading slugs from `refs.json` as JSON                          |
| `mdcp refs lookup <query>` | Search compiled section titles while writing cross-links             |
| `mdcp export --llm`        | Token-stripped compiled output for LLM context                       |
| `mdcp lint`                | markdownlint-cli2 on shards and compiled output (peer, if installed) |
| `mdcp prose`               | Vale prose lint (peer, if installed)                                 |
| `mdcp links`               | markdown-link-check on compiled output (peer, if installed)          |
| `mdcp fix`                 | Prettier + markdownlint `--fix` (install peers in host repo first)   |

### Refs subcommands

| Command                    | Purpose                                                                    |
| -------------------------- | -------------------------------------------------------------------------- |
| `mdcp refs gen`            | Generate `refs.json` from compiled output                                  |
| `mdcp refs check`          | Verify `refs.json` matches compiled output                                 |
| `mdcp refs list`           | List heading slugs from `refs.json` (run `mdcp check` or `refs gen` first) |
| `mdcp refs lookup <query>` | Fuzzy-search titles from freshly compiled output                           |

### LLM and agent context

```bash
# Token-stripped compiled output for coding agents
mdcp export --llm --stdout

# Find section links while authoring
mdcp refs lookup "authentication" --format json
```

## Cross-links and refs

When writing `[link text](#anchor)` in a shard, the anchor must match the compiled heading slug. Look it up instead of guessing:

```bash
mdcp refs lookup "getting started" --format json
mdcp refs list
```

The part after `#` must match how the compiled doc names that heading — which changes when shards are merged and headings shift level.

Section links are derived from compiled headings using the same rules GitHub uses when rendering. No hand-maintained `` required.

## Consumer migration

Add `source` to your config pointing at your existing monolith, then:

```bash
mdcp shard
mdcp compile
mdcp check
```

### Guide manifests and compile order

Compile order comes from link order in each guide's `index.md` or `shards.md`. List shards in the manifest in the order you want them stitched.

When a manifest has preamble prose with example inline links (not section shards), set `compile.sectionsHeading` — see [Manifest compile order](#manifest-compile-order).

After changing a guide's `index.md`, run `mdcp compile` and `mdcp check` — there is no separate manifest sync step.

### Output layout

MDCP uses an NPM-style two-root layout. Full breaking-change table for upgrades from earlier releases: [Legacy migration — unified output layout](#unified-output-layout-breaking).

| Concept          | Default                            | Notes                                                                    |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| Docs root        | `--docs-root`                      | One subdirectory per guide; `compileOrder` selects which folders compile |
| Output root      | `outputDir: "_build"`              | Safe to delete; all generated paths relative here unless absolute        |
| Per-guide output | `{name}.md` under `_build`         | Or `guide.md` when only one guide                                        |
| Monolith         | Opt-in via top-level `outputFile`  | Omitted by default                                                       |
| Refs registry    | `.caches/refs.json` under `_build` | Derived state, not publish-facing                                        |

Path resolution details: [Config essentials — path layout](#path-layout).

### Compile hooks

Register hooks per guide in `guides[].compile.hooks`:

| Hook            | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `stripAnchors`  | Remove explicit heading anchor markers from shard bodies              |
| `inlineInserts` | Inline diagram, table, figure, and media catalog shards on first link |
| `codeEvidence`  | Resolve evidence links to GitHub line-number fragments                |
| `reviewLinks`   | Rewrite review links; optional hooksConfig.reviewLinks.targetMonolith |

Cross-guide `.md` links rewrite automatically from `compileOrder` and per-guide `compile.outputFile`. Hook specs: [Compile hooks](#compile-hooks). Cross-monolith rewriting: [Cross-guide links](#cross-guide-link-rewriting).

### Multi-guide config

Multi-guide repos typically set per-guide publish targets, `sectionsHeading`, and hooks:

```json
{
  "outputDir": "_build",
  "compileOrder": ["glossary", "architecture-review", "technical-guide"],
  "guides": [
    {
      "name": "glossary",
      "compile": {
        "outputFile": "glossary.md",
        "sectionsHeading": "Sections",
        "hooks": ["stripAnchors", "inlineInserts", "reviewLinks"]
      }
    },
    {
      "name": "architecture-review",
      "path": "review",
      "compile": {
        "manifest": "shards.md",
        "outputFile": "architecture-review.md",
        "sectionsHeading": "Sections",
        "scopeRoot": ".",
        "hooks": ["stripAnchors", "codeEvidence", "inlineInserts", "reviewLinks"],
        "hooksConfig": {
          "reviewLinks": { "targetMonolith": "architecture-review.md" }
        }
      }
    }
  ],
  "refs": { "registryFile": ".caches/refs.json" },
  "lint": { "xrefs": { "enabled": true } }
}
```

- `compile.scopeRoot` helps resolve shard-relative paths in nested guide trees (for example `review/outcomes/FIND-004.md`).
- Publish paths like `../packages/foo/README.md` resolve from `outputDir` (`_build`).

### Steps for a new consumer repo

1. Add `mdcp.config.json` to your docs shard directory
2. Add repo-root npm scripts, for example `mdcp compile --config docs/mdcp.config.json --docs-root docs` (see [Config essentials](#--config-vs---docs-root))
3. Add `mdcp check --require-lint` (and `--require-vale` when Vale is configured)
4. Use `mdcp refs lookup` for cross-link slugs (no ``)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

Maintainer port map from earlier MDCP layouts: [Legacy migration](#legacy-migration).

### Verification checklist

After setting up a consumer repo:

1. **`mdcp compile`** — per-guide outputs under `_build/` (or explicit `compile.outputFile` targets); optional monolith when `outputFile` is set
2. **`mdcp check --require-lint`** — orphans, xrefs, markdownlint on in-scope guide shards only
3. **`mdcp check --require-vale`** — when Vale is configured
4. **Hook output** — diagram tables inlined (`inlineInserts`), code evidence blocks resolved (`codeEvidence`), cross-monolith links rewritten (no raw `../other-guide/shard.md` in compiled output)

## Optional linters

These commands use tools installed in **your** repo (not bundled with mdcp):

| Command      | Peer tool                       | Purpose                                                                        |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------ |
| `mdcp lint`  | `markdownlint-cli2`             | Lint shards and compiled output                                                |
| `mdcp prose` | `vale` (install separately)     | Prose style lint                                                               |
| `mdcp links` | `markdown-link-check`           | Check links in compiled output (`lint.links` config required in `check`)       |
| `mdcp fix`   | `prettier`, `markdownlint-cli2` | Run `prettier --write .` then `markdownlint-cli2 --fix` (no mdcp config paths) |

`mdcp fix` does not bundle formatters. Install **Prettier** and **markdownlint-cli2** in your repo first (`node_modules/.bin` or PATH). Each step is skipped with an info message if the peer is missing.

```bash
mdcp lint --require-lint          # fail if markdownlint-cli2 is missing
mdcp prose --require-vale         # fail if Vale is missing
mdcp check --require-lint --require-vale   # CI gate with markdownlint + Vale
mdcp check --skip-vale            # structural checks only
```

`mdcp check` runs link checking only when **`lint.links.config`** is set in `mdcp.config.json` and `markdown-link-check` is installed. `mdcp links` always skips quietly if the peer is missing.

Install npm peers with:

```bash
npm install -D prettier markdownlint-cli2 @bwilliamson/mdcp-presets
```

Install **Vale** separately so `vale` is on your `PATH` — see [Vale installation](https://vale.sh/docs/vale-cli/installation/) (Homebrew, Chocolatey, Snap, or GitHub release). After adding a `.vale.ini`, run `vale sync` in that directory.

Wire preset paths in `mdcp.config.json` under `lint.markdownlint`. See `@bwilliamson/mdcp-presets` on npm.

### In-scope guide fileset

MDCP knows the **full fileset** it manages: registered guides in `compileOrder`, resolved via `guides[].path` or `{docsRoot}/{name}/`. Shard markdownlint and Vale prose **only touch documents in that scope** — never legacy flat `.md` files, unregistered sibling folders, or other markdown under `--docs-root` that mdcp does not compile.

| Command                                        | Default scope                                   | Out of scope (skipped)                                  |
| ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| Shard markdownlint (`mdcp lint`, `mdcp check`) | `compileOrder` guide directories                | Legacy flat docs, unrelated subdirs under `--docs-root` |
| Vale prose (`mdcp prose`, `mdcp check`)        | Same guide directories                          | Same                                                    |
| Xref lint (`mdcp check`)                       | Same guide directories                          | Same                                                    |
| Compiled markdownlint                          | Monolith and publish outputs (`compiledConfig`) | Separate pass — not shard trees                         |

Optional overrides **narrow** scope further; they never widen it beyond what you explicitly list:

| Config field                    | Purpose                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `lint.markdownlint.shardsGlobs` | Shard markdownlint paths relative to `--docs-root` (default: compileOrder guide dirs) |
| `vale.scanGlobs`                | Vale prose paths relative to `--docs-root` (default: same guide dirs)                 |

The `@bwilliamson/mdcp-presets` shard config supplies **rules and exclusions** (`!**/index.md`, `!guides.md`). **Scope always comes from the CLI** — not from preset globs.

`mdcp fix` is out of band: it runs unscoped `prettier --write .` and `markdownlint-cli2 --fix` across the repo and is not part of mdcp's guide fileset gate.

## Glossary

Shared acronyms and terms for all mdcp docs. Spell out on first use in a shard and link the short form here.

### GFM

**GitHub Flavored Markdown** — standard Markdown plus GitHub extensions (tables, task lists, fenced code). Not Pandoc, LaTeX, or wikilinks.

### Authored GFM

Shard markdown as written before compile — no preprocessor substitution or template conditionals. Compile hooks may transform it during assembly; see [Preprocessor / templating (out of scope)](#preprocessor-templating-out-of-scope).
