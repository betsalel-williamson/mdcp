# CLI, scripts, and what the commands mean

Skill `scripts/*.sh` are **thin entrypoints**. They call `@bwilliamson/mdcp-cli` via `npx`. They are not a self-contained reimplementation of MDCP.

## What compile / check / refs mean

| Command        | Means                                                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mdcp compile` | **Build the docs.** Merge Markdown shards into compiled guide outputs (for example under `docs/_build/`) using `mdcp.config.json` and `compileOrder`. Shards are the source of truth; compiled files are generated. |
| `mdcp check`   | **Validate the documentation tree.** Run structural checks (cross-links, orphans, and optional lint/prose gates) so shards and compiled output stay trustworthy. Prefer this before trusting compiled docs.         |
| `mdcp refs`    | **Cross-link registry tools** (`refs list`, `refs gen`, …). Inspect or regenerate the fragment/slug registry (for example `refs.json`) so `#` links match **compiled** headings, not hand-guessed shard titles.     |

## Why wrappers instead of self-contained skill engines

Compile, check, refs, and doc lint/prose are one **shared system** in `@bwilliamson/mdcp-core`, exposed by `@bwilliamson/mdcp-cli`. Putting that logic in skill bash would fork the pipeline and drift from CI validation. The skill teaches **workflow**; the packages are the **engine**. Extra dependency complexity is the cost of one pipeline for agents, humans, and CI.

The core packages are:

- `@bwilliamson/mdcp-cli` — CLI commands
- `@bwilliamson/mdcp-core` — compile / check / refs / lint / prose engine
- `@bwilliamson/mdcp-presets` — shared markdownlint / Prettier / Vale wiring

## Dependencies

- Node.js **24+** and `npx` (see skill frontmatter `compatibility`)
- Network/registry access to fetch `@bwilliamson/mdcp-cli` when not linked locally
- Optional: Vale on `PATH` for prose (`prose.sh` / `mdcp check --require-vale`)

## Script → CLI map

| Script (after install)     | Invokes                                                              |
| -------------------------- | -------------------------------------------------------------------- |
| `scripts/compile.sh`       | `mdcp compile` — build compiled docs from shards                     |
| `scripts/check.sh`         | `mdcp check` — validate the docs tree                                |
| `scripts/mdcp-cli.sh`      | `mdcp` with passthrough args                                         |
| `scripts/fix.sh`           | `mdcp fix` — format shards (Prettier / markdownlint auto-fix)        |
| `scripts/prose.sh`         | `mdcp prose` — Vale prose lint                                       |
| `scripts/setup-linters.sh` | Install peer lint tooling (`prettier`, `markdownlint-cli2`, presets) |

After `npx skills add`, invoke from the consumer repo, for example:

```bash
./.agents/skills/mdcp/scripts/compile.sh
./.agents/skills/mdcp/scripts/check.sh
```
