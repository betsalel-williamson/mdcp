# md-tree integration

MDCP uses `@kayvan/markdown-tree-parser` for **split only** (`extract-all`, `explode`).

Upstream `assemble` is **not used** — it does not support:

- Per-section heading demotion (shard `#` → compiled `##`)
- Synthetic `about-this-guide` preamble stripping
- Overview coverage second-H1 exception
