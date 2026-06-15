# Docs-as-code bootstrap prompt (mdcp)

Copy the block below into your coding agent. Replace `{{FEATURE}}` and `{{PERSONA}}`, then run.

---

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
   - `docs:compile` → `mdcp compile --config docs/mdcp.config.json --docs-root docs`
   - `docs:check` → `mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint`
   - `docs:context` → `mdcp export --llm --stdout --config docs/mdcp.config.json --docs-root docs`
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

**Next steps:** After the pipeline exists, use task-type prompts from [examples/prompts/README.md](./README.md) (doc-only, feature, architecture, UX) and configure work-item tracking per [work-item-tracking.md](./work-item-tracking.md).
