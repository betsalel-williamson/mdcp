# coverage

Documentation coverage is the set of markdown files MDCP can account for — the **captured** set. A file is captured when it is a shard of a compiled guide, a guide output target (`compile.outputFile`), or a [standalone guide](#standalone-guide).

The coverage scan walks the repository for markdown files, skips vendored paths, and reports any file that is not captured so authors either fold it into a guide or register it in `standaloneGuides[]`.

See [Documentation coverage scan](../features/coverage-scan.md).
