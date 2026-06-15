# Doc-only task prompt (mdcp)

Copy the block below into your agent. Fill in the code block at the top, then send.

---

**Replace before sending:**

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

**Role:** Act as an expert Technical Writer.

**Setup:** Follow WORK_ITEM_LOOKUP above. Inspect the repository for scope, acceptance criteria, validation commands, and delivery conventions before editing. Treat acceptance criteria as the scope boundary.

**Plan:** Outline steps from WORK_ITEM and repo context. Pull only the shards, docs, and code paths needed for this task.

**Value focus:** Explicitly define the **end-user value** this documentation brings — how does it help the user understand or use the product? Keep this value front and center while writing.

**Workflow:**

- Make logically grouped commits per this repo's conventions.
- **Revise & write:** Add or revise mdcp shards under the appropriate guide (`docs/features/`, `docs/developer/`, `docs/client/`). Update each guide's `index.md` for compile order. Use `mdcp refs lookup` for every cross-link — do not edit generated compile output or `refs.json` by hand.
- **Review:** Check shards against the as-built software.
- **Refactor & clean:** Remove deprecated references. Ensure docs reflect the current product, not old workflows.
- **Validate:** Run this repo's documentation validation commands until they pass (discover from developer docs or package scripts).
- **Wrap-up:** Record what changed per this repo's release and communication conventions. Note old workflows that are no longer recommended.
- **Finalize:** Submit work for review and link WORK_ITEM.
