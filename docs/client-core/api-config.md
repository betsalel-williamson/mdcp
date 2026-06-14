# API — Config

| Export                                                      | Purpose                              |
| ----------------------------------------------------------- | ------------------------------------ |
| `loadConfig(path, cwd)`                                     | Load and validate `mdcp.config.json` |
| `resolveOutputPath`, `resolveGuidesRoot`, `resolveGuideDir` | Resolve paths from config            |
| `getGuideConfig`, `xrefScanDirs`                            | Per-guide and xref scan helpers      |
| `MdcpConfigSchema`, `MdcpConfig`, `GuideConfig`             | Zod schema and types                 |

Per-guide `compile.outputFile` writes a publish target and excludes that guide from the monolith. `compile.includeBanner` controls whether the global banner is prepended (defaults to `false` when `outputFile` is set).
