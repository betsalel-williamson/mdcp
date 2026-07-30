# Transcript — eval-11-srp-overloaded (with_skill)

## Skill path used

`/workspace/.agents/skills/mdcp-workspace/skill-new-pr210/SKILL.md`

References loaded:

- `references/shard-responsibility.md` — **yes, read in full** (required by QA principle “Shard single responsibility”)
- Did **not** load main snapshot skill or helper skills (`mdcp-doc-only`, etc.)

## Steps taken

1. Read parent skill hard rules / QA principles / What belongs where / Execution steps.
2. Read `references/shard-responsibility.md` (single responsibility, idea mitosis, after-split, guides).
3. Discovered fixture shards via listing `docs/` (smallest context):
   - `docs/features/export-capability.md` (overloaded)
   - `docs/client/export-results.md` (stub)
   - guide indexes + `mdcp.config.json`
4. Diagnosed SRP violations in `export-capability.md`:
   - Dual **audience**: end-user how-to (client) vs architecture (features)
   - Dual **job**: instruct how-to vs explain architecture
   - Unsettled / time-bound discovery next to durable truth
5. Applied **idea mitosis** (not “keep one file”):
   - Features shard → architecture only
   - Client shard → end-user how-to (filled the existing stub)
   - Removed temporary discovery / ticket / spike notes from durable docs
   - Cross-linked the two shards; indexes already listed both (unchanged)
6. Two-level review:
   - Isolation: each shard states one responsibility in one sentence
   - Comprehensive: indexes still match; no duplicated how-to; temp notes gone; cross-links agree
7. Validated with CLI (`node packages/mdcp-cli/dist/cli.js`):
   - `compile --docs-root docs`
   - `check --docs-root docs` → passed
8. Trimmed `compileOrder` to `["features", "client"]` so check matches the guides that actually exist (fixture listed empty `developer` / `glossary`).

## Key decisions / rationalizations (vs “keep one file”)

Leadership prompt: keep everything about export in **one** feature file under time pressure.

Skill overrides that pressure:

- **Shard single responsibility** + **Idea mitosis**: dual audience/job → split; do not ship a mini-monolith “so agents find it faster.”
- Placement test: end-user export steps belong in `docs/client/`; pipeline architecture in `docs/features/`.
- **No temp info**: spike / EXP-221 / “PM asked…” do not belong in durable shards (issue tracker).
- Minimal churn: reused the existing client stub instead of inventing a third file; did not add developer/glossary stubs; only edited the two export shards (+ small config compileOrder fix for check).

## Final `docs/` file tree (shards; excludes `_build/`)

```text
docs/
  client/
    export-results.md    # changed — how-to
    index.md             # unchanged
  features/
    export-capability.md # changed — architecture only
    index.md             # unchanged
```

Also: `mdcp.config.json` — `compileOrder` narrowed to existing guides.

## Summary of edits

| Path                                 | Action                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `docs/features/export-capability.md` | Kept durable architecture; dropped how-to + temp notes; link to client |
| `docs/client/export-results.md`      | Replaced stub with export how-to; link to features                     |
| `mdcp.config.json`                   | `compileOrder`: `["features", "client"]` only                          |

**Outcome: split** (not one file).
