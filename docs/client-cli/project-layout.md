# Project layout

| Piece                                            | Role                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| Guide directory (`overview/`, `admin-guide/`, …) | One logical guide                                                      |
| `index.md` (or `shards.md`)                      | Human table of contents — **compile order** comes from link order here |
| `chapter-*.md` (typical)                         | One topic or chapter per file — naming is conventional, not required   |
| `about-this-guide.md`                            | Optional preamble shard                                                |
| `guides.md`                                      | Compiled monolith (generated — do not edit by hand)                    |
| `refs.json`                                      | Section link lookup table (written by `mdcp check` or `mdcp refs gen`) |

Shards use `#` headings so each file reads well on its own. During compile, mdcp demotes headings under the guide title in the monolith.

**Guide directories are human source only.** Generated outputs (`guides.md`, `refs.json`, per-guide `compile.outputFile`) live under `outputDir` (for example `_build/compiled/`).

When a manifest has preamble prose with example links (not section shards), set `compile.sectionsHeading` (for example `"Sections"`) so only links under that `##` heading count toward compile order.

Guides can also set `compile.outputFile` to publish a standalone document (for example an npm `README.md`) excluded from the monolith.
