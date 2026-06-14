# Commands reference

## Daily workflow

```bash
# Regenerate the monolith from shards
mdcp compile

# Full validation gate (orphans → compile → refs → xrefs; optional linters)
mdcp check

# Regenerate sections.txt after changing a guide's index.md
mdcp sections
```

## Command summary

| Command                    | When you need it                                                     |
| -------------------------- | -------------------------------------------------------------------- |
| `mdcp compile`             | Regenerate the monolith from shards                                  |
| `mdcp check`               | Full gate: orphans → compile → refs → xrefs; optional peer linters   |
| `mdcp shard`               | Split a monolith into shards (requires `config.source`)              |
| `mdcp sections`            | Regenerate `sections.txt` after changing a guide's `index.md`        |
| `mdcp refs list`           | List heading slugs from `refs.json` as JSON                          |
| `mdcp refs lookup <query>` | Search compiled section titles while writing cross-links             |
| `mdcp export --llm`        | Token-stripped compiled output for LLM context                       |
| `mdcp lint`                | markdownlint-cli2 on shards and compiled output (peer, if installed) |
| `mdcp prose`               | Vale prose lint (peer, if installed)                                 |
| `mdcp links`               | markdown-link-check on compiled output (peer, if installed)          |
| `mdcp fix`                 | Prettier + markdownlint `--fix` (install peers in host repo first)   |

## Refs subcommands

| Command                    | Purpose                                                                    |
| -------------------------- | -------------------------------------------------------------------------- |
| `mdcp refs gen`            | Generate `refs.json` from compiled output                                  |
| `mdcp refs check`          | Verify `refs.json` matches compiled output                                 |
| `mdcp refs list`           | List heading slugs from `refs.json` (run `mdcp check` or `refs gen` first) |
| `mdcp refs lookup <query>` | Fuzzy-search titles from freshly compiled output                           |

## LLM and agent context

```bash
# Token-stripped compiled output for coding agents
mdcp export --llm --stdout

# Find section links while authoring
mdcp refs lookup "authentication" --format json
```
