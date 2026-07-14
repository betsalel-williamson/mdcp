# Getting started with mdcp (bootstrap prompt)

Copy the block below into your agent. Fill in the code block at the top, then send.

---

**Replace before sending:**

```text
FEATURE=
PERSONA=
```

Set up a sharded documentation pipeline using **mdcp** for FEATURE above.

**First step (phase 1 — day zero):** Fetch agent index + extension caches before full tooling is wired:

```bash
# In-progress protocol (vdev profile)
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-profile dev --docs-root docs

# Pinned open-alpha release (recommended after config exists — phase 2)
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-ref v0.4.1 --docs-root docs
```

**Phase 2 — pin protocol profile + extensions:** Add `mdcp.config.json`, then re-fetch:

```json
{
  "protocol": {
    "profile": "alpha",
    "ref": "v0.4.1"
  },
  "extensions": {
    "packs": [{ "id": "prompts-mdcp-defaults", "enabled": true, "version": "0.4.0.0" }]
  }
}
```

Set `protocol.ref` to your feature branch when the `valpha` symlink is not on `main` yet (dogfood only).

```bash
npx @bwilliamson/mdcp-cli export --llms-index --fetch --fetch-ref v0.4.1 --config docs/mdcp.config.json --docs-root docs
```

Run `mdcp export --llms-index` to write the agent index (`mdcp.v*.llms.txt`) under the docs root. `npx @bwilliamson/mdcp-cli export --llms-index --fetch` also caches versioned task prompts to `.caches/mdcp/prompts/`.

**Setup:** Inspect this repository — package manager, existing docs layout, and developer docs — before changing files. Do not assume a specific host, script runner, or optional linter; discover what the repo already uses.

**Plan:** Outline install, config, guide layout, and validation steps from repo context and mdcp documentation, then execute.

Write:

- feature docs under `docs/features/` (what the product does)
- developer docs under `docs/developer/` (how to maintain and develop the repo)
- end-user docs under `docs/client/` — open with `about-this-guide.md` stating PERSONA above
- shared terms under `docs/glossary/` — one term per `.md` shard; group with `index.md` and optional sub-indexes (`index-protocol.md`, etc.); link `../glossary/index.md` from each guide's `index.md`

Use mdcp commands only — do not create custom compile or lint scripts.

1. **Install** — Add `@bwilliamson/mdcp-cli` and `@bwilliamson/mdcp-presets` using this repo's package manager.

   Optional peers (install only what you need; wire preset paths in `mdcp.config.json` under `lint.markdownlint`):
   - **`markdownlint-cli2`** — shard and compiled markdown lint (`mdcp lint`; `mdcp check --require-lint` in CI)
   - **`prettier`** — repo formatting (`mdcp fix` runs `prettier --write .` when installed)
   - **`vale`** — prose style lint (`mdcp prose`; `mdcp check --require-vale` in CI). Install on `PATH` separately per the official Vale CLI installation guide. Add `.vale.ini`, then run `vale sync`.

   Example npm devDependencies: `markdownlint-cli2`, `prettier`, `@bwilliamson/mdcp-presets`

2. **Config** — Add `mdcp.config.json` under the docs root. Start from your repo's docs layout; use mdcp documentation for sample `mdcp.config.json`. Set `compileOrder`, guides, and lint paths for your layout.

3. **Scripts** — Wire `mdcp compile`, `mdcp check`, `mdcp export --llm`, and `mdcp refs lookup` into this repo's script runner (discover naming from existing `package.json` or developer docs). When optional linters are installed, use `mdcp check --require-lint` and/or `--require-vale` for CI gates.

4. **Guide layout** — Under `docs/`:
   - `docs/glossary/` — one term per shard; `index.md` lists sub-indexes and terms; link from each guide's `index.md`
   - `docs/features/` — product capabilities, design, and API surface
   - `docs/developer/` — repo setup, layout, tests, releases, and other maintainer workflows
   - `docs/client/` — end-user guide; open with `about-this-guide.md` stating PERSONA above
     Each guide: `index.md` and topic shards. Shards are the source of truth — do not hand-edit generated compile output or `refs.json`.

5. **Glossary seed** — Before writing feature shards, ask whether any domain terms, acronyms, or easily confused words need shared definitions right away. Add one `.md` shard per term under `docs/glossary/` and list it from an index manifest so feature and client docs stay consistent.

6. **Write and validate** — After shards exist, compile and run the full documentation check until xref, orphan, and lint errors are resolved (use this repo's documented commands).

**Cross-links:** Run `mdcp refs lookup "<topic>" --format json` before inserting `[text](#slug)`. The slug must match **compiled** output, not the shard alone.

**Next steps:** After the pipeline exists, load task-type prompts from `.caches/mdcp/prompts/` (same directory after `mdcp export --llms-index --fetch`): [feature-level-task.prompt.md](./feature-level-task.prompt.md), [doc-only-task.prompt.md](./doc-only-task.prompt.md), [design-architecture-task.prompt.md](./design-architecture-task.prompt.md), [ux-task.prompt.md](./ux-task.prompt.md), [review-task.prompt.md](./review-task.prompt.md). Each task uses one `WORK_ITEM` per branch — branch from updated `main` before editing. Add a `docs/developer/` shard (for example `agent-work-item-tracking.md`) documenting tracker host, issue id format, and how agents load scope; set `WORK_ITEM_LOOKUP` in each task prompt to that shard path.
