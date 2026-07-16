# API — Compile

| Export                                            | Purpose                                              |
| ------------------------------------------------- | ---------------------------------------------------- |
| `compileGuides`, `compileGuideResults`            | Stitch shards into monolith text                     |
| `writeCompiledGuides`                             | Write monolith and publish outputs to disk           |
| `writeOutputFile`, `resolveBackupPath`            | Opt-in backup before overwrite; backup path resolver |
| `resolveBackupOptions`                            | Merge config and CLI backup settings                 |
| `WriteOutputBackupOptions`                        | Backup options type                                  |
| `sectionFiles`, `processSection`, `assembleGuide` | Lower-level assemble pipeline                        |
| `formatCompileTitle`, `extractFirstHeading`, …    | Optional `compile.title` injection and deduplication |
| `demoteHeadings`, `stripAboutThisGuideHeading`, … | Heading transforms                                   |
| `registerCompileHook`, `applyCompileHooks`        | Extension hooks (`stripAnchors`, `inlineInserts`, …) |

`compileGuides` returns monolith text only — guides with `compile.outputFile` are excluded. `writeCompiledGuides` writes both the monolith and any publish targets.

`writeOutputFile` writes compile targets. Default: overwrite. When `backup.enabled` is true, moves an existing file to `{outputDir}/{backupDir}/{docsRoot-relative-key}{ext}` before writing. Pass `backup` on `CompileOptions` or resolve via `resolveBackupOptions(config, cliOverrides)`.

When `compile.title` is set, `assembleGuide` injects a `##` heading followed by a blank line before the first section. See [API — Config](./api-config.md) for per-guide compile fields and top-level `backup` config.

Full spec: [Compile output backup](../features/compile-output-backup.md).
