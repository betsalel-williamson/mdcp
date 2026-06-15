# Fork criteria

Vendor fork into `packages/markdown-tree` when:

1. `assemble` needs heading-transform hooks
2. `explode` must preserve preamble without synthetic H2 promotion
3. Upstream is unresponsive or breaking

Until fork: depend on md-tree for **split only**; never upstream `assemble`.
