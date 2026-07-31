---
'@bwilliamson/mdcp-core': minor
'@bwilliamson/mdcp-cli': patch
---

Group US-English opinionated lint/prose helpers behind a locale-pack boundary (`locale/en-US`), separate from GFM structural helpers — following Vale’s multi-language docs model (shared markup engine + language-specific style packages via glob sections, plus locale-named dictionaries) so additional languages can plug in later without forking markdown parsers.
