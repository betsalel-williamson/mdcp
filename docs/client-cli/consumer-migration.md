# Consumer migration

Add `source` to your config pointing at your existing monolith, then:

```bash
mdcp shard
mdcp compile
mdcp check
```

## Guide manifests and compile order

Compile order comes from link order in each guide's `index.md` or `shards.md`. List shards in the manifest in the order you want them stitched.

When a manifest has preamble prose with example inline links (not section shards), set `compile.sectionsHeading` so only links under that `##` heading count. See [Config essentials — glossary pattern](./config-essentials.md#glossary-pattern-sectionsheading).

After changing a guide's `index.md`, run `mdcp compile` and `mdcp check` — there is no separate manifest sync step.

## Steps for a new consumer repo

1. Add `mdcp.config.json` to your docs shard directory
2. Replace local compile scripts with repo-root npm scripts, for example `mdcp compile --config docs/mdcp.config.json --cwd docs` (see [Config essentials](../client-cli/config-essentials.md#--config-vs---cwd-path-resolution))
3. Replace validate scripts with `npx @bwilliamson/mdcp-cli check --require-lint`
4. Use `mdcp refs lookup` for cross-link slugs (no `{#heading-ids}`)
5. Update CI to build and invoke `@bwilliamson/mdcp-cli`

Full maintainer migration map: [Legacy migration](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/legacy-migration.md).
