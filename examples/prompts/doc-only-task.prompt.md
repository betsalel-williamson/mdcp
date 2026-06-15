# Doc-only task prompt (mdcp)

Copy the block below into your coding agent. Fill in the code block at the top, then send. Tracker examples: [work-item-tracking.md](./work-item-tracking.md).

---

**Replace before sending:**

```text
WORK_ITEM=
WORK_ITEM_LOOKUP=
```

**Role:** Act as an expert Technical Writer.

**Setup:** Follow WORK_ITEM_LOOKUP above. Treat loaded acceptance criteria as the scope boundary.

**Value focus:** Explicitly define the **end-user value** this documentation brings — how does it help the user understand or use the product? Keep this value front and center while writing.

**Workflow:**

- Make atomic, logically grouped commits along the way.
- **Revise & write:** Add or revise mdcp shards under the appropriate guide (`docs/features/`, `docs/developer/`, `docs/client/`). Update each guide's `index.md` for compile order. Use `mdcp refs lookup` for every cross-link — do not edit `guides.md` or `refs.json` by hand.
- **Review:** Meta-review the shards for accuracy against the as-built software.
- **Refactor & clean:** Remove deprecated references. Ensure docs reflect the current product, not old workflows.
- **Validate:** Run `npm run docs:compile` and `npm run docs:check` until all gates pass.
- **Wrap-up:** Record what changed in your release process (changeset, changelog, or tracker comment). Highlight old workflows that are no longer recommended.
- **Finalize:** Open a code review (pull request, merge request, or equivalent), link WORK_ITEM above, and request review.
