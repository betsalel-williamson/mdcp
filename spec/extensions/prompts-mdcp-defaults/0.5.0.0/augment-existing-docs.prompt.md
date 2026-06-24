# Augment existing docs with mdcp

Use after `mdcp init` detects existing documentation.

---

**Goal:** Map MDCP onto the current `docs/` or README layout **without deleting** existing `.md` files.

1. Run `npx @bwilliamson/mdcp-cli init --docs-root docs --mode augment --preset code`
2. Read `docs/extensions/adoption-plan.md` for detected layout and suggested shard splits
3. Edit `mdcp.config.json` only if guide names need adjustment
4. Add glossary shards for shared terms; split monoliths into topic shards listed in each guide `index.md`
5. Run `mdcp compile` and `mdcp check`

Do not move or overwrite user content without explicit confirmation.
