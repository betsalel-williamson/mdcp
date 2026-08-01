# Commands reference

## Global options

Every command accepts:

| Option                | Default            | Purpose                                                                          |
| --------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `-c, --config <path>` | `mdcp.config.json` | Config file path, resolved from the **invocation directory** (not `--docs-root`) |
| `--docs-root <path>`  | current directory  | Docs root — one subdirectory per guide shard tree                                |
| `--warn-broken-links` | off                | Report broken internal links but exit 0 (overrides `lint.links.severity`)        |

**Repo-root npm scripts** typically use both flags:

```bash
mdcp compile --config docs/mdcp.config.json --docs-root docs
```

`--config` locates the file from where the command runs; `--docs-root` sets the shard tree root. These bases are independent — see [Config essentials](./config-essentials.md#--config-vs---docs-root).

## Daily workflow

```bash
# Regenerate the monolith from shards (link order from each guide's index.md / shards.md)
mdcp compile

# Full validation gate (orphans → compile → refs → links; optional peer linters)
mdcp check
```

`mdcp compile` and `mdcp check` exit **1** when broken internal links are found (default). Use `--warn-broken-links` to surface `link-warn:` diagnostics without failing CI. See [Link validation](../features/link-validation.md).

When `mdcp check` fails after continuing through peer linters, it prints a stderr **failure summary** (which steps failed and how to fix them) so CI logs are not only peer “0 errors” lines plus a bare exit code.

## Command summary

| Command          | When you need it                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| `mdcp compile`   | Regenerate compiled outputs and `refs.json` under `outputDir` (exits 1 on broken links by default) |
| `mdcp check`     | Full gate: orphans → compile → refs → links; optional peer linters; non-fatal coverage report      |
| `mdcp shard`     | Split a monolith into shards (requires `config.source`)                                            |
| `mdcp refs-list` | List heading slugs from `refs.json` as JSON                                                        |
| `mdcp lint`      | markdownlint-cli2 on shards and compiled output (peer, if installed)                               |
| `mdcp prose`     | Vale prose lint (peer, if installed)                                                               |
| `mdcp links`     | markdown-link-check on compiled output (peer, if installed)                                        |
| `mdcp fix`       | Prettier + markdownlint `--fix` (install peers in host repo first)                                 |

## Refs subcommands

| Command           | Purpose                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| `mdcp refs gen`   | Generate `refs.json` from compiled output                                  |
| `mdcp refs check` | Verify `refs.json` matches compiled output                                 |
| `mdcp refs-list`  | List heading slugs from `refs.json` (run `mdcp check` or `refs gen` first) |

Discover shards with host search (`rg`, IDE search). Validate fragment links with `mdcp check`; use `mdcp refs-list` when you need to inspect registry slugs.

## Agent context

```bash
# Full structural gate (includes refs + link validation)
mdcp check

# Optional: inspect registry headings after compile or check
mdcp refs list
```

Discover shards with host search, then read **one** file. Prefer that over pasting a full compiled monolith.
