# @bwilliamson/mdcp-cli

## Install and quick start

**mdcp** splits, compiles, validates, and exports sharded Markdown documentation. You edit small shard files; mdcp weaves them into one compiled guide (`guides.md`) with correct heading levels, working cross-links, and structure checks.

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

From the **repository root** (typical npm scripts), pass both `--config` and `--cwd`:

```bash
mdcp compile --config docs/mdcp.config.json --cwd docs
mdcp check --config docs/mdcp.config.json --cwd docs
```

`--config` is resolved from where you run the command; `--cwd` sets the docs root. Details: [Config essentials](#--config-vs---cwd-path-resolution).

Collaborating with an LLM? See [LLM collaboration](#llm-collaboration) for bootstrap prompts and toolchain integration (Cursor, Composer, Gemini CLI).

Global options (apply to every command):

| Option                | Default            | Purpose                                                                 |
| --------------------- | ------------------ | ----------------------------------------------------------------------- |
| `-c, --config <path>` | `mdcp.config.json` | Path to config file (relative to the invocation directory, not `--cwd`) |
| `--cwd <path>`        | current directory  | Docs root for shard trees and config path fields                        |

## Project layout

| Piece                                            | Role                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| Guide directory (`overview/`, `admin-guide/`, …) | One logical guide                                                      |
| `index.md` (or `shards.md`)                      | Human table of contents — **compile order** comes from link order here |
| `chapter-*.md` (typical)                         | One topic or chapter per file — naming is conventional, not required   |
| `about-this-guide.md`                            | Optional preamble shard                                                |
| `guides.md`                                      | Compiled monolith (generated — do not edit by hand)                    |
| `refs.json`                                      | Section link lookup table (written by `mdcp check` or `mdcp refs gen`) |

Shards use `#` headings so each file reads well on its own. During compile, mdcp demotes headings under the guide title in the monolith.

**Guide directories are human source only.** Generated outputs (`guides.md`, `refs.json`, per-guide `compile.outputFile`) live under `outputDir` (for example `_build/compiled/`).

When a manifest has preamble prose with example links (not section shards), set `compile.sectionsHeading` (for example `"Sections"`) so only links under that `##` heading count toward compile order. See [Manifest compile order](#manifest-compile-order).

Guides can also set `compile.outputFile` to publish a standalone document (for example an npm `README.md`) excluded from the monolith.

## Config essentials

### `--config` vs `--cwd` (path resolution)

These two global options answer different questions:

| Option         | Resolved from                                                                        | Purpose                                                       |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| **`--config`** | **Invocation directory** — where you run the command (repo root in most npm scripts) | Locates `mdcp.config.json` on disk                            |
| **`--cwd`**    | N/A (you pass the docs root explicitly)                                              | Docs root — see [Config path bases](#config-path-bases) below |

`--config` and `--cwd` use independent path bases — the config path is not prefixed with `--cwd`.

#### Repo-root npm scripts

From the repository root, point at the config file and set the docs root separately:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --cwd docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --cwd docs --require-lint"
  }
}
```

```bash
# Equivalent manual invocation from repo root
mdcp compile --config docs/mdcp.config.json --cwd docs
```

This resolves the config as `<repo>/docs/mdcp.config.json` and treats `docs/` as the shard tree root.

#### When you are already inside `docs/`

If your shell working directory **is** the docs folder, omit the `docs/` prefix on `--config` (or rely on the default `mdcp.config.json`):

```bash
cd docs
mdcp compile
mdcp compile --config mdcp.config.json
```

Here `--cwd` defaults to `docs/` (the invocation directory), which matches the shard layout.

#### Programmatic API

`loadConfig(configPath, configBase)` in `@bwilliamson/mdcp-core` mirrors the CLI: pass the invocation directory as `configBase`, and the docs root separately when resolving guide paths (`resolveGuideDir`, `resolveOutputPath`, `resolveRefsPath`, etc.). See [API — Config](#api-config).

#### Config path bases

Config path fields use **three bases**. Mixing them up is the most common path bug.

| Base                    | Set by                                     | Example (`--cwd docs`)                                                           |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| **Invocation dir**      | where you run the command                  | `--config docs/mdcp.config.json` from repo root → `<repo>/docs/mdcp.config.json` |
| **Docs root** (`--cwd`) | explicit flag (defaults to invocation dir) | `guides/features/` → `docs/features/`                                            |
| **`outputDir`**         | config field under `--cwd`                 | `_build/compiled` → `docs/_build/compiled/`                                      |

| Config field         | Resolved from            | Example value               | Resolves to (`--cwd docs`)       |
| -------------------- | ------------------------ | --------------------------- | -------------------------------- |
| `guides[].path`      | `--cwd`                  | `features`                  | `docs/features/`                 |
| Default guide dir    | `outputDir` + guide name | (omit `path`)               | `docs/<outputDir>/<name>/`       |
| `compile.outputFile` | `--cwd`                  | `../packages/foo/README.md` | `<repo>/packages/foo/README.md`  |
| `outputDir`          | `--cwd`                  | `_build/compiled`           | `docs/_build/compiled/`          |
| `outputFile`         | `outputDir`              | `guides.md`                 | `docs/_build/compiled/guides.md` |
| `refs.registryFile`  | `outputDir`              | `refs.json`                 | `docs/_build/compiled/refs.json` |

Monolith `outputFile` and `refs.registryFile` share the same rule: **relative to `outputDir`**, not `--cwd`. Per-guide `compile.outputFile` is always **relative to `--cwd`**.

If you accidentally give a cwd-relative path for `outputFile` or `refs.registryFile` that already lies under `outputDir` (for example `"_build/compiled/refs.json"` when `outputDir` is `"_build/compiled"`), MDCP normalizes it. Prefer outputDir-relative values in config (`"refs.json"`, `"guides.md"`).

---

Minimal `mdcp.config.json`:

```json
{
  "outputFile": "guides.md",
  "compileOrder": ["overview", "admin-guide"],
  "guides": [{ "name": "overview" }, { "name": "admin-guide" }],
  "refs": { "registryFile": "refs.json" }
}
```

| Field                           | Purpose                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `compileOrder`                  | Order of guide directories in the compiled monolith                                |
| `guides`                        | Per-guide options (hooks, manifests, separate outputs)                             |
| `outputDir`                     | Compile output root (relative to `--cwd`)                                          |
| `outputFile`                    | Monolith filename (relative to `outputDir`)                                        |
| `refs.registryFile`             | Cross-link lookup table (relative to `outputDir`)                                  |
| `lint`                          | markdownlint configs, xref checks, link checking                                   |
| `lint.markdownlint.shardsGlobs` | Optional shard lint paths relative to `--cwd` (default: `compileOrder` guide dirs) |
| `vale`                          | Prose lint and `.vale.ini` location                                                |
| `vale.scanGlobs`                | Optional Vale paths relative to `--cwd` (default: same guide dirs as shard lint)   |
| `source`                        | Monolith path — required only for `mdcp shard`                                     |

**Nested `outputDir` example** — use outputDir-relative filenames:

```json
{
  "outputDir": "_build/compiled",
  "outputFile": "guides.md",
  "compileOrder": ["overview"],
  "refs": { "registryFile": "refs.json" }
}
```

Per-guide `compile.outputFile` writes a publish target (relative to `--cwd`) and excludes that guide from the monolith. Use `compile.includeBanner: false` for npm README outputs.

#### `sectionsHeading`

When a manifest has preamble prose with example inline links before an ordered `## Sections` list, set `compile.sectionsHeading` to that heading. See [Manifest compile order](#manifest-compile-order) for behavior, examples, and when it is required.

```json
{
  "name": "glossary",
  "path": "glossary",
  "compile": {
    "title": "Compound glossary",
    "sectionsHeading": "Sections",
    "outputFile": "_build/compiled/glossary.md"
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

| Option                | Default            | Purpose                                                                    |
| --------------------- | ------------------ | -------------------------------------------------------------------------- |
| `-c, --config <path>` | `mdcp.config.json` | Config file path, resolved from the **invocation directory** (not `--cwd`) |
| `--cwd <path>`        | current directory  | Docs root for shard trees and config path fields                           |

**Repo-root npm scripts** typically use both flags:

```bash
mdcp compile --config docs/mdcp.config.json --cwd docs
```

`--config` locates the file from where the command runs; `--cwd` sets the shard tree root. These bases are independent — see [Config essentials](#--config-vs---cwd-path-resolution).

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

### Steps for a new consumer repo

1. Add `mdcp.config.json` to your docs shard directory
2. Replace local compile scripts with repo-root npm scripts, for example `mdcp compile --config docs/mdcp.config.json --cwd docs` (see [Config essentials](#--config-vs---cwd-path-resolution))
3. Replace validate scripts with `npx @bwilliamson/mdcp-cli check --require-lint`
4. Use `mdcp refs lookup` for cross-link slugs (no ``)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

Full maintainer migration map: [Legacy migration](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/legacy-migration.md).

## LLM collaboration

Use **mdcp** with coding agents (Cursor, Composer, Gemini CLI, and other terminal tools) to build and maintain sharded documentation. You describe the feature and end-user persona; the agent edits shard files; mdcp compiles, validates, and exports context for the next turn.

This workflow is how the mdcp project itself was bootstrapped: an early prompt asked an LLM to generate bash and Python tooling (`shard.sh`, `compile_sections.py`, `lint-xrefs.py`, `validate.sh`). That pipeline became the [`legacy/`](https://github.com/betsalel-williamson/mdcp/tree/main/legacy) reference implementation and then the `@bwilliamson/mdcp-*` npm packages. New adopters should **install mdcp** instead of asking an agent to recreate those scripts.

### Original prompt → mdcp

| Original ask                       | Use mdcp instead                                                       |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `shard.sh` + BMAD / md-tree        | `mdcp shard` (split only; requires `source` in config)                 |
| `compile_sections.py`              | `mdcp compile` (heading demotion, preamble strip)                      |
| Two `.markdownlint.jsonc` files    | `@bwilliamson/mdcp-presets` shard + compiled configs                   |
| `lint-xrefs.py`                    | `mdcp check` (built-in xref lint)                                      |
| Anchor registry JSON + heading ids | `mdcp refs lookup` / `refs.json` (GitHub slugs on **compiled** output) |
| Vale ambiguous-term rules          | `.vale.ini` + custom YAML in your repo (you define the terms)          |
| `validate.sh`                      | `mdcp check --require-lint` (+ optional `--require-vale`)              |

Full port map: [Legacy migration](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/legacy-migration.md).

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
   - `docs:compile` → `mdcp compile --config docs/mdcp.config.json --cwd docs`
   - `docs:check` → `mdcp check --config docs/mdcp.config.json --cwd docs --require-lint`
   - `docs:context` → `mdcp export --llm --stdout --config docs/mdcp.config.json --cwd docs`
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

### Toolchain integration

mdcp exposes a **tool-agnostic contract**: agents need shell access and the ability to edit `.md` files. Wire the same npm scripts regardless of which agent you use.

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --cwd docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --cwd docs --require-lint",
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --cwd docs",
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

### Human review checklist

When reviewing an agent's documentation PR:

- Only shard `.md` files and config changed — not hand-edited `guides.md` or `refs.json`
- `index.md` link order matches intended compile order (use `compile.sectionsHeading` when the manifest has preamble example links)
- `npm run docs:check` passes locally and in CI
- Cross-links use slugs from `mdcp refs lookup`, not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`

### See also

- [Agent integration](#agent-integration) — npm scripts quick reference
- [Project layout](#project-layout) — shard directory structure
- [Cross-links and refs](#cross-links-and-refs) — slug lookup while authoring
- [Optional linters](#optional-linters) — markdownlint, Vale, link check peers

## Agent integration

npm script stubs for wiring mdcp into any coding agent. For bootstrap prompts, multi-tool workflows (Cursor, Composer, Gemini CLI), and human review checklists, see [LLM collaboration](#llm-collaboration).

Add npm scripts in your consumer repo:

```json
{
  "scripts": {
    "docs:compile": "mdcp compile --config docs/mdcp.config.json --cwd docs",
    "docs:check": "mdcp check --config docs/mdcp.config.json --cwd docs --require-lint",
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json --cwd docs",
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

- [LLM collaboration](#llm-collaboration) — bootstrap prompt, toolchain integration, follow-up templates
- [Project README](https://github.com/betsalel-williamson/mdcp#readme) — concepts and design rationale
- [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md) — full maintainer docs
- [Sample guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides)

### License

MIT

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

MDCP knows the **full fileset** it manages: registered guides in `compileOrder`, resolved via `guides[].path` or `outputDir/<name>`. Shard markdownlint and Vale prose **only touch documents in that scope** — never legacy flat `.md` files, unregistered sibling folders, or other markdown under `--cwd` that mdcp does not compile.

| Command                                        | Default scope                                   | Out of scope (skipped)                            |
| ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| Shard markdownlint (`mdcp lint`, `mdcp check`) | `compileOrder` guide directories                | Legacy flat docs, unrelated subdirs under `--cwd` |
| Vale prose (`mdcp prose`, `mdcp check`)        | Same guide directories                          | Same                                              |
| Xref lint (`mdcp check`)                       | Same guide directories                          | Same                                              |
| Compiled markdownlint                          | Monolith and publish outputs (`compiledConfig`) | Separate pass — not shard trees                   |

Optional overrides **narrow** scope further; they never widen it beyond what you explicitly list:

| Config field                    | Purpose                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `lint.markdownlint.shardsGlobs` | Shard markdownlint paths relative to `--cwd` (default: compileOrder guide dirs) |
| `vale.scanGlobs`                | Vale prose paths relative to `--cwd` (default: same guide dirs)                 |

The `@bwilliamson/mdcp-presets` shard config supplies **rules and exclusions** (`!**/index.md`, `!guides.md`). **Scope always comes from the CLI** — not from preset globs.

`mdcp fix` is out of band: it runs unscoped `prettier --write .` and `markdownlint-cli2 --fix` across the repo and is not part of mdcp's guide fileset gate.
