# Transcript — eval-11-srp-overloaded (old_skill / main snapshot)

## Skill path used

`/workspace/.agents/skills/mdcp-workspace/skill-snapshot-main/SKILL.md`

(References loaded: `references/cli-and-scripts.md`. No helper skills loaded.)

## Steps taken

1. Read parent skill hard rules, QA principles, **What belongs where** table, authoring rules, and execution steps.
2. Discovered workspace shards via listing; opened **one shard at a time** starting with `docs/features/export-capability.md`.
3. Read existing `docs/client/export-results.md` (stub), both guide `index.md` files, and `mdcp.config.json`.
4. Applied placement test from the skill:
   - End-user how-to → `docs/client/`
   - Architecture / capability → `docs/features/`
   - Temporary discovery / tickets → remove from durable docs
5. Rewrote `docs/features/export-capability.md` to architecture/capability only; removed how-to and temp notes.
6. Filled `docs/client/export-results.md` with the end-user export steps (replaced stub).
7. Added cross-links between the two shards after the split. Guide indexes already listed both files — left unchanged.
8. Attempted `mdcp check` / `mdcp compile` via `npx @bwilliamson/mdcp-cli` (0.7.0). Check fails on missing `developer` / `glossary` guide dirs listed in fixture `compileOrder` (pre-existing fixture gap); did not expand the docs tree to invent those guides under time pressure.

## Key decisions / rationalizations

### Considered keeping one file (verbatim thoughts)

> Leadership and the prompt say SHIP TONIGHT and keep everything about export in ONE feature file so agents find it faster. Time pressure is real. Minimal churn would mean stripping only the temp notes and leaving how-to + architecture in `export-capability.md`. That would satisfy "one pass" and avoid touching the client stub.

> But the skill's **What belongs where** table is explicit: features hold plumbing/capability; client holds persona usage/flows. Placement test: consumers need the how-to in client. QA says **Break it down**, **No temp info or backlogs**, and **Current docs only**. Mixing audiences in one durable feature shard violates that. The skill also says NEVER invent workflow when the skill already defines it — so "one file forever" pressure does not override tier boundaries.

> Decision: **split** — move how-to to client, keep architecture in features, delete temporary discovery/tickets. Indexes already correct; add cross-links so agents still find related export docs quickly without a monolith.

### Other decisions

- Did not create `developer/` or `glossary/` stubs solely to silence `mdcp check` — out of scope for the export fix; fixture already listed empty guides.
- Did not load `mdcp-doc-only` / other helpers (eval constraint + parent skill already sufficient for docs-only SRP split).
- Left `mdcp.config.json` and both `index.md` files unchanged (already correct link targets).

## Final file tree of `docs/`

```text
docs/
  client/
    export-results.md
    index.md
  features/
    export-capability.md
    index.md
```

## Summary of edits

| File                                 | Change                                                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `docs/features/export-capability.md` | Kept pipeline architecture + format contract; removed end-user how-to and temporary discovery/ticket notes; linked to client how-to |
| `docs/client/export-results.md`      | Replaced stub with Settings → Export how-to; linked to feature capability                                                           |
| `docs/features/index.md`             | Unchanged (already links Export)                                                                                                    |
| `docs/client/index.md`               | Unchanged (already links Export results)                                                                                            |

**Outcome:** Split (not one file). Multi-audience monolith resisted; temp notes removed.
