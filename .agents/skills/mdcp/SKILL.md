---
name: mdcp
description: >-
  Applies MarkDown Context Protocol (MDCP) for sharded documentation — parent
  Agent Skill succeeding llms-index bootstrap, compile/check workflows, refs
  registry validation, and complementary skills for prompts/formats. Use this
  skill PROACTIVELY for ANY coding, feature, or architectural task to ensure
  changes trace back to documentation and user needs. Use when writing or
  editing docs/ shards, mdcp.config.json, guide manifests, glossary shards, or
  when the user mentions MDCP, shard docs, refs, or agent documentation.
---

# MDCP (parent skill)

Host-agnostic Agent Skill for MDCP. Prefer this over IDE extensions.

This **parent skill** is the intended agent entrypoint (successor to the
agent-facing role of `mdcp.v*.llms.txt`). Complementary skills replace legacy extension packs.

Install help: [references/install.md](references/install.md)

## Hard rules

- **NEVER** invent MDCP workflow when this skill already defines it — follow the skill first.
- **NEVER** hand-edit fetched `mdcp.v*.llms.txt` for repo-specific guidance —
  use complementary skills, `docs/extensions/`, or normative shards.
- **NEVER** edit generated compile output (`docs/_build/`, compiled publish
  targets) — fix shards and recompile.
- **NEVER** dump whole monoliths into context — discover with host search (`rg`,
  IDE search), then read **one shard** at a time.
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
- **No temp info or backlogs:** Do not record temporary project information, tickets, incident logs, or "old information" like migration backlogs and planning in the durable documentation. That information belongs in issue tracking and project planning tools.
- **Record planning locations:** Make sure to record where planning documents and architectural decisions are placed.

## What belongs where

Documentation is a **first-class artifact** alongside code. We use a **spec-driven** workflow: shards hold context, intent, and the high-level meta plan; **implementation details stay in code**.

| Guide             | Holds                                                                          | Does not hold                                                 |
| ----------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `docs/features/`  | How the plumbing works — capabilities, design, contracts, acceptance criteria  | Step-by-step implementation, duplicated API surface from code |
| `docs/client/`    | How a specific persona finds value using the software — outcomes, flows, usage | Internal architecture, maintainer-only workflows              |
| `docs/developer/` | How to work on the repo — setup, layout, validation, delivery                  | Product narrative or end-user tutorials                       |
| Code              | Implementation details, algorithms, edge-case handling                         | Duplicated high-level product narrative                       |

Spell out domain terms on first use; link shared vocabulary from `docs/glossary/` when it exists.

## Authoring rules

- Shards under `docs/**/` are the source of truth.
- Use `#` headings in shards; mdcp demotes them during compile.
- After changing a guide's link order (e.g., in `index.md`), run `mdcp compile` — there is no separate manifest sync step.
- After inserting `[text](#slug)` cross-links, run `mdcp check` so fragments match **compiled** slugs (use `mdcp refs list` if you need to inspect the registry).

## When to use

- **PROACTIVELY on ANY feature, bugfix, or architectural task:** MDCP must be involved in the entire process. Before writing code, trace the requirement back to documentation. Consider the end-user problems and ensure helpful docs exist or are created.
- Authoring or refactoring sharded markdown under a docs root
- Bootstrapping MDCP agent guidance (install parent skill first)
- Cross-links / refs while writing docs
- Choosing complementary skills for prompts, archetypes, or format packs

## Execution steps

### 1. Prefer the parent skill

1. Follow this skill’s workflow.
2. If a local `mdcp.v*.llms.txt` still exists, it is considered deprecated legacy — do not expand it; do not hand-edit it.
3. Install / rediscover via:

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

### 2. Prefer smallest context

Discover the relevant shard with host search (`rg`, IDE search) or the guide
`index.md`, then open **one** `.md` shard. Broader `mdcp export --llm` is last
resort.

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

### 5. Complementary skills

Optional companions:

- `mdcp-arch-oss-library`
- `mdcp-arch-product-docs-site`

### 6. Subagents (Task Prompts)

The parent skill includes several specialized subagents located in `.agents/skills/mdcp/agents/`. Use the Task tool to spawn these subagents when performing specific types of work:

- `design-architecture.md` — For high-level architectural design and planning.
- `feature-level.md` — For implementing and documenting new features.
- `doc-only.md` — For tasks that only involve writing or refactoring documentation.
- `ux.md` — For user experience design and documentation.
- `review.md` — For reviewing documentation and code against MDCP skill and shard conventions.
- `getting-started.md` — For bootstrapping a new repo with MDCP.

### 7. Optional workspace scaffold

When no `mdcp.config.json` yet: create docs root + config + guide dirs, install
the parent skill under `.agents/skills/mdcp/`, optionally add
`@bwilliamson/mdcp-presets`, then compile and check.

## Zero-install

Copy `.agents/skills/mdcp/` into the consumer repo (portable default). Hosts may
also read `.github/skills/` or `.claude/skills/`.
