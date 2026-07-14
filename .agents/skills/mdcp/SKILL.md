---
name: mdcp
description: >-
  Applies MarkDown Context Protocol (MDCP) for sharded documentation — parent
  Agent Skill succeeding llms-index bootstrap, compile/check workflows, refs
  lookup, and complementary skills for prompts/formats. Use this skill
  PROACTIVELY for ANY coding, feature, or architectural task to ensure changes
  trace back to documentation and user needs. Use when writing or
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

## Quality Assurance (QA) Principles

When applying MDCP, you must act as a complementary partner to other skills and systems, enforcing docs-as-code hygiene:

- **Always reference doc shards:** Insert yourself into the process to ensure the current task references the correct documentation shards.
- **Update as you go:** Continuously update documentation as work progresses.
- **Capture ambiguity:** Identify ambiguous terms or language and write down the clarified details into specific shards.
- **Break it down:** Organize information into the smallest possible pieces (shards).
- **No code in docs:** Never include implementation code or examples in the documentation shards; code belongs in the codebase.
- **No temp info:** Do not record temporary project information, tickets, or incident logs in the durable documentation.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

## When to use

- **PROACTIVELY on ANY feature, bugfix, or architectural task:** MDCP must be involved in the entire process. Before writing code, trace the requirement back to documentation. Consider the end-user problems and ensure helpful docs exist or are created.
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
./.agents/skills/mdcp/scripts/lookup.sh "<topic>"
```

Open the single `.md` shard path from lookup or the guide manifest. Broader
`mdcp export --llm` is last resort.

### 3. Edit shards, then validate

1. Edit shards under guides in `compileOrder`.
2. Update `index.md` / `shards.md` when adding files.
3. Run:

```bash
./.agents/skills/mdcp/scripts/compile.sh
./.agents/skills/mdcp/scripts/check.sh
```

In this monorepo: `pnpm docs:compile:repo` and `pnpm docs:check`.

### 4. Code Formatting and Linting

If the user asks to set up formatting or linting, run:

```bash
./.agents/skills/mdcp/scripts/setup-linters.sh
```

This installs `prettier`, `markdownlint-cli2`, and `@bwilliamson/mdcp-presets`. It will also remind you to install `vale` separately. (Note: MDCP is flexible; if the user prefers other formatting or linting tools, you can integrate those instead.)

To automatically format documents using the default tools:

```bash
./.agents/skills/mdcp/scripts/fix.sh
```

To run prose linting (requires Vale):

```bash
./.agents/skills/mdcp/scripts/prose.sh
```

### 5. Complementary skills (migrating from extensions)

Optional companions (as they land under `.agents/skills/`):

- `mdcp-prompts-defaults`
- `mdcp-arch-oss-library`
- `mdcp-arch-product-docs-site`
- `mdcp-format-marp`

Until migrated, transitional packs live under `spec/extensions/`. Epic:
<https://github.com/betsalel-williamson/mdcp/issues/102>

### 6. Optional workspace scaffold

When no `mdcp.config.json` yet: create docs root + config + guide dirs, install
the parent skill under `.agents/skills/mdcp/`, optionally add
`@bwilliamson/mdcp-presets`, then compile and check.

## Zero-install

Copy `.agents/skills/mdcp/` into the consumer repo (portable default). Hosts may
also read `.github/skills/` or `.claude/skills/`.
