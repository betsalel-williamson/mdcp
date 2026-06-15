# Docs-as-code bootstrap prompt (mdcp)

Copy the block below into your agent. Fill in the code block at the top, then send.

---

**Replace before sending:**

```text
FEATURE=
PERSONA=
```

Set up a sharded docs-as-code pipeline using **mdcp** for FEATURE above.

**Setup:** Inspect this repository — package manager, existing docs layout, and developer docs — before changing files. Do not assume a specific host, script runner, or optional linter; discover what the repo already uses.

**Plan:** Outline install, config, guide layout, and validation steps from repo context and mdcp documentation, then execute.

Write:

- feature docs under `docs/features/` (what the product does)
- developer docs under `docs/developer/` (how to maintain and develop the repo)
- end-user docs under `docs/client/` — open with `about-this-guide.md` stating PERSONA above

Use mdcp commands only — do not create custom compile or lint scripts.

1. **Install** — Add `@bwilliamson/mdcp-cli`, `@bwilliamson/mdcp-presets`, and a markdown linter peer using this repo's package manager. Configure optional prose lint only if the repo documents it.

2. **Config** — Add `mdcp.config.json` under the docs root. Start from mdcp sample config in this repo or upstream mdcp examples; set `compileOrder`, guides, and lint paths for your layout.

3. **Scripts** — Wire `mdcp compile`, `mdcp check`, `mdcp export --llm`, and `mdcp refs lookup` into this repo's script runner (discover naming from existing `package.json` or developer docs).

4. **Guide layout** — Under `docs/`:
   - `docs/features/` — product capabilities, design, and API surface
   - `docs/developer/` — repo setup, layout, tests, releases, and other maintainer workflows
   - `docs/client/` — end-user guide; open with `about-this-guide.md` stating PERSONA above
     Each guide: `index.md` and topic shards. Shards are the source of truth — do not hand-edit generated compile output or `refs.json`.

5. **Write and validate** — After shards exist, compile and run the full documentation check until xref, orphan, and lint errors are resolved (use this repo's documented commands).

**Cross-links:** Run `mdcp refs lookup "<topic>" --format json` before inserting `[text](#slug)`. The slug must match **compiled** output, not the shard alone.

**Next steps:** After the pipeline exists, use task-type prompts from [examples/prompts/README.md](./README.md) and configure work-item tracking per [work-item-tracking.md](./work-item-tracking.md).
