# ignoreGuides

Guide names listed on the **compiling** guide under `compile.crossGuideLinks.ignoreGuides`. Cross-guide links to those guides keep source shard `.md` paths instead of rewriting to monolith `#slug` targets. Does not exclude the guide from `compileOrder` or the link index — only skips link rewrite for those targets. On publish outputs, [publish-relative rewrite](../client-core/compile-hooks/publish-relative-links.md) still rebases the shard path for the publish file. Read [Cross-guide link rewriting](../client-core/compile-hooks/cross-guide-links.md).
