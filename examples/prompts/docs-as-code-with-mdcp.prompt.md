# Docs-as-code bootstrap prompt (mdcp)

Copy this prompt into Cursor Agent, Composer, Gemini CLI, or any shell-capable coding agent. Replace the placeholders, then run.

---

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
