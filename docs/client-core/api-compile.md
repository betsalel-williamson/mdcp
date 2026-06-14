# API — Compile

| Export                                            | Purpose                                               |
| ------------------------------------------------- | ----------------------------------------------------- |
| `compileGuides`, `compileGuideResults`            | Stitch shards into monolith text                      |
| `writeCompiledGuides`                             | Write monolith and publish outputs to disk            |
| `sectionFiles`, `processSection`, `assembleGuide` | Lower-level assemble pipeline                         |
| `demoteHeadings`, `stripAboutThisGuideHeading`, … | Heading transforms                                    |
| `registerCompileHook`, `applyCompileHooks`        | Extension hooks (`stripAnchors`, `inlineDiagrams`, …) |

`compileGuides` returns monolith text only — guides with `compile.outputFile` are excluded. `writeCompiledGuides` writes both the monolith and any publish targets.
