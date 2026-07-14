---
name: mdcp
description: >-
  Applies MarkDown Context Protocol (MDCP) for sharded documentation — bootstrap
  indexes, compile/check workflows, refs lookup, and extension packs. Use when
  writing or editing docs/, mdcp.config.json, mdcp.v*.llms.txt, glossary shards,
  guide manifests, or when the user mentions MDCP, llms-index, shard docs, or
  agent documentation context.
---

# MDCP Documentation Skill

Portable Agent Skill for MDCP. Prefer this over host-specific IDE extensions.

The protocol bootstrap remains the versioned **`mdcp.v*.llms.txt`** index (from
`spec/llms-index/` / `mdcp export --llms-index`). Extension packs under
`spec/extensions/` stay the source of truth for prompts and archetypes. This
skill teaches agents **when and how** to use those artifacts — it does not
replace them.

## Hard rules

- **NEVER** invent or rewrite MDCP workflow from memory when a local
  `mdcp.v*.llms.txt` or this skill's steps exist — read the index first.
- **NEVER** hand-edit fetched `mdcp.v*.llms.txt` for repo-specific guidance —
  put overlays in `docs/extensions/` or normative shards instead.
- **NEVER** edit generated compile output (`docs/_build/`, compiled README /
  `DEVELOPERS.md` publish targets when they are built outputs) — fix shards and
  recompile.
- **NEVER** dump whole monoliths into context — use `mdcp refs lookup`, then
  read **one shard** at a time.
- **NEVER** write functional product code for a docs/feature change without
  verifying intent against shards (or creating/updating those shards first when
  the repo follows docs-first).
- **ALWAYS** run `mdcp check` (or the repo's `docs:check` script) before trusting
  compiled output.

## When to use

- Authoring or refactoring sharded markdown under a docs root
- Bootstrapping MDCP in a new repository
- Looking up cross-links / refs while writing docs or implementing a documented feature
- Choosing cached task prompts from default extension packs

## Execution steps

### 1. Locate the agent index

1. Find `mdcp.v*.llms.txt` in the docs root (for example `docs/mdcp.v0.4.llms.txt`
   or `docs/mdcp.v0.4.0.1.llms.txt`).
2. If missing, fetch day-zero bootstrap:

```bash
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-profile dev --docs-root <docs-root>
```

3. Read that index. Follow its bootstrap, query, validation, and task-prompt
   sections. Upstream draft/alpha artifacts live in `spec/llms-index/`.

### 2. Prefer smallest context

1. Lookup:

```bash
mdcp refs lookup "<topic>" --format json --config <config> --docs-root <docs-root>
```

2. Open the single `.md` shard path from lookup or the guide manifest.
3. Only if needed, broader export: `mdcp export --llm --stdout …` (last resort).

### 3. Edit shards, then validate

1. Edit shards under the guides in `compileOrder` (commonly `features/`,
   `developer/`, `client/`, plus `glossary/` when present).
2. Update each guide's `index.md` / `shards.md` when adding files.
3. Compile and check:

```bash
mdcp compile --config <config> --docs-root <docs-root>
mdcp check --config <config> --docs-root <docs-root>
```

In this monorepo: `pnpm docs:compile:repo` and `pnpm docs:check`.

### 4. Use extension packs (unchanged)

- Canonical packs: [`spec/extensions/`](../../../spec/extensions/)
  (format packs, archetypes, `prompts-mdcp-defaults`).
- After fetch/config, default prompts cache under `.caches/mdcp/prompts/` (or
  the pack's `cacheDir`).
- Set `WORK_ITEM` and `WORK_ITEM_LOOKUP` in prompt headers before sending.
- Security for third-party pack sources: [`spec/extensions/SECURITY.md`](../../../spec/extensions/SECURITY.md).

Typical flow: read `mdcp.v*.llms.txt` → load cached prompt → `refs lookup` →
edit shards → `mdcp check`.

### 5. Optional workspace scaffold

When a docs root has no `mdcp.config.json` yet:

1. Create `docs/` (or the chosen docs root) and a starter config with
   `compileOrder` / `guides`.
2. Add guide dirs with `index.md` + a first shard.
3. Fetch or copy `mdcp.v*.llms.txt`.
4. Optionally scaffold Markdownlint / Prettier / Vale using
   `@bwilliamson/mdcp-presets` where the repo wants those peers.
5. Compile and check.

## Zero-install deployment

Copy this skill directory into consumer repos at one of:

| Path                   | Notes                                                      |
| ---------------------- | ---------------------------------------------------------- |
| `.agents/skills/mdcp/` | Preferred portable project path (Cursor, Copilot, VS Code) |
| `.github/skills/mdcp/` | Also discovered by GitHub Copilot / VS Code                |
| `.cursor/skills/mdcp/` | Cursor-specific alias                                      |

Any clone that includes the skill inherits MDCP guardrails without installing an
IDE extension. Keep `spec/` (llms-index + extensions) and CLI packages as the
protocol/tooling sources of truth.

## Publish / discovery (ecosystem)

Ship this directory as the MDCP skill bundle. Indexes that agents already pull from
include community skill registries (for example VoltAgent `awesome-agent-skills`,
SkillsMP / AgentSkill.sh) and host partner skill lists. The versioned
`mdcp.v*.llms.txt` files continue to publish from `spec/llms-index/` via
`mdcp export --llms-index` — do not rename that protocol artifact to `SKILL.md`.
