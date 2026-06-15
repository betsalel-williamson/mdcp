---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
'@bwilliamson/mdcp-presets': patch
---

Document preprocessor and templating as intentionally out of scope.

MDCP does not run variable substitution, template engines, or macro-style transforms on shard source. Compile hooks remain documentation-assembly transforms on [authored GFM](https://github.com/betsalel-williamson/mdcp/blob/main/docs/glossary/index.md#gfm) — not a substitute for Handlebars, Nunjucks, or similar.

**Consumer guidance:** wire optional stages as `preprocess → mdcp compile / check → postprocess` in your repo. There is no behavior change to compile or hooks; this release clarifies boundaries that were previously implicit.
