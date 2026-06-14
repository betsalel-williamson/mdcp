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

## Two-tier doc layout

Split documentation the way the original bootstrap prompt described:

| Guide directory                        | Audience                   | Typical content                                                          |
| -------------------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `docs/features/`                       | Maintainers, coding agents | What the feature does, design constraints, API surface                   |
| `docs/client/` or `docs/client-guide/` | End users                  | How to use the feature; persona and skill level in `about-this-guide.md` |

Each guide directory needs:

- `index.md` — human table of contents (links to shard files)
- `sections.txt` — machine compile order (from `mdcp sections`)
- Topic shards — one file per section (for example `authentication.md`)
- Optional `about-this-guide.md` — preamble shard (persona, scope)

After changing a guide's `index.md`, run `mdcp sections`. Never hand-edit generated `guides.md` or `refs.json`.

**Worked example:** this repository dogfoods under [`docs/features/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/features) (tool capabilities) and [`docs/client-cli/`](https://github.com/betsalel-williamson/mdcp/tree/main/docs/client-cli) (consumer adoption), wired by [`docs/mdcp.config.json`](https://github.com/betsalel-williamson/mdcp/blob/main/docs/mdcp.config.json). For a minimal fixture, see [examples/sample-guides](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides).

## Bootstrap prompt (copy-paste)

Fill in `{{FEATURE}}` and `{{PERSONA}}`, then paste into Cursor Agent, Composer, Gemini CLI, or any shell-capable coding agent.

A standalone copy lives at [examples/prompts/docs-as-code-with-mdcp.prompt.md](https://github.com/betsalel-williamson/mdcp/blob/main/examples/prompts/docs-as-code-with-mdcp.prompt.md).

```markdown
For the feature: {{FEATURE}}

The end user for client docs is: {{PERSONA}}

I am setting up a docs-as-code pipeline for my project's Markdown documentation. You are an expert coder, expert tech writer, and expert UX designer. I want to evaluate my code into feature docs, followed by creating client-level docs. Split my docs into maintainable shards and use static analysis to enforce quality.

**Use mdcp — do not generate custom compile or lint scripts.**

Install and wire:

1. **mdcp toolchain** — Add dev dependencies:
   `npm install -D @bwilliamson/mdcp-cli @bwilliamson/mdcp-presets markdownlint-cli2 @vvago/vale`
   Copy the starter config from
   https://github.com/betsalel-williamson/mdcp/blob/main/examples/sample-guides/mdcp.config.json
   into `docs/mdcp.config.json`. Point `lint.markdownlint` at the preset JSONC files from `@bwilliamson/mdcp-presets`.

2. **npm scripts** — Add to package.json:
   - `docs:compile` → `mdcp compile --config docs/mdcp.config.json --cwd docs`
   - `docs:check` → `mdcp check --config docs/mdcp.config.json --cwd docs --require-lint`
   - `docs:context` → `mdcp export --llm --stdout --config docs/mdcp.config.json --cwd docs`
   - `docs:refs` → `mdcp refs lookup`

3. **Two guide directories** under `docs/`:
   - `docs/features/` — maintainer and agent docs for this feature
   - `docs/client/` (or `docs/client-guide/`) — end-user guide; open with `about-this-guide.md` stating the persona above
     Each guide: `index.md`, `sections.txt`, and topic shards. Register both guides in `mdcp.config.json` `compileOrder` and `guides`.

4. **Vale** — Add `.vale.ini` under `docs/`. Ask me for 3 examples of ambiguous domain terms, then write custom Vale rules that warn when authors confuse them.

5. **Do not create** `shard.sh`, `compile_sections.py`, `lint-xrefs.py`, `validate.sh`, or hand-maintained `{#anchor-id}` headings. Use `mdcp shard`, `mdcp compile`, `mdcp check`, and `mdcp refs lookup` instead.

6. **Write the docs** — After shards exist:
   - `mdcp sections --config docs/mdcp.config.json --cwd docs`
   - `mdcp compile --config docs/mdcp.config.json --cwd docs`
   - `mdcp check --config docs/mdcp.config.json --cwd docs --require-lint`
     Fix any xref, orphan, or lint errors before finishing.

Cross-links: run `mdcp refs lookup "<topic>" --format json` before inserting `[text](#slug)` in a shard. The slug must match **compiled** output, not the shard alone.
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

| Tool                                         | How mdcp fits                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cursor / Composer**                        | Paste the bootstrap prompt in Agent or Composer. `@`-reference shard files under `docs/features/` or `docs/client/` for local context. Run `npm run docs:check` before ending a turn. Optional: copy [examples/agent-rules/docs-as-code.mdc](https://github.com/betsalel-williamson/mdcp/blob/main/examples/agent-rules/docs-as-code.mdc) into your repo's `.cursor/rules/`. |
| **Gemini CLI** (and similar terminal agents) | Start a session with `npm run docs:context` output as context, or instruct the agent to run it. Agent edits shards only — never `guides.md`. Verify with `npm run docs:check`.                                                                                                                                                                                               |
| **Generic CI / headless agents**             | Same npm scripts. `mdcp check` exit code is the quality gate.                                                                                                                                                                                                                                                                                                                |
| **Any agent writing links**                  | `npm run docs:refs -- "topic"` or `mdcp refs lookup "topic" --format json` before inserting cross-links.                                                                                                                                                                                                                                                                     |

For npm script stubs only, see [Agent integration](./agent-integration.md).

## Follow-up prompts

Use these after the pipeline exists.

**Add documentation for a new feature:**

```markdown
Add shards for feature "{{FEATURE}}" under `docs/features/` and an end-user section under `docs/client/`.
Update each guide's `index.md`, run `mdcp sections`, then `mdcp compile` and `mdcp check --require-lint`.
Use `mdcp refs lookup` for every cross-link. Do not edit `guides.md` by hand.
```

**Fix validation failures:**

```markdown
`npm run docs:check` failed. Read the error output, fix only shard `.md` files and `sections.txt` if needed, then re-run until check passes.
Use `mdcp refs lookup` to correct broken fragment links.
```

**Regenerate manifest after TOC change:**

```markdown
I updated `index.md` in guide `{{GUIDE_NAME}}`. Run `mdcp sections`, then `mdcp compile` and `mdcp check`.
```

## Human review checklist

When reviewing an agent's documentation PR:

- Only shard `.md` files (and `sections.txt` / config) changed — not hand-edited `guides.md` or `refs.json`
- `sections.txt` updated if any `index.md` link order changed
- `npm run docs:check` passes locally and in CI
- Cross-links use slugs from `mdcp refs lookup`, not guessed anchors
- Client guide opens with persona context in `about-this-guide.md`

## See also

- [Agent integration](./agent-integration.md) — npm scripts quick reference
- [Project layout](./project-layout.md) — shard directory structure
- [Cross-links and refs](./cross-links-and-refs.md) — slug lookup while authoring
- [Optional linters](./optional-linters.md) — markdownlint, Vale, link check peers
