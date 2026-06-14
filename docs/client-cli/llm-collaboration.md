# LLM collaboration

Use **mdcp** with coding agents (Cursor, Composer, Gemini CLI, and other terminal tools) to build and maintain sharded documentation. You describe the feature and end-user persona; the agent edits shard files; mdcp compiles, validates, and exports context for the next turn.

This workflow is how the mdcp project itself was bootstrapped: an early prompt asked an LLM to generate bash and Python tooling (`shard.sh`, `compile_sections.py`, `lint-xrefs.py`, `validate.sh`). That pipeline became the [`legacy/`](https://github.com/betsalel-williamson/mdcp/tree/main/legacy) reference implementation and then the `@bwilliamson/mdcp-*` npm packages. New adopters should **install mdcp** instead of asking an agent to recreate those scripts.

## Original prompt → mdcp

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

## Bootstrap prompt (copy-paste)

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

## Toolchain integration

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

For npm script stubs only, see [Agent integration](./agent-integration.md).

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

## Human review checklist

When reviewing an agent's documentation PR:

- Only shard `.md` files and config changed — not hand-edited `guides.md` or `refs.json`
- `index.md` link order matches intended compile order (use `compile.sectionsHeading` when the manifest has preamble example links)
- `npm run docs:check` passes locally and in CI
- Cross-links use slugs from `mdcp refs lookup`, not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`

## See also

- [Agent integration](./agent-integration.md) — npm scripts quick reference
- [Project layout](./project-layout.md) — shard directory structure
- [Cross-links and refs](./cross-links-and-refs.md) — slug lookup while authoring
- [Optional linters](./optional-linters.md) — markdownlint, Vale, link check peers
