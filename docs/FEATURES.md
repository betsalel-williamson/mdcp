# MDCP feature catalog

mdcp splits, compiles, validates, and exports sharded Markdown for repos where **LLMs help write docs**, **humans review them**, and **compiled output serves feature work and end-user guides**.

## Personas

| Persona                | Job                                   | Features                                               |
| ---------------------- | ------------------------------------- | ------------------------------------------------------ |
| **LLM doc author**     | Edit shards, insert cross-links       | `shard`, `sections`, `refs lookup`, `compile`, `check` |
| **LLM feature agent**  | Read compact doc context while coding | `export --llm`, `refs list`, compiled monolith         |
| **Human doc reviewer** | PR quality gate                       | `check`, `prose`, `lint`, `xrefs`, `links`             |
| **End-user reader**    | Read glossary, guides, reviews        | `compile` output                                       |

## Priority tiers

### P0 — LLM can read docs and write correct links

| Feature       | CLI                 | Core module          | Status      |
| ------------- | ------------------- | -------------------- | ----------- |
| Compile       | `mdcp compile`      | `compile/`           | Implemented |
| Refs + lookup | `mdcp refs *`       | `refs/`              | Implemented |
| LLM export    | `mdcp export --llm` | `export/llm.ts`      | Implemented |
| Check (core)  | `mdcp check`        | orphans, refs, xrefs | Implemented |

**Dogfood:** `mdcp export --llm` + `mdcp refs lookup` + `mdcp check` on `examples/sample-guides`.

### P1 — LLM can write docs in shards safely

| Feature           | CLI             | Core module           | Status      |
| ----------------- | --------------- | --------------------- | ----------- |
| Sections manifest | `mdcp sections` | `manifest/`           | Implemented |
| Shard split       | `mdcp shard`    | `shard/`              | Implemented |
| Orphan check      | `mdcp check`    | `validate/orphans.ts` | Implemented |
| Xref lint         | `mdcp check`    | `xrefs/lint.ts`       | Implemented |

**Dogfood:** Edit sample guide shard → `mdcp sections` → `mdcp check` in `examples/sample-guides`.

### P2 — Human reviewers trust the output

| Feature       | CLI                                  | Core module        | Status          |
| ------------- | ------------------------------------ | ------------------ | --------------- |
| Peer linters  | `mdcp lint`, `prose`, `links`, `fix` | `peers/`           | Implemented     |
| Compile hooks | config `compile.hooks`               | `compile/hooks.ts` | Extension point |

**Dogfood:** `pnpm docs:check` on `examples/sample-guides` (markdownlint + Vale via root devDependencies).

### P3 — Enabler

| Feature | Role                                  |
| ------- | ------------------------------------- |
| Config  | `mdcp.config.json` wires all commands |
| Presets | `@mdcp/presets` starter lint configs  |

---

## Feature details

### Compile (P0.1)

Stitch shard directories into canonical monolith(s). Demotes headings, strips `about-this-guide` preamble, optional per-guide titles and outputs.

```bash
mdcp compile --config mdcp.config.json --cwd .
```

### Refs + lookup (P0.2)

GitHub slugs from compiled output. Agents query headings while writing links.

```bash
mdcp refs lookup "authentication" --format json
```

### LLM export (P0.3)

Token-stripped context for agents.

```bash
mdcp export --llm --stdout --config mdcp.config.json
```

### Check gate (P0.4)

Structural validation: orphans → compile → refs → xrefs; peer linters optional.

```bash
mdcp check --require-lint
```

### Sections manifest (P1.1)

Regenerate `sections.txt` from index link order.

```bash
mdcp sections
```

### Shard split (P1.2)

Split monolith into shards via md-tree.

```bash
mdcp shard   # requires config.source
```

### Orphan check (P1.3)

Detect shards not in manifest or missing files.

### Xref lint (P1.4)

Fail on bare `Ch. N`, unlinked `See Chapter N`.

### Peer linters (P2.1)

Orchestrate markdownlint-cli2, Vale, Prettier, markdown-link-check from host repo.

### Compile hooks (P2.2)

Per-shard transforms: `stripAnchors`, `codeEvidence`, `reviewLinks`, `inlineDiagrams`.

---

## Agent integration (consumer repo)

```json
{
  "scripts": {
    "docs:context": "mdcp export --llm --stdout --config docs/mdcp.config.json",
    "docs:refs": "mdcp refs lookup",
    "docs:check:mdcp": "mdcp check --config docs/mdcp.config.json --require-lint"
  }
}
```

## Design constraints

- GFM only — no Pandoc, no required `{#heading-ids}`
- md-tree for split only — custom compile
- Peer linters opt-in — `--require-lint` / `--require-vale` in CI

See [design.md](./design.md) and [PHASE2-MIGRATION.md](./PHASE2-MIGRATION.md).
