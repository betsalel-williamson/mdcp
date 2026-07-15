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
| **Broken cross-links**     | Agents guess `#anchor` slugs    | `mdcp check` (optional `mdcp refs list` for slugs)     |
| **Context overload**       | Monolith pasted each agent turn | Host search, then read one shard                       |
| **Docs drift**             | Shards and output diverge       | `mdcp check` before merge                              |
| **Custom compile scripts** | Bash/Python glue nobody owns    | `compile`, `check`, `@bwilliamson/mdcp-presets`        |
| **Plan mixed with code**   | Stale prose drives wrong code   | Shards under `docs/features/`, `client/`, `developer/` |

Documentation should carry **context and the high-level plan**; code carries **implementation detail**. mdcp enforces that split with a validation gate agents and CI can run the same way. For granular reads, follow the [usage model](../../docs/features/protocol/usage-model.md).

### Typical agent loop

Discover shards with host search (`rg`, IDE search) → edit shards → `mdcp compile` → `mdcp check` (optional `mdcp refs list` to inspect slugs) → `mdcp export --llm` when the next turn needs doc context.

### Get started

First-time setup in a consumer repo: activate `/mdcp`, name the `getting-started` subagent ([getting-started.md](../../skills/mdcp/agents/getting-started.md)). The agent asks for `FEATURE` and `PERSONA` before editing. Subagent catalog and workflow: [LLM collaboration](#llm-collaboration).

For command and capability depth, read the [feature catalog](../../docs/features/feature-catalog.md).

## LLM collaboration

Spec-driven subagents and workflow for coding agents under the parent MDCP Agent Skill. For the problems mdcp solves and which commands address them, see [Why mdcp for coding agents](#why-mdcp-for-coding-agents).

**Source of truth:** versioned subagent instructions live under [skills/mdcp/agents/](../../skills/mdcp/agents). After `npx skills add`, the same files land under `.agents/skills/mdcp/agents/` in the consumer repo. This page indexes them and covers mdcp-specific workflow — not full agent text. Skill-side invoke recipe: [`skills/mdcp/references/agents.md`](../../skills/mdcp/references/agents.md).

### How to call subagents

Agent Skills discover only directories with `SKILL.md`. The portable slash entrypoint is **`/mdcp`** (the parent skill). Files under `agents/` are **resources** of that skill — not separate slash commands like `/mdcp:feature-level`.

1. Activate the parent skill: `/mdcp` (hosts that support slash skills), or let the host auto-load from the skill description.
2. Name the **subagent id** in the same turn (for example `feature-level` or `getting-started`).
3. The agent **reads** `.agents/skills/mdcp/agents/<id>.md` (after install) or `skills/mdcp/agents/<id>.md` (upstream) and follows it.
4. The subagent **asks intake questions** for missing values (`WORK_ITEM`, `FEATURE` / `PERSONA`) before editing — answer in chat; do not pre-fill a template.

**Fallback** (hosts without slash skills): attach or open the same `agents/<id>.md` path. Same content; not a different delivery model.

**Optional:** hosts that can fork work (Cursor Task, Claude `context: fork`, and similar) may spawn an isolated agent with that markdown as the task prompt.

### Subagents

| Id                    | When to use                       | Path after install                                  |
| --------------------- | --------------------------------- | --------------------------------------------------- |
| `getting-started`     | Bootstrap MDCP in a consumer repo | `.agents/skills/mdcp/agents/getting-started.md`     |
| `doc-only`            | Documentation-only work           | `.agents/skills/mdcp/agents/doc-only.md`            |
| `design-architecture` | RFCs, ADRs, data models           | `.agents/skills/mdcp/agents/design-architecture.md` |
| `feature-level`       | Feature work, docs-first then TDD | `.agents/skills/mdcp/agents/feature-level.md`       |
| `ux`                  | UI flows and client-guide updates | `.agents/skills/mdcp/agents/ux.md`                  |

Upstream copies: [skills/mdcp/agents/](../../skills/mdcp/agents). Each subagent opens with an **Intake (ask before editing)** section — the agent asks for missing parameters in chat and waits for answers rather than requiring a pre-filled template.

### Bootstrap (getting-started)

First-time setup for a consumer repo: activate `/mdcp`, name `getting-started`. The subagent asks for `FEATURE` and `PERSONA` before installing or configuring ([getting-started.md](../../skills/mdcp/agents/getting-started.md)).

The subagent instructs the agent to inspect the repository and mdcp docs before installing or configuring. Best for **Learner** and **Author** archetypes — see [Personas and priority tiers](../../docs/features/personas-and-priority-tiers.md).

### Follow-up turns

Use these after the pipeline exists (inline here — not duplicated in `skills/mdcp/agents/`). Prefer activating `/mdcp` first so docs-as-code rules stay in context.

**Add documentation for a new feature:**

```markdown
Add shards for feature "{{FEATURE}}" under `docs/features/`, update `docs/developer/` if maintainer workflows changed, and add an end-user section under `docs/client/`.
Update each guide's `index.md`, then run this repo's mdcp compile and check commands.
Discover shards with host search (`rg`, IDE search). Validate cross-links with `mdcp check` (optional `mdcp refs list`). Do not edit generated compile output by hand.
```

**Fix validation failures:**

```markdown
Documentation check failed. Read the error output, fix only shard `.md` files and config if needed, then re-run until check passes.
Use `mdcp check` (and optional `mdcp refs list`) to correct broken fragment links.
```

**Regenerate after TOC change:**

```markdown
I updated `index.md` in guide `{{GUIDE_NAME}}`. Run mdcp compile and check using this repo's documented commands.
```

### Docs-first feature workflow

Load scope from the tracker via `WORK_ITEM_LOOKUP` (GitHub MCP, `gh issue view`, Linear MCP, or your repo's documented integration). Then document before you implement — activate `/mdcp` and use the `feature-level` subagent ([feature-level.md](../../skills/mdcp/agents/feature-level.md)).

#### Workflow best practices

- **Branch first** — create a feature branch from updated `main` before shards, tests, or code (see [Agent work-item tracking](../../DEVELOPERS.md#agent-work-item-tracking))
- **One issue per branch** — stay focused on a single feature, design, or doc scope; do not mix unrelated work in one PR
- **Current behavior in docs** — shards describe the product as it works now; removed or breaking behavior belongs in the **changeset**, not `docs/features/` or `docs/client/`

| Phase     | Where            | Holds                                                  |
| --------- | ---------------- | ------------------------------------------------------ |
| Document  | `docs/features/` | Capabilities, design, API surface, acceptance criteria |
| Document  | `docs/client/`   | End-user value, experience, how to use the feature     |
| Implement | Code + tests     | TDD against the documented contract                    |

For architecture-heavy work before coding (RFCs, ADRs, data models), use the `design-architecture` subagent ([design-architecture.md](../../skills/mdcp/agents/design-architecture.md)).

#### Sharding keeps context lean

- **Core workflow** — `/mdcp` plus repo script wiring
- **On demand** — one subagent from `skills/mdcp/agents/` (or `.agents/skills/mdcp/agents/` after install); load only what the current task needs
- **Compiled context** — `mdcp export --llm` for token-stripped output scoped to registered guides

Prefer named subagents under the parent skill over permanently importing rigid always-on rules into every repo.

### Work item tracking

Task-type subagents collect `WORK_ITEM` and `WORK_ITEM_LOOKUP` via **intake questions** before editing:

- **`WORK_ITEM`** — ticket identifier or URL
- **`WORK_ITEM_LOOKUP`** — where the agent loads scope and delivery conventions (do not hard-code a tracker in the subagent file)

Point `WORK_ITEM_LOOKUP` at a shard under `docs/developer/` in your repo. The agent discovers GitHub MCP, `gh issue view`, Linear MCP, or other tools from that doc — not from a pasted template.

This repository documents its stack in [Agent work-item tracking](../../DEVELOPERS.md#agent-work-item-tracking) — prefer that path when the agent asks for `WORK_ITEM_LOOKUP` while dogfooding mdcp.

### Toolchain integration

mdcp exposes a **tool-agnostic contract**: agents need shell access and the ability to edit `.md` files.

- **Cursor / Composer** — activate `/mdcp`, name the subagent id; answer intake questions in chat; optionally attach `agents/<id>.md`; run the repo's doc check before ending a turn
- **Terminal agents** — load `SKILL.md` then the matching `agents/<id>.md`; or start with `mdcp export --llm` output; edit shards only; verify with the repo's doc check
- **CI / headless agents** — wire npm scripts; `mdcp check` exit code is the quality gate
- **Cross-links** — discover with host search; validate fragments with `mdcp check` (optional `mdcp refs list`)

Example npm scripts:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --docs-root docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint",
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --docs-root docs"
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
- Cross-links pass `mdcp check` (optional `mdcp refs list` to inspect slugs), not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`
- Subagents ask intake questions for `WORK_ITEM` / `WORK_ITEM_LOOKUP` (and related fields) before editing — answers live in the chat transcript
- One WORK_ITEM per PR — branch and scope match a single feature or design
- Shards describe current behavior; breaking or removed behavior is in the changeset, not feature/client guides

### See also

- [Why mdcp for coding agents](#why-mdcp-for-coding-agents) — developer pain and which commands address it
- [Agent integration](#agent-integration) — npm scripts quick reference
- [skills/mdcp/references/agents.md](../../skills/mdcp/references/agents.md) — invoke recipe and id table
- [skills/mdcp/agents/](../../skills/mdcp/agents) — versioned subagent instruction files
- [Project layout](#project-layout) — shard directory structure
- [Cross-links and refs](#cross-links-and-refs) — validate fragments after compile
- [Optional linters](#optional-linters) — markdownlint, Vale, link check peers

## Install and quick start

This package installs the `mdcp` command for use in your repo or CI. It works in **any** codebase — language, framework, and repo layout do not matter; mdcp only manages your documentation shards and compile pipeline.

**Fastest path:** install the Agent Skill, activate `/mdcp`, name the `getting-started` subagent ([getting-started.md](../../skills/mdcp/agents/getting-started.md)). Answer the agent’s intake questions for `FEATURE` and `PERSONA`.

### Requirements

- Node.js **>= 24.0.0**

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

**Agent Skill (optional day zero)** — prefer installing the Agent Skill (`npx skills add betsalel-williamson/mdcp --skill mdcp`). Subagents then live under `.agents/skills/mdcp/agents/` — upstream copies: [skills/mdcp/agents/](../../skills/mdcp/agents). Invoke with `/mdcp` then a subagent id — see [LLM collaboration](#llm-collaboration).

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
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --docs-root docs"
  }
}
```

```bash
# Compact context for feature work
mdcp export --llm --stdout --config docs/mdcp.config.json

# Discover shards with host search (rg, IDE search), then validate links
mdcp check --require-lint

# Optional: inspect registry headings after compile or check
mdcp refs list
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

Install the MDCP **parent Agent Skill** when you want a documentation system coding agents will follow — sharded docs, compile/check discipline — without a host-specific IDE extension.

This path is **host-agnostic**. It does not depend on Cursor, VS Code Marketplace, or any single product.

### Install

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

That vendors the skill into `.agents/skills/`. Zero-install alternative: copy `skills/mdcp/` from the upstream repository into your project's `.agents/skills/mdcp/`. Prefer `.agents/skills/` over host-specific aliases.

### Versioning and Upgrades

Agent Skills use a **vendoring** strategy: skill files become part of your project's source code under `.agents/skills/`.

1. The `npx skills add` command copies the skill into your `.agents/skills/` directory.
2. You **commit** these files to your repository. Every developer and agent on your team then uses the same instructions, and skill changes are reviewable in pull requests.
3. To **upgrade**, re-run `npx skills add`, review the `git diff`, and commit the changes.

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

Keep using npm scripts for compile and check — see [Agent integration](#agent-integration).

Plain-language: **compile** builds compiled docs from shards; **check** validates the documentation tree; **refs** is the cross-link fragment registry. The skill’s `scripts/` are thin wrappers into `@bwilliamson/mdcp-cli` — they do not replace the CLI.

### Next steps

1. Install the parent skill.
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

| Command             | When you need it                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `mdcp compile`      | Regenerate compiled outputs and `refs.json` under `outputDir` (exits 1 on broken links by default) |
| `mdcp check`        | Full gate: orphans → compile → refs → links → xrefs; optional peer linters                         |
| `mdcp shard`        | Split a monolith into shards (requires `config.source`)                                            |
| `mdcp refs list`    | List heading slugs from `refs.json` as JSON                                                        |
| `mdcp export --llm` | Token-stripped compiled output for LLM context                                                     |
| `mdcp lint`         | markdownlint-cli2 on shards and compiled output (peer, if installed)                               |
| `mdcp prose`        | Vale prose lint (peer, if installed)                                                               |
| `mdcp links`        | markdown-link-check on compiled output (peer, if installed)                                        |
| `mdcp fix`          | Prettier + markdownlint `--fix` (install peers in host repo first)                                 |

### Refs subcommands

| Command           | Purpose                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| `mdcp refs gen`   | Generate `refs.json` from compiled output                                  |
| `mdcp refs check` | Verify `refs.json` matches compiled output                                 |
| `mdcp refs list`  | List heading slugs from `refs.json` (run `mdcp check` or `refs gen` first) |

Discover shards with host search (`rg`, IDE search). Validate fragment links with `mdcp check`; use `mdcp refs list` when you need to inspect registry slugs.

### LLM and agent context

```bash
# Token-stripped compiled output for coding agents
mdcp export --llm --stdout

# Full structural gate (includes refs + link validation)
mdcp check

# Optional: inspect registry headings after compile or check
mdcp refs list
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
mdcp check --config docs/mdcp.config.json --docs-root docs
mdcp refs list --config docs/mdcp.config.json --docs-root docs
```

Discover shards with host search (`rg`, IDE search). `mdcp check` validates cross-link fragments against compiled slugs; `mdcp refs list` reads the registry file that `compile` just wrote.

## Cross-links and refs

When writing `` `[link text](#anchor)` `` in a shard, the fragment must match the [heading slug](#heading-slug) in **compiled** output. [Refs](#refs) are the system that keeps those [cross-links](#cross-link) organized and checkable after stitch — not a doc-search tool.

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
mdcp check --config docs/mdcp.config.json --docs-root docs
mdcp refs list
```

`mdcp check` fails on dead `#` fragments and bad paths. `mdcp refs list` shows registry entries from the [refs registry](#refs-registry).

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

1. **Prefer unique subheadings** — duplicate heading text in the same document produces `-1`, `-2` suffixes; the first `#slug` link may not reach later occurrences.
2. **Validate with `mdcp check`** — do not hand-roll anchors from shard-only titles and assume they survive compile.
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
4. Discover shards with host search; validate cross-link slugs with `mdcp check` (optional `mdcp refs list`; prefer GitHub auto-slugs over ``)
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

### Skill verification

- [skill content lint](#skill-content-lint)
- [live skill eval](#live-skill-eval)

### Format and compile terms

- [GFM](#gfm)
- [Authored GFM](#authored-gfm)
- [ignoreGuides](#ignoreguides)
- [refs](#refs)
- [refs registry](#refs-registry)
- [heading slug](#heading-slug)
- [cross-link](#cross-link)

### Adoption and messaging

- [WIIFM](#wiifm)

## MDCP

**MarkDown Context Protocol** — a **documentation system** delivered as an [Agent Skill](#agent-skills) and lightweight toolchain. It helps teams who care about durable docs distill mind maps, architecture notes, specs, and product ideas into small Markdown **shards** so intent stays reviewable in git, maintainable as ideas keep arriving, and readable one shard at a time by people and coding agents.

MDCP is not a magic bullet for documentation debt. It is a practice and skill that puts system context where it compounds — tracing why the software exists, how to use it, and what value it delivers — for a team of one or a full product, engineering, and marketing org.

The CLI (`compile`, `check`, [refs](#refs) registry maintenance, and `export --llm`) implements that shared context layer alongside the skill’s behavioral guardrails.

## heading slug

GitHub-style fragment id for a heading in **compiled** Markdown (the part after `#` in `[label](#slug)`). Parent concept: [refs](#refs).

MDCP computes slugs from final heading text after guides are stitched and demoted — same rules GitHub uses for README anchors (via `github-slugger`). Duplicate titles in one document get `-1`, `-2` suffixes. Authors should not invent fragments from shard-only titles; [cross-links](#cross-link) must match the compiled slug, and `mdcp check` fails when they do not.

## refs

**Refs** (short for **references**) are the organized set of heading [slugs](#heading-slug) and [cross-links](#cross-link) MDCP derives from compiled guides so authors and CI can keep Markdown links coherent after stitch.

The problem refs solve is structural, not retrieval: shards merge, heading levels shift, and duplicate titles get disambiguated — so a hand-guessed `#anchor` or stale path can break after `compile`. MDCP keeps a [refs registry](#refs-registry) and validates links at `check` time so the **compiled** document still targets the right sections and files.

### Related wording

| Form               | Meaning                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| **refs** (noun)    | The reference system as a whole (slugs + links + registry)                        |
| **refs registry**  | Derived catalog (`refs.json`) of compiled heading entries                         |
| **ref** (informal) | One heading entry or one link target under that system                            |
| **generate refs**  | Rebuild the registry from compiled output (`mdcp refs gen` / compile side effect) |
| **list refs**      | Print registry headings (`mdcp refs list`)                                        |
| **check refs**     | Confirm registry matches compiled headings (`mdcp refs check` / via `mdcp check`) |

There is no `refs lookup` verb. Doc discovery uses host search (`rg`, IDE search, or a future MCP index). Cross-link correctness uses **`mdcp check`** and optionally **`mdcp refs list`**.

Not the same as ordinary “search the docs.” Refs are about **correct anchors and paths after compile**.

## cross-link

A Markdown link whose target is another place in the docs set — usually a same-document `[label](#heading-slug)` fragment, or a path to another shard/guide that compile may rewrite.

Cross-links are why [refs](#refs) exist: after assemble, the visible heading text and level can change, so the [heading slug](#heading-slug) that works in a shard may differ from the slug in the compiled file. MDCP rewrites and validates these targets so published and monolith outputs keep working links. See [Built-in link validation](../../docs/features/link-validation.md).

## refs registry

Derived catalog of [heading slugs](#heading-slug) from compiled guide output, typically written as `refs.json` under `outputDir`. Parent concept: [refs](#refs).

The registry is **generated state**, not authored shards. `mdcp compile` (and `mdcp refs gen`) rebuild it; `mdcp check` / `mdcp refs check` verify it still matches the latest compile. Path rules: [Refs registry path](../../docs/features/refs-registry-path.md).

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

Portable packages of agent instructions (`SKILL.md` and companions) that hosts discover and load — the delivery model for MDCP’s **documentation system** guardrails. Upstream source in this monorepo is `skills/mdcp/`; consumers vendor via `npx skills add` into `.agents/skills/mdcp/` so agents learn how to shard, compile, validate, and maintain docs one piece at a time — across Cursor, Copilot, Claude Code, and similar hosts.

Verification is split: [skill content lint](#skill-content-lint) (`pnpm skill:lint`) plus agentskills.io validation (`pnpm skill:validate` / skills-ref) in CI; [live skill eval](#live-skill-eval) is the optional local skill-creator loop.

## protocol version

Optional four-part string for MDCP **artifact and config compatibility** (historically default `0.4.0.0`). Declared in `mdcp.config.json` as `protocolVersion` when present.

Legacy `mdcp.v*.llms.txt` files used the same string in a first-line header (`mdcp-llms-index: 0.4.0.0`). That bootstrap path is deprecated — prefer [Agent Skills](#agent-skills). See [mdcp-llms-index](#mdcp-llms-index).

Protocol version is **not** npm semver. npm `@bwilliamson/mdcp-cli` remains pre-1.0 while tooling and agent delivery continue to evolve.

## mdcp-llms-index

**Legacy.** The legacy export profile for the versioned agent bootstrap file `mdcp.v*.llms.txt` in the docs root, which was replaced by [Agent Skills](#agent-skills).

## skill content lint

CI/static check that required or forbidden language still appears in the parent `SKILL.md` (plus frontmatter and line-budget rules). Run with `pnpm skill:lint` against `skills/mdcp/SKILL.md`; fixtures live under `scripts/mdcp-skill-content-lint/` (repo CI assets — not part of the portable skill pack). This is substring analysis of Markdown on disk — **not** a [live skill eval](#live-skill-eval), and it does not run agents or measure triggering.

Companion gate: `pnpm skill:validate` runs [skills-ref](https://agentskills.io/specification) on each publishable skill under `skills/`.

## live skill eval

Optional local skill-creator workflow: run agents with the skill, grade outputs, and optimize description triggering. Fixtures for that loop live under `skills/mdcp/evals/`. Never a CI gate in this repository — contrast with [skill content lint](#skill-content-lint), which only checks that phrases exist in `SKILL.md`.

## GFM

**GitHub Flavored Markdown** — standard Markdown plus GitHub extensions (tables, task lists, fenced code). Not Pandoc, LaTeX, or wikilinks.

## Authored GFM

Shard markdown as written before compile — no preprocessor substitution or template conditionals. Compile hooks may transform it during assembly; read [Preprocessor / templating (out of scope)](../../docs/features/design-constraints/preprocessor-templating.md#preprocessor--templating-out-of-scope).

## ignoreGuides

Guide names listed on the **compiling** guide under `compile.crossGuideLinks.ignoreGuides`. Cross-guide links to those guides keep source shard `.md` paths instead of rewriting to monolith `#slug` targets. Does not exclude the guide from `compileOrder` or the link index — only skips link rewrite for those targets. On publish outputs, [publish-relative rewrite](../mdcp-core/README.md#publish-relative-link-rewriting) still rebases the shard path for the publish file. Read [Cross-guide link rewriting](../mdcp-core/README.md#cross-guide-link-rewriting).

## WIIFM

**What's In It For Me** — reader-first benefit before mechanics or toolchain detail. On mdcp landing pages, each [adoption archetype](../../docs/features/personas-and-priority-tiers.md#adoption-archetypes) gets one WIIFM line; copy must follow [Benefit claims and evidence](../../docs/features/protocol/benefit-claims-and-evidence.md) tiers (Tier A/B on README, never unmeasured Tier C claims).
