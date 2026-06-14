# API — Compile

| Export                                            | Purpose                                               |
| ------------------------------------------------- | ----------------------------------------------------- |
| `compileGuides`, `compileGuideResults`            | Stitch shards into monolith text                      |
| `writeCompiledGuides`                             | Write monolith and publish outputs to disk            |
| `sectionFiles`, `processSection`, `assembleGuide` | Lower-level assemble pipeline                         |
| `formatCompileTitle`, `extractFirstHeading`, …    | Optional `compile.title` injection and deduplication  |
| `demoteHeadings`, `stripAboutThisGuideHeading`, … | Heading transforms                                    |
| `registerCompileHook`, `applyCompileHooks`        | Extension hooks (`stripAnchors`, `inlineDiagrams`, …) |

`compileGuides` returns monolith text only — guides with `compile.outputFile` are excluded. `writeCompiledGuides` writes both the monolith and any publish targets.

When `compile.title` is set, `assembleGuide` injects a `##` heading followed by a blank line before the first section. See [API — Config](./api-config.md) for per-guide compile fields.
