# Manifest compile order

Each guide's **compile order** comes from markdown links in its manifest file — `index.md` by default, or `shards.md` when configured under `guides[].compile.manifest`. mdcp collects every link to a `.md` file in **document order** and stitches those shards in that sequence.

Guide directories are **human source only** (`index.md`, shard files). Generated outputs (per-guide `{name}.md`, optional monolith, `.caches/refs.json`, explicit `compile.outputFile`) live under `outputDir`.

## Default behavior

A minimal manifest is a table of contents — only section links, no stray `.md` links in preamble prose:

```markdown
# Admin guide

- [Getting started](./chapter-1-getting-started.md)
```

Compile order: `chapter-1-getting-started.md` first (and only). No extra config needed.

## When manifests mix policy prose and section lists

Some guides use `index.md` as both **policy prose** (how authors should work) and **section manifest** (ordered shard list). A common pattern:

```markdown
# Compound glossary

## Acronyms and new terms

When you introduce an acronym… spell out the term and link it — e.g.
Content-Security-Policy ([CSP](04-security-sync.md#glossary-csp)).

## Sections

- [Product surfaces](01-product-surfaces.md)
- [Tenancy](02-tenancy.md)
- [Data model](03-data-model.md)
- [Security and sync](04-security-sync.md)
- [Review vocabulary](05-review-vocabulary.md)
```

### Without `sectionsHeading`

mdcp collects **all** `.md` links in file order:

| Order | Link                     | Author intent                                  |
| ----- | ------------------------ | ---------------------------------------------- |
| 1     | `04-security-sync.md`    | Example in policy prose — "link CSP like this" |
| 2     | `01-product-surfaces.md` | Section shard                                  |
| 3     | `02-tenancy.md`          | Section shard                                  |
| …     | …                        | …                                              |

Compile stitches `04-security-sync.md` **first**, then `01`, `02`, … — wrong order. The CSP link is documentation, not a directive to lead with that shard.

### With `sectionsHeading`

Set `guides[].compile.sectionsHeading` to the `##` heading that starts the real section list (without the `#` marks):

```json
{
  "name": "glossary",
  "path": "glossary",
  "compile": {
    "title": "Compound glossary",
    "sectionsHeading": "Sections",
    "outputFile": "glossary.md"
  }
}
```

mdcp only considers links **at or after** `## Sections`. Preamble example links are ignored for compile order. Order becomes `01` → `02` → `03` → `04` → `05`.

`04-security-sync.md` still compiles because it appears under `## Sections`, not because it is mentioned in the policy paragraph.

## When you need `sectionsHeading`

| Situation                                                                                                                        | `sectionsHeading`            |
| -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Manifest is a TOC — every `.md` link is a section                                                                                | Omit                         |
| `shards.md` lists cross-tree shards only (review monoliths)                                                                      | Usually omit                 |
| Preamble has inline `.md` links that are examples or cross-references, plus a separate ordered section list under a `##` heading | **Set** to that heading text |

The heading match is exact: `sectionsHeading` `"Sections"` matches a line that starts with `##` followed by `Sections`, not `## Section list`.

## Workflow

1. Edit shard files and `index.md` link order as needed.
2. Run `mdcp compile` — there is no separate manifest sync step.
3. Run `mdcp check` — orphan validation uses the same manifest rules as compile.

Config field and example: [Config essentials — `sectionsHeading`](../client-cli/config-essentials.md#sectionsheading). Implementation: `manifestTextForSections` and `sectionFiles` in `packages/mdcp-core/src/compile/assemble.ts`.
