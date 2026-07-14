# @bwilliamson/mdcp-cli

## About @bwilliamson/mdcp-cli

The command-line interface for the [MarkDown Context Protocol (MDCP)](https://github.com/betsalel-williamson/mdcp).

This CLI works in tandem with the MDCP **Agent Skill**. While the Agent Skill instructs your AI coding assistants on _how_ and _when_ to interact with your documentation, the CLI provides the actual execution engine to compile shards, look up references, and validate documentation integrity.

## Why mdcp for coding agents

**MDCP** ([MarkDown Context Protocol](#mdcp)) splits, compiles, validates, and exports sharded Markdown documentation. Shards are the source of truth; compiled output is generated.

### The pain

LLM pair-coding on a repo breaks down when documentation is a single monolith, unvalidated, and mixed up with implementation:

| Pain                       | What goes wrong                 | Command                                                |
| -------------------------- | ------------------------------- | ------------------------------------------------------ |
| **Monolithic guides**      | Merge conflicts, stale TOC      | `mdcp compile`; `mdcp check` catches orphans           |
| **Broken cross-links**     | Agents guess `#anchor` slugs    | `mdcp refs lookup` on compiled output                  |
| **Context overload**       | Monolith pasted each agent turn | `refs lookup` then read one shard                      |
| **Docs drift**             | Shards and output diverge       | `mdcp check` before merge                              |
| **Custom compile scripts** | Bash/Python glue nobody owns    | `compile`, `check`, `@bwilliamson/mdcp-presets`        |
| **Plan mixed with code**   | Stale prose drives wrong code   | Shards under `docs/features/`, `client/`, `developer/` |

Documentation should carry **context and the high-level plan**; code carries **implementation detail**. mdcp enforces that split with a validation gate agents and CI can run the same way. For granular reads, follow the [usage model](../../docs/features/protocol/usage-model.md).

### Typical agent loop

Edit shards → `mdcp refs lookup "topic"` while writing links → `mdcp compile` → `mdcp check` → `mdcp export --llm` when the next turn needs doc context.

### Get started

First-time setup in a consumer repo: copy [getting-started.md](../../.agents/skills/mdcp/agents/getting-started.md) (or load from `.agents/skills/mdcp/agents/` after fetch), fill in `FEATURE=` and `PERSONA=`, and send. Task-type prompts and workflow index: [LLM collaboration](#llm-collaboration).

For command and capability depth, read the [feature catalog](../../docs/features/feature-catalog.md).

## LLM collaboration

Spec-driven prompts and workflow for coding agents. For the problems mdcp solves and which commands address them, see [Why mdcp for coding agents](#why-mdcp-for-coding-agents).

**Source of truth:** versioned prompts live under [.agents/skills/mdcp/agents/](../../.agents/skills/mdcp/agents). `mdcp export --llms-index --fetch` caches them at `.agents/skills/mdcp/agents/` in your docs root. This page indexes them and covers mdcp-specific workflow — not full prompt text.

### Prompt library

Copy from [.agents/skills/mdcp/agents/](../../.agents/skills/mdcp/agents).

- [getting-started.md](../../.agents/skills/mdcp/agents/getting-started.md) — first-time pipeline setup in a consumer repo
- [doc-only.md](../../.agents/skills/mdcp/agents/doc-only.md) — documentation-only work
- [design-architecture.md](../../.agents/skills/mdcp/agents/design-architecture.md) — RFCs, ADRs, data models
- [feature-level.md](../../.agents/skills/mdcp/agents/feature-level.md) — feature work, docs-first then TDD
- [ux.md](../../.agents/skills/mdcp/agents/ux.md) — UI flows and client-guide updates
- [review.md](../../.agents/skills/mdcp/agents/review.md) — architecture and security review; one node per PR; atomic findings

Each prompt uses a **Replace before sending** code block at the top; the agent plans from repo context rather than vendor-specific commands baked into the template.

### Bootstrap prompt (copy-paste)

First-time setup for a consumer repo: [getting-started.md](../../.agents/skills/mdcp/agents/getting-started.md).

Fill in `FEATURE=` and `PERSONA=`, then send. The prompt instructs the agent to inspect the repository and mdcp docs before installing or configuring. Best for **Learner** and **Author** archetypes — see [Personas and priority tiers](../../docs/features/personas-and-priority-tiers.md).

### Follow-up prompts

Use these after the pipeline exists (inline here — not duplicated in `.agents/skills/mdcp/agents/`).

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

### Docs-first feature workflow

Load scope from the tracker via `WORK_ITEM_LOOKUP` (GitHub MCP, `gh issue view`, Linear MCP, or your repo's documented integration). Then document before you implement — use [feature-level.md](../../.agents/skills/mdcp/agents/feature-level.md).

#### Workflow best practices

- **Branch first** — create a feature branch from updated `main` before shards, tests, or code (see [Agent work-item tracking](../../DEVELOPERS.md#agent-work-item-tracking))
- **One issue per branch** — stay focused on a single feature, design, or doc scope; do not mix unrelated work in one PR
- **Current behavior in docs** — shards describe the product as it works now; removed or breaking behavior belongs in the **changeset**, not `docs/features/` or `docs/client/`

| Phase     | Where            | Holds                                                  |
| --------- | ---------------- | ------------------------------------------------------ |
| Document  | `docs/features/` | Capabilities, design, API surface, acceptance criteria |
| Document  | `docs/client/`   | End-user value, experience, how to use the feature     |
| Implement | Code + tests     | TDD against the documented contract                    |

For architecture-heavy work before coding (RFCs, ADRs, data models), use [design-architecture.md](../../.agents/skills/mdcp/agents/design-architecture.md).

#### Sharding keeps context lean

- **Core workflow** — bootstrap prompt and repo script wiring
- **On demand** — task-type prompts from `.agents/skills/mdcp/agents/` or `.agents/skills/mdcp/agents/`; load only what the current task needs
- **Compiled context** — `mdcp export --llm` for token-stripped output scoped to registered guides

Prefer structured prompts over permanently importing rigid always-on rules into every repo.

### Work item tracking

Task-type prompts include a **Replace before sending** block with `WORK_ITEM` and `WORK_ITEM_LOOKUP`:

- **`WORK_ITEM`** — ticket identifier or URL
- **`WORK_ITEM_LOOKUP`** — where the agent loads scope and delivery conventions (do not hard-code a tracker in the prompt)

Point `WORK_ITEM_LOOKUP` at a shard under `docs/developer/` in your repo. The agent discovers GitHub MCP, `gh issue view`, Linear MCP, or other tools from that doc — not from the prompt template.

This repository documents its stack in [Agent work-item tracking](../../DEVELOPERS.md#agent-work-item-tracking) — use that path in `WORK_ITEM_LOOKUP` when dogfooding mdcp.

### Task-type prompt templates

- [doc-only.md](../../.agents/skills/mdcp/agents/doc-only.md) — technical writers; documentation, tutorials, guides
- [design-architecture.md](../../.agents/skills/mdcp/agents/design-architecture.md) — architects; RFCs, ADRs, data models before code
- [feature-level.md](../../.agents/skills/mdcp/agents/feature-level.md) — server-side or full-stack feature work
- [ux.md](../../.agents/skills/mdcp/agents/ux.md) — UX and frontend; flows, accessibility, client guides
- [review.md](../../.agents/skills/mdcp/agents/review.md) — security and systems review; atomic findings, checklist evidence, feature stubs

### Toolchain integration

mdcp exposes a **tool-agnostic contract**: agents need shell access and the ability to edit `.md` files.

- **Cursor / Composer** — paste prompts from `.agents/skills/mdcp/agents/` or `.agents/skills/mdcp/agents/`; reference shard files for context; run the repo's doc check before ending a turn
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

When a manifest has preamble prose with example links (not section shards), set `compile.sectionsHeading` in config (see [Manifest compile order](../../docs/features/manifest-compile-order.md)).

Never hand-edit generated compile output or `refs.json`.

**Worked example:** this repository dogfoods under [`docs/features/`](../../docs/features), [`docs/developer/`](../../docs/developer), and [`docs/client-cli/`](./), wired by [`docs/mdcp.config.json`](../../docs/mdcp.config.json). Minimal fixture: [examples/sample-guides](../../examples/sample-guides).

### Human review checklist

When reviewing an agent's documentation PR:

- Only shard `.md` files and config changed — not hand-edited generated compile output or `refs.json`
- `index.md` link order matches intended compile order (use `compile.sectionsHeading` when the manifest has preamble example links)
- Doc check passes locally and in CI (repo's documented commands)
- Cross-links use slugs from `mdcp refs lookup`, not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`
- Task prompts use only the top replace block — fill in `WORK_ITEM` and `WORK_ITEM_LOOKUP` before sending
- One WORK_ITEM per PR — branch and scope match a single feature or design
- Shards describe current behavior; breaking or removed behavior is in the changeset, not feature/client guides

### See also

- [Why mdcp for coding agents](#why-mdcp-for-coding-agents) — developer pain and which commands address it
- [Agent integration](#agent-integration) — npm scripts quick reference
- [.agents/skills/mdcp/agents/](../../.agents/skills/mdcp/agents) — versioned copy-paste prompt files
- [Project layout](#project-layout) — shard directory structure
- [Cross-links and refs](#cross-links-and-refs) — slug lookup while authoring
- [Optional linters](#optional-linters) — markdownlint, Vale, link check peers

## Install and quick start

This package installs the `mdcp` command for use in your repo or CI. It works in **any** codebase — language, framework, and repo layout do not matter; mdcp only manages your documentation shards and compile pipeline.

**Fastest path:** copy [getting-started.md](../../.agents/skills/mdcp/agents/getting-started.md), fill in `FEATURE=` and `PERSONA=`, and send it to your coding agent for first-time setup.

### Requirements

- Node.js **>= 24.0.0**

### Install

```bash
# Dev dependency (recommended)
npm install -D @bwilliamson/mdcp-cli

# Or run without installing
npx @bwilliamson/mdcp-cli check --config mdcp.config.json
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-profile alpha --fetch-ref v0.4.1 --docs-root docs

# Global install
npm install -g @bwilliamson/mdcp-cli
```

### Stability

**Open alpha (0.4.0).** MDCP is moving fast — this release is a working foundation for early adopters. Tooling and the draft protocol profile may change in 0.5+. Pin a specific version:

```bash
npm install -D @bwilliamson/mdcp-cli@0.4.1
```

**Pre-1.0:** There is **no API stability guarantee** until **1.0.0**. CLI commands, flags, `mdcp.config.json` schema, and compile output may change in any `0.x.y` release. Read package changelogs before upgrading.

#### Get involved

Visit [github.com/betsalel-williamson/mdcp](https://github.com/betsalel-williamson/mdcp), **star** the repo to follow progress, and **open or comment on [GitHub Issues](https://github.com/betsalel-williamson/mdcp/issues)** with feedback, adoption stories, or bugs.

Optional lint tooling (install in your repo when you want `mdcp lint`, `mdcp prose`, or `mdcp check --require-lint`):

```bash
npm install -D markdownlint-cli2 @bwilliamson/mdcp-presets
```

For prose lint (`mdcp prose`, `mdcp check --require-vale`), install [Vale](https://vale.sh/docs/vale-cli/installation/) separately so `vale` is on your `PATH`.

### Quick start

**Agent index (optional day zero)** — fetch the pinned open-alpha bootstrap into your docs root (`npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-profile alpha --fetch-ref v0.4.1 --docs-root docs`). Use `--fetch-profile dev` only when tracking the in-progress draft. Agents read the index for query commands; task prompts are cached at `.agents/skills/mdcp/agents/` — see [.agents/skills/mdcp/agents/](../../.agents/skills/mdcp/agents).

1. Copy a starter config from [examples/sample-guides/mdcp.config.json](../../examples/sample-guides/mdcp.config.json) into your docs directory as `mdcp.config.json`.

2. Lay out shards under guide directories (each with `index.md` and chapter files). See [examples/sample-guides](../../examples/sample-guides).

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

npm script stubs for wiring mdcp into any coding agent. For the portable Agent Skill install (parent + complementary skills), see [Agent Skill (consumer)](#agent-skill-consumer). For setup prompts, docs-first feature workflow, and task-type templates, see [LLM collaboration](#llm-collaboration).

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

- [Agent Skill (consumer)](#agent-skill-consumer) — host-agnostic skill install
- [Why mdcp for coding agents](#why-mdcp-for-coding-agents) — developer pain and which commands address it
- [LLM collaboration](#llm-collaboration) — spec-driven workflow, prompts, toolchain integration
- [Project README](../../README.md) — concepts and design rationale
- [Feature catalog](../../docs/features/feature-catalog.md) — full maintainer docs
- [Sample guides](../../examples/sample-guides)

### License

MIT

## Agent Skill (consumer)

Install the MDCP **parent Agent Skill** so coding agents follow sharded-docs workflows without a host-specific IDE extension. Complementary skills (prompts, archetypes, format packs) install beside the parent.

This path is **host-agnostic**. It does not depend on Cursor, VS Code Marketplace, or any single product.

### Install

```bash
# Parent skill (primary agent entrypoint)
npx skills add betsalel-williamson/mdcp --skill mdcp

# Complementary skills (optional)
npx skills add betsalel-williamson/mdcp --skill mdcp-format-marp
```

Zero-install alternative: copy `.agents/skills/mdcp/` from this repository into your project (plus complementary skill folders when you need them). Prefer `.agents/skills/` over host-specific aliases.

### Versioning and Upgrades

Agent Skills use a **vendoring** strategy. Instead of relying on a hidden `.caches/` directory and dynamic fetches pinned by `mdcp.config.json` (as the old extension packs did), skills become part of your project's source code:

1. The `npx skills add` command downloads the skill directly into your `.agents/skills/` directory.
2. You **commit** these files to your repository. This ensures that every developer and agent on your team operates with the exact same instructions, and any changes to the skill are reviewable in pull requests.
3. To **upgrade**, simply re-run the `npx skills add` command, review the `git diff`, and commit the changes.

### Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **Break it down:** Organize information into the smallest possible pieces (shards).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, or incident logs in the durable documentation.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

### How this relates to CLI scripts

Keep using npm scripts for compile and check — see [Agent integration](#agent-integration). The skill teaches agents **when** to run those commands and **how** to load the smallest useful shard context. It does not replace `@bwilliamson/mdcp-cli`.

### Next steps

1. Install the parent skill (and complementary skills you need).
2. Add [Install and quick start](#install-and-quick-start) CLI wiring.

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
| Output backups    | `_build/.caches/backups/`                           | Opt-in only — prior output when `--backup` is used      |

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
      backups/        ← opt-in (--backup)
```

Publish outside `_build` (npm READMEs, repo-root docs) via `compile.outputFile` paths relative to `outputDir` (for example `../../packages/mdcp-cli/README.md`).

When a manifest has preamble prose with example links, set `compile.sectionsHeading`. See [Manifest compile order](../../docs/features/manifest-compile-order.md).

## Config essentials

### `--config` vs `--docs-root`

> **Link target:** On GitHub, this section's anchor is `#--config-vs---docs-root` (not `#config-vs-docs-root`).

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

`loadConfig(configPath, configBase)` mirrors the CLI: pass the invocation directory as `configBase`, and the docs root as `docsRoot` when resolving guide paths. See [API — Config](../mdcp-core/README.md#api--config).

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
      backups/                 ← opt-in prior output (--backup)
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

Delete `_build/` to clean all generated output. `.caches/` holds derived state (refs registry) and, when `--backup` is used, prior compile output under `backups/`. See [Compile output backup](../../docs/features/compile-output-backup.md).

#### Opt-in output backup

Default: compile and export **overwrite** existing files (git is the safety net). Enable backup when working outside version control:

```json
{
  "backup": { "enabled": true }
}
```

Or pass `--backup` on the CLI (overrides config). Optional `backup.dir` (default `.caches/backups`) and `backup.ext`. Full spec: [Compile output backup](../../docs/features/compile-output-backup.md).

#### Link validation

Built-in internal link validation is on by default. Broken links emit **`BROKEN LINK`** markers in compiled output and fail `mdcp compile` / `mdcp check` (exit **1**). See [Link validation](../../docs/features/link-validation.md).

```json
{
  "compile": { "links": { "markBroken": true } },
  "lint": {
    "links": {
      "enabled": true,
      "severity": "error"
    }
  }
}
```

| Field                      | Default   | Role                                                  |
| -------------------------- | --------- | ----------------------------------------------------- |
| `compile.links.markBroken` | `true`    | Replace broken links with BROKEN LINK prose in output |
| `lint.links.enabled`       | `true`    | Run built-in link validation                          |
| `lint.links.severity`      | `"error"` | `"warn"` exits 0; use `--warn-broken-links` on CLI    |
| `lint.links.config`        | —         | Peer `markdown-link-check` config only                |

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

When a manifest has preamble prose with example inline links before an ordered `## Sections` list, set `compile.sectionsHeading`. See [Manifest compile order](../../docs/features/manifest-compile-order.md).

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

Full schema and examples: [mdcp.config.json in sample-guides](../../examples/sample-guides/mdcp.config.json).

## Commands reference

### Global options

Every command accepts:

| Option                | Default            | Purpose                                                                          |
| --------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `-c, --config <path>` | `mdcp.config.json` | Config file path, resolved from the **invocation directory** (not `--docs-root`) |
| `--docs-root <path>`  | current directory  | Docs root — one subdirectory per guide shard tree                                |
| `--warn-broken-links` | off                | Report broken internal links but exit 0 (overrides `lint.links.severity`)        |

**Repo-root npm scripts** typically use both flags:

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
```

`--config` locates the file from where the command runs; `--docs-root` sets the shard tree root. These bases are independent — see [Config essentials](#--config-vs---docs-root).

### Daily workflow

```bash
# Regenerate the monolith from shards (link order from each guide's index.md / shards.md)
mdcp compile

# Full validation gate (orphans → compile → refs → links → xrefs; optional peer linters)
mdcp check
```

`mdcp compile` and `mdcp check` exit **1** when broken internal links are found (default). Use `--warn-broken-links` to surface `link-warn:` diagnostics without failing CI. See [Link validation](../../docs/features/link-validation.md).

### Command summary

| Command                    | When you need it                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `mdcp compile`             | Regenerate compiled outputs and `refs.json` under `outputDir` (exits 1 on broken links by default) |
| `mdcp check`               | Full gate: orphans → compile → refs → links → xrefs; optional peer linters                         |
| `mdcp shard`               | Split a monolith into shards (requires `config.source`)                                            |
| `mdcp refs list`           | List heading slugs from `refs.json` as JSON                                                        |
| `mdcp refs lookup <query>` | Search compiled section titles while writing cross-links                                           |
| `mdcp export --llm`        | Token-stripped compiled output for LLM context                                                     |
| `mdcp lint`                | markdownlint-cli2 on shards and compiled output (peer, if installed)                               |
| `mdcp prose`               | Vale prose lint (peer, if installed)                                                               |
| `mdcp links`               | markdown-link-check on compiled output (peer, if installed)                                        |
| `mdcp fix`                 | Prettier + markdownlint `--fix` (install peers in host repo first)                                 |

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

## Compile and the refs registry

### End-user value

When you organize compiled outputs in subdirectories (`compile.outputFile: "compiled/guide-a.md"`), `mdcp compile` still keeps the refs registry at the documented cache path under `outputDir`. You can run `mdcp refs list` right after compile when writing cross-links — no manual move and no extra `mdcp refs gen` step.

### Path layout

`refs.registryFile` is always relative to `outputDir`, not to each guide's `compile.outputFile`. See [Config essentials — path layout](#path-layout).

Example:

```json
{
  "outputDir": "_build",
  "refs": { "registryFile": ".caches/refs.json" },
  "guides": [{ "name": "guide-a", "compile": { "outputFile": "compiled/guide-a.md" } }]
}
```

| Artifact       | Path                              |
| -------------- | --------------------------------- |
| Compiled guide | `docs/_build/compiled/guide-a.md` |
| Refs registry  | `docs/_build/.caches/refs.json`   |

### Workflow

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
mdcp refs list --config docs/mdcp.config.json --docs-root docs
mdcp refs lookup "section title" --config docs/mdcp.config.json --docs-root docs
```

`mdcp refs lookup` compiles fresh in memory; `mdcp refs list` reads the registry file that `compile` just wrote.

## Cross-links and refs

When writing `` `[link text](#anchor)` `` in a shard, the anchor must match the compiled heading slug. Look it up instead of guessing:

```bash
mdcp refs lookup "getting started" --format json
mdcp refs list
```

The part after `#` must match how the compiled doc names that heading — which changes when shards are merged and headings shift level.

### Heading slugs (GitHub rules)

MDCP derives `#fragment` targets from **compiled** heading text using the same algorithm GitHub applies when rendering READMEs and issues. There is no separate GFM spec for auto-generated heading IDs; the de-facto reference is GitHub's [html-pipeline `TableOfContentsFilter`](https://github.com/gjtorikian/html-pipeline/blob/main/lib/html/pipeline/toc_filter.rb). `@bwilliamson/mdcp-core` implements that behavior through the [`github-slugger`](https://www.npmjs.com/package/github-slugger) package.

| Input                                      | Plain text used for slugging                | Example slug                            |
| ------------------------------------------ | ------------------------------------------- | --------------------------------------- |
| Heading `git status`                       | `git status` (inline markup stripped)       | `git-status`                            |
| `Preprocessor / templating (out of scope)` | Punctuation removed; each space becomes `-` | `preprocessor--templating-out-of-scope` |
| `` `--config` vs `--docs-root` ``          | Consecutive dashes preserved                | `--config-vs---docs-root`               |
| Two `## Foo` headings in one guide         | Second occurrence disambiguated             | `foo`, then `foo-1`                     |

**Authoring rules:**

1. **Look up slugs** — run `mdcp refs lookup` or `mdcp refs list` after compile; do not hand-roll anchors from heading titles.
2. **Prefer unique subheadings** — duplicate heading text in the same document produces `-1`, `-2` suffixes; the first `#slug` link may not reach later occurrences.
3. **Explicit `` overrides** — when present on a heading line, that id is used instead of the auto slug (lowercased). Use sparingly; GitHub slugs are the default contract.

`githubSlugify` and `buildSlugRegistry` in `@bwilliamson/mdcp-core` share this algorithm for link validation, `refs.json`, and compile-time slug maps. See [API — Refs and validation](../mdcp-core/README.md#heading-slugs-github-slugger).

## Consumer migration

Add `source` to your config pointing at your existing monolith, then:

```bash
mdcp shard
mdcp compile
mdcp check
```

### Guide manifests and compile order

Compile order comes from link order in each guide's `index.md` or `shards.md`. List shards in the manifest in the order you want them stitched.

When a manifest has preamble prose with example inline links (not section shards), set `compile.sectionsHeading` — see [Manifest compile order](../../docs/features/manifest-compile-order.md).

After changing a guide's `index.md`, run `mdcp compile` and `mdcp check` — there is no separate manifest sync step.

### Output layout

MDCP uses an NPM-style two-root layout.

| Concept          | Default                            | Notes                                                                    |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| Docs root        | `--docs-root`                      | One subdirectory per guide; `compileOrder` selects which folders compile |
| Output root      | `outputDir: "_build"`              | Safe to delete; all generated paths relative here unless absolute        |
| Per-guide output | `{name}.md` under `_build`         | Or `guide.md` when only one guide                                        |
| Monolith         | Opt-in via top-level `outputFile`  | Omitted by default                                                       |
| Refs registry    | `.caches/refs.json` under `_build` | Derived state, not publish-facing                                        |

Path resolution details: [Config essentials — path layout](#path-layout).

### Compile hooks

Built-in hooks run **by default** on every guide — omit `compile.hooks` for the common case. See [Default compile hooks](../../docs/features/default-compile-hooks.md).

| Hook            | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `stripAnchors`  | Remove explicit heading anchor markers from shard bodies              |
| `inlineInserts` | Inline diagram, table, figure, and media catalog shards on first link |
| `codeEvidence`  | Resolve evidence links to GitHub line-number fragments                |

Opt out per hook: `"hooks": { "codeEvidence": false }`. Replace the pipeline entirely with a string array when needed.

Cross-guide `.md` links rewrite automatically at assembly from `compileOrder` and per-guide `compile.outputFile`. Optional `compile.crossGuideLinks.ignoreGuides` on the compiling guide keeps shard paths for listed guides — see [Cross-guide links](../mdcp-core/README.md#cross-guide-link-rewriting). Hook specs: [Compile hooks](../mdcp-core/README.md#compile-hooks).

### Multi-guide config

Multi-guide repos typically set per-guide publish targets and `sectionsHeading` — hooks need not be listed.

#### Default multi-guide

```json
{
  "outputDir": "_build",
  "compileOrder": ["glossary", "architecture-review", "technical-guide"],
  "guides": [
    {
      "name": "glossary",
      "compile": {
        "outputFile": "glossary.md",
        "sectionsHeading": "Sections"
      }
    },
    {
      "name": "architecture-review",
      "path": "review",
      "compile": {
        "manifest": "shards.md",
        "outputFile": "architecture-review.md",
        "sectionsHeading": "Sections",
        "scopeRoot": "."
      }
    },
    {
      "name": "technical-guide",
      "path": "technical",
      "compile": {
        "outputFile": "technical-guide.md",
        "sectionsHeading": "Sections"
      }
    }
  ],
  "refs": { "registryFile": ".caches/refs.json" },
  "lint": { "xrefs": { "enabled": true } }
}
```

Cross-guide links in compiled output rewrite to each target guide's `compile.outputFile` automatically.

#### Optional: shard links for one guide

When one compiled guide should link to live shard files for a specific guide instead of that guide's monolith `#slug` target, set `compile.crossGuideLinks.ignoreGuides` on the **compiling** guide:

```json
{
  "name": "glossary",
  "compile": {
    "outputFile": "glossary.md",
    "sectionsHeading": "Sections",
    "crossGuideLinks": {
      "ignoreGuides": ["technical-guide"]
    }
  }
}
```

See [Cross-guide links](../mdcp-core/README.md#cross-guide-ignore-example-mixed-monolith-and-shard-links).

- `compile.scopeRoot` helps resolve shard-relative paths in nested guide trees (for example `review/outcomes/FIND-004.md`).
- `compile.crossGuideLinks.ignoreGuides` on the compiling guide keeps shard `.md` links for listed guides instead of monolith `#slug` targets.
- Publish paths like `../packages/foo/README.md` resolve from `outputDir` (`_build`).

### Steps for a new consumer repo

1. Add `mdcp.config.json` to your docs shard directory
2. Add repo-root npm scripts, for example `mdcp compile --config docs/mdcp.config.json --docs-root docs` (see [Config essentials](#--config-vs---docs-root))
3. Add `mdcp check --require-lint` (and `--require-vale` when Vale is configured)
4. Use `mdcp refs lookup` for cross-link slugs (no ``)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

Upgrade notes from earlier MDCP releases are in the package **changeset** files at release time, not in the feature catalog.

### Verification checklist

After setting up a consumer repo:

1. **`mdcp compile`** — per-guide outputs under `_build/` (or explicit `compile.outputFile` targets); optional monolith when `outputFile` is set
2. **`mdcp check --require-lint`** — orphans, xrefs, markdownlint on in-scope guide shards only
3. **`mdcp check --require-vale`** — when Vale is configured
4. **Hook output** — diagram tables inlined (`inlineInserts`), code evidence blocks resolved (`codeEvidence`), cross-guide links rewritten to monolith `#slug` targets (or left as shard `.md` paths for guides in `compile.crossGuideLinks.ignoreGuides`)

## Optional linters

These commands use tools installed in **your** repo (not bundled with mdcp):

| Command      | Peer tool                       | Purpose                                                                   |
| ------------ | ------------------------------- | ------------------------------------------------------------------------- |
| `mdcp lint`  | `markdownlint-cli2`             | Lint shards and compiled output                                           |
| `mdcp prose` | `vale` (install separately)     | Prose style lint                                                          |
| `mdcp links` | `markdown-link-check`           | Optional HTTP URL checks (peer; not built-in internal link validation)    |
| `mdcp fix`   | `prettier`, `markdownlint-cli2` | Run `prettier --write .` then `markdownlint-cli2 --fix` (no config paths) |

`mdcp fix` does not bundle formatters. Install **Prettier** and **markdownlint-cli2** in your repo first (`node_modules/.bin` or PATH). Each step is skipped with an info message if the peer is missing.

```bash
mdcp lint --require-lint          # fail if markdownlint-cli2 is missing
mdcp prose --require-vale         # fail if Vale is missing
mdcp check --require-lint --require-vale   # CI gate with markdownlint + Vale
mdcp check --skip-vale            # structural checks only
```

`mdcp check` runs **built-in** internal link validation by default (`lint.links.enabled`). Peer `markdown-link-check` runs only when **`lint.links.config`** is set and the peer is installed. `mdcp links` always skips quietly if the peer is missing.

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

Each term is its own shard under `docs/glossary/`. For large glossaries, split manifests across sub-index files (for example `index-protocol.md`, `index-format.md`) and set `compile.scopeRoot` to `glossary` so transitive links pull term shards into other guides. Read [domain glossary](#domain-glossary).

### Protocol terms

- [Agent Skills](#agent-skills)
- [MDCP](#mdcp)
- [protocol version](#protocol-version)
- [mdcp-llms-index](#mdcp-llms-index)

### Format and compile terms

- [GFM](#gfm)
- [Authored GFM](#authored-gfm)
- [ignoreGuides](#ignoreguides)

### Adoption and messaging

- [WIIFM](#wiifm)

## MDCP

**MarkDown Context Protocol** — a protocol for repository documentation context: sharded intent and design in Markdown, validated compile output for agents, CI, and human readers. The CLI is one surface; `compile`, `check`, `refs lookup`, and `export --llm` implement the shared context layer.

## domain glossary

Per-repository glossary shards under `docs/glossary/` for acronyms and product vocabulary. When legacy systems reuse the same term for different concepts, add a **disambiguation** entry and link from feature shards on first use. Start the glossary before large feature shards when migrating or onboarding new projects.

### One term per shard

Each definition lives in its own `.md` file with a single `#` heading (the term). Link the term from feature shards on first use, for example `[GFM](./gfm.md)` or `../glossary/gfm.md` from another guide.

### Multiple index files

When a glossary grows beyond a comfortable manifest size, group entries in sub-index manifests:

| File                | Role                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `index.md`          | Master index — preamble plus links to every term shard (required for cross-guide stitch) |
| `index-protocol.md` | Example sub-index — protocol-related terms only                                          |
| `index-format.md`   | Example sub-index — format and compile terms                                             |

**Stitched into other guides:** link `../glossary/index.md` from each guide `index.md`. Set `compile.scopeRoot` to `glossary` on those guides so transitive `.md` links from the glossary tree pull term shards into compile output without listing every term in the parent manifest.

**Standalone glossary output:** add `glossary` to `compileOrder` with `compile.outputFile` and optionally `compile.manifest: index-protocol.md` (or another sub-index) when you want a separate compiled glossary per group.

## Agent Skills

The successor to the legacy `mdcp.v*.llms.txt` (llms-index) bootstrap file. Instead of fetching a monolithic `llms.txt` file, MDCP is delivered as a portable Agent Skill (e.g., `.agents/skills/mdcp/SKILL.md`). This provides a host-agnostic, zero-friction way to enforce documentation guardrails, workflows, and complementary skills (like prompts and formats) across different AI coding assistants.

## protocol version

Four-part version for MDCP **artifact and config compatibility** (default `0.4.0.0`). Declared in `mdcp.config.json` as `protocolVersion` and in `mdcp.v*.llms.txt` as the first-line header `mdcp-llms-index: 0.4.0.0`. Filename may abbreviate trailing `.0` segments (`mdcp.v0.4.llms.txt` ≡ `0.4.0.0`).

**Version history:** `0.4.0.0` is the first published llms-index spec (open alpha). Pre-0.4 compile and doc-authoring evolution is recorded in [package changelogs](https://github.com/betsalel-williamson/mdcp/blob/main/packages/mdcp-cli/CHANGELOG.md) and the [0.4.0 changesets](https://github.com/betsalel-williamson/mdcp/tree/main/.changeset/) — see [Versioning and releases](../../DEVELOPERS.md#040-open-alpha-milestone).

Protocol version is **not** npm semver. npm `@bwilliamson/mdcp-cli@0.4.1` implements this draft protocol profile while tooling remains pre-1.0. **`valpha`** is the open-alpha symlink; **`vstable`** is reserved for npm **1.0.0**.

## mdcp-llms-index

**Legacy.** The legacy export profile for the versioned agent bootstrap file `mdcp.v*.llms.txt` in the docs root, which was replaced by [Agent Skills](#agent-skills).

## GFM

**GitHub Flavored Markdown** — standard Markdown plus GitHub extensions (tables, task lists, fenced code). Not Pandoc, LaTeX, or wikilinks.

## Authored GFM

Shard markdown as written before compile — no preprocessor substitution or template conditionals. Compile hooks may transform it during assembly; read [Preprocessor / templating (out of scope)](../../docs/features/design-constraints/preprocessor-templating.md#preprocessor--templating-out-of-scope).

## ignoreGuides

Guide names listed on the **compiling** guide under `compile.crossGuideLinks.ignoreGuides`. Cross-guide links to those guides keep source shard `.md` paths instead of rewriting to monolith `#slug` targets. Does not exclude the guide from `compileOrder` or the link index — only skips link rewrite for those targets. On publish outputs, [publish-relative rewrite](../mdcp-core/README.md#publish-relative-link-rewriting) still rebases the shard path for the publish file. Read [Cross-guide link rewriting](../mdcp-core/README.md#cross-guide-link-rewriting).

## WIIFM

**What's In It For Me** — reader-first benefit before mechanics or toolchain detail. On mdcp landing pages, each [adoption archetype](../../docs/features/personas-and-priority-tiers.md#adoption-archetypes) gets one WIIFM line; copy must follow [Benefit claims and evidence](../../docs/features/protocol/benefit-claims-and-evidence.md) tiers (Tier A/B on README, never unmeasured Tier C claims).
