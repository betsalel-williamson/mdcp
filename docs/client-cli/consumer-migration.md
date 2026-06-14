# Consumer migration

Add `source` to your config pointing at your existing monolith, then:

```bash
mdcp shard
mdcp compile
mdcp check
```

## Upgrading to v0.1.6+ (sections.txt removed)

**Breaking:** `sections.txt` and `mdcp sections` are removed. Compile order is read from each guide's `index.md` or `shards.md` link order.

1. **Delete** every `sections.txt` under guide directories.
2. **Ensure** each guide's manifest lists shards in compile order (bullet list or TOC links).
3. **Add** `compile.sectionsHeading` when the manifest has preamble inline links that are not section shards. Example — glossary with policy prose before `## Sections`:

```json
{
  "name": "glossary",
  "path": "glossary",
  "compile": {
    "title": "Compound glossary",
    "sectionsHeading": "Sections",
    "outputFile": "_build/compiled/glossary.md"
  }
}
```

Then:

1. Remove `mdcp sections` from npm scripts and agent prompts.
2. Run `mdcp compile` and `mdcp check` — no separate sync step after editing `index.md`.

## Steps for a new consumer repo

1. Add `mdcp.config.json` to your docs shard directory
2. Replace local compile scripts with repo-root npm scripts, for example `mdcp compile --config docs/mdcp.config.json --cwd docs` (see [Config essentials](../client-cli/config-essentials.md#--config-vs---cwd-path-resolution))
3. Replace validate scripts with `npx @bwilliamson/mdcp-cli check --require-lint`
4. Use `mdcp refs lookup` for cross-link slugs (no `{#heading-ids}`)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

Full maintainer migration map: [Legacy migration](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/legacy-migration.md).
