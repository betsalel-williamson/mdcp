---
name: mdcp
description: >-
  Applies MarkDown Context Protocol (MDCP) for sharded documentation — parent
  Agent Skill succeeding llms-index bootstrap, compile/check workflows, refs
  lookup, and complementary skills for prompts/formats. Use when writing or
  editing docs/ shards, mdcp.config.json, guide manifests, glossary shards, or
  when the user mentions MDCP, shard docs, refs lookup, or agent documentation.
---

# MDCP (parent skill)

Host-agnostic Agent Skill for MDCP. Prefer this over IDE extensions.

This **parent skill** is the intended agent entrypoint (successor to the
agent-facing role of `mdcp.v*.llms.txt`). Complementary skills will replace
`spec/extensions/` packs. During migration, llms-index and extensions remain
**transitional** — do not treat them as forever-primary.

Install help: [references/install.md](references/install.md)

## Hard rules

- **NEVER** invent MDCP workflow when this skill (or a local transitional
  `mdcp.v*.llms.txt`) already defines it — follow the skill first.
- **NEVER** hand-edit fetched `mdcp.v*.llms.txt` for repo-specific guidance —
  use complementary skills, `docs/extensions/`, or normative shards.
- **NEVER** edit generated compile output (`docs/_build/`, compiled publish
  targets) — fix shards and recompile.
- **NEVER** dump whole monoliths into context — `mdcp refs lookup`, then read
  **one shard** at a time.
- **NEVER** write functional product code for a docs/feature change without
  docs-first shards when the repo follows that convention.
- **ALWAYS** run `mdcp check` (or `docs:check`) before trusting compiled output.

## When to use

- Authoring or refactoring sharded markdown under a docs root
- Bootstrapping MDCP agent guidance (install parent skill first)
- Cross-links / refs while writing docs
- Choosing complementary skills for prompts, archetypes, or format packs

## Execution steps

### 1. Prefer the parent skill (llms-index is transitional)

1. Follow this skill’s workflow.
2. If a local `mdcp.v*.llms.txt` still exists, treat it as transitional compat —
   do not expand it; do not hand-edit it.
3. Install / rediscover via:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

### 2. Prefer smallest context

```bash
mdcp refs lookup "<topic>" --format json --config <config> --docs-root <docs-root>
```

Open the single `.md` shard path from lookup or the guide manifest. Broader
`mdcp export --llm` is last resort.

### 3. Edit shards, then validate

1. Edit shards under guides in `compileOrder`.
2. Update `index.md` / `shards.md` when adding files.
3. Run:

```bash
mdcp compile --config <config> --docs-root <docs-root>
mdcp check --config <config> --docs-root <docs-root>
```

In this monorepo: `pnpm docs:compile:repo` and `pnpm docs:check`.

### 4. Complementary skills (migrating from extensions)

Optional companions (as they land under `.agents/skills/`):

- `mdcp-prompts-defaults`
- `mdcp-arch-oss-library`
- `mdcp-arch-product-docs-site`
- `mdcp-format-marp`

Until migrated, transitional packs live under `spec/extensions/`. Epic:
<https://github.com/betsalel-williamson/mdcp/issues/102>

### 5. Optional workspace scaffold

When no `mdcp.config.json` yet: create docs root + config + guide dirs, install
the parent skill under `.agents/skills/mdcp/`, optionally add
`@bwilliamson/mdcp-presets`, then compile and check.

## Zero-install

Copy `.agents/skills/mdcp/` into the consumer repo (portable default). Hosts may
also read `.github/skills/` or `.claude/skills/`.
