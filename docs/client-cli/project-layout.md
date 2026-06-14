# Project layout

| Piece                                            | Role                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------- |
| Guide directory (`overview/`, `admin-guide/`, …) | One logical guide                                                           |
| `index.md`                                       | Human table of contents — links to shard files                              |
| `sections.txt`                                   | Machine compile order — **guide-relative** filenames (from `mdcp sections`) |
| `chapter-*.md` (typical)                         | One topic or chapter per file — naming is conventional, not required        |
| `about-this-guide.md`                            | Optional preamble shard                                                     |
| `guides.md`                                      | Compiled monolith (generated — do not edit by hand)                         |
| `refs.json`                                      | Section link lookup table (written by `mdcp check` or `mdcp refs gen`)      |

Shards use `#` headings so each file reads well on its own. During compile, mdcp demotes headings under the guide title in the monolith.

`sections.txt` lists shard paths **relative to the guide directory** (for example `introduction.md`). Never commit absolute machine paths.

Guides can also set `compile.outputFile` to publish a standalone document (for example an npm `README.md`) excluded from the monolith.
