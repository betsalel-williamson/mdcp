# Getting started with mdcp (bootstrap prompt)

Copy the block below into your agent. Fill in the code block at the top, then send.

---

**Replace before sending:**

```text
FEATURE=
PERSONA=
```

Set up a sharded documentation pipeline using **mdcp** for FEATURE above.

**Setup:** Inspect this repository — package manager, existing docs layout, and developer docs — before changing files. Do not assume a specific host, script runner, or optional linter; discover what the repo already uses.

**Plan:** Outline install, config, guide layout, and validation steps from repo context and mdcp documentation, then execute.

Write:

- feature docs under `docs/features/` (what the product does)
- developer docs under `docs/developer/` (how to maintain and develop the repo)
- end-user docs under `docs/client/` — open with `about-this-guide.md` stating PERSONA above
- shared terms under `docs/glossary/` — acronyms and domain vocabulary (cross-guide; link from each guide's `index.md`)

Use mdcp commands only — do not create custom compile or lint scripts.

1. **Install** — Add `@bwilliamson/mdcp-cli` and `@bwilliamson/mdcp-presets` using this repo's package manager.

   Optional peers (install only what you need; wire preset paths in `mdcp.config.json` under `lint.markdownlint`):
   - **`markdownlint-cli2`** — shard and compiled markdown lint (`mdcp lint`; `mdcp check --require-lint` in CI)
   - **`prettier`** — repo formatting (`mdcp fix` runs `prettier --write .` when installed)
   - **`vale`** — prose style lint (`mdcp prose`; `mdcp check --require-vale` in CI). Install on `PATH` separately ([Vale installation](https://vale.sh/docs/vale-cli/installation/) — Homebrew, Chocolatey, Snap, or GitHub release). Add `.vale.ini`, then run `vale sync`.

   Example npm devDependencies: `markdownlint-cli2`, `prettier`, `@bwilliamson/mdcp-presets`

2. **Config** — Add `mdcp.config.json` under the docs root. Start from mdcp sample config in this repo or upstream mdcp examples; set `compileOrder`, guides, and lint paths for your layout.

3. **Scripts** — Wire `mdcp compile`, `mdcp check`, `mdcp export --llm`, and `mdcp refs lookup` into this repo's script runner (discover naming from existing `package.json` or developer docs). When optional linters are installed, use `mdcp check --require-lint` and/or `--require-vale` for CI gates.

4. **Guide layout** — Under `docs/`:
   - `docs/glossary/` — shared acronyms and domain terms; link from each guide's `index.md`
   - `docs/features/` — product capabilities, design, and API surface
   - `docs/developer/` — repo setup, layout, tests, releases, and other maintainer workflows
   - `docs/client/` — end-user guide; open with `about-this-guide.md` stating PERSONA above
     Each guide: `index.md` and topic shards. Shards are the source of truth — do not hand-edit generated compile output or `refs.json`.

5. **Glossary seed** — Before writing feature shards, ask whether any domain terms, acronyms, or easily confused words need shared definitions right away. Add those entries under `docs/glossary/` first so feature and client docs stay consistent.

6. **Write and validate** — After shards exist, compile and run the full documentation check until xref, orphan, and lint errors are resolved (use this repo's documented commands).

**Cross-links:** Run `mdcp refs lookup "<topic>" --format json` before inserting `[text](#slug)`. The slug must match **compiled** output, not the shard alone.

**Next steps:** After the pipeline exists, use task-type prompts from [examples/prompts/README.md](./README.md). Each task uses one WORK_ITEM per branch — branch from updated `main` before editing. Document work-item tracking once per repo under `docs/developer/` so agents know how to load tracker issues (see [Agent work-item tracking](../../docs/developer/agent-work-item-tracking.md) in the mdcp repo).
