# API — Config

| Export                                                                                 | Purpose                              |
| -------------------------------------------------------------------------------------- | ------------------------------------ |
| `loadConfig(path, cwd)`                                                                | Load and validate `mdcp.config.json` |
| `resolveOutputPath`, `resolveGuidesRoot`, `resolveGuideDir`                            | Resolve paths from config            |
| `getGuideConfig`, `xrefScanDirs`                                                       | Per-guide and xref scan helpers      |
| `MdcpConfigSchema`, `MdcpConfig`, `MdcpConfigInput`, `GuideConfig`, `GuideConfigInput` | Zod schema and types                 |

Per-guide `compile.outputFile` writes a publish target and excludes that guide from the monolith. `compile.includeBanner` controls whether the global banner is prepended (defaults to `false` when `outputFile` is set).

`compile.publishPathRewrite` optionally rewrites shard-relative repo paths in publish outputs (for example `../../package.json` → `package.json` and `../features/foo.md` → `docs/features/foo.md`). Intra-guide `./section.md` links are rewritten to in-document `#anchor` links on **every** compile, including monolith output.
