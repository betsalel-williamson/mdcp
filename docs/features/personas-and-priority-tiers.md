# Personas and priority tiers

mdcp splits, compiles, validates, and exports sharded Markdown for repos where **LLMs help write docs**, **humans review them**, and **compiled output serves feature work and end-user guides**.

## Personas

| Persona                | Job                                   | Features                                       |
| ---------------------- | ------------------------------------- | ---------------------------------------------- |
| **LLM doc author**     | Edit shards, insert cross-links       | `shard`, `refs lookup`, `compile`, `check`     |
| **LLM feature agent**  | Read compact doc context while coding | `export --llm`, `refs list`, compiled monolith |
| **Human doc reviewer** | PR quality gate                       | `check`, `prose`, `lint`, `xrefs`, `links`     |
| **End-user reader**    | Read glossary, guides, reviews        | `compile` output                               |

## P0 — LLM can read docs and write correct links

| Feature       | CLI                 | Core module          | Status      |
| ------------- | ------------------- | -------------------- | ----------- |
| Compile       | `mdcp compile`      | `compile/`           | Implemented |
| Refs + lookup | `mdcp refs *`       | `refs/`              | Implemented |
| LLM export    | `mdcp export --llm` | `export/llm.ts`      | Implemented |
| Check (core)  | `mdcp check`        | orphans, refs, xrefs | Implemented |

**Dogfood:** `mdcp export --llm` + `mdcp refs lookup` + `mdcp check` on `docs/` and `examples/sample-guides`.

## P1 — LLM can write docs in shards safely

| Feature             | CLI            | Core module           | Status      |
| ------------------- | -------------- | --------------------- | ----------- |
| Manifest link order | `mdcp compile` | `compile/assemble.ts` | Implemented |
| Shard split         | `mdcp shard`   | `shard/`              | Implemented |
| Orphan check        | `mdcp check`   | `validate/orphans.ts` | Implemented |
| Xref lint           | `mdcp check`   | `xrefs/lint.ts`       | Implemented |

**Dogfood:** Edit a shard under `docs/features/` or `docs/developer/` → `mdcp check`.

## P2 — Human reviewers trust the output

| Feature       | CLI                                  | Core module        | Status                       |
| ------------- | ------------------------------------ | ------------------ | ---------------------------- |
| Peer linters  | `mdcp lint`, `prose`, `links`, `fix` | `peers/`           | Implemented                  |
| Compile hooks | config `compile.hooks`               | `compile/hooks.ts` | Implemented (built-in hooks) |

**Dogfood:** `pnpm docs:check` (markdownlint + Vale on `PATH`).

## P3 — Enabler

| Feature | Role                                             |
| ------- | ------------------------------------------------ |
| Config  | `mdcp.config.json` wires all commands            |
| Presets | `@bwilliamson/mdcp-presets` starter lint configs |
