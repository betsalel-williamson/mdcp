# Compile hooks

Register custom per-shard transforms:

```typescript
import { registerCompileHook } from '@bwilliamson/mdcp-core';

registerCompileHook('myHook', (ctx) => {
  return ctx.body.replace(/TODO/g, 'DONE');
});
```

Built-in hook names are configured in `mdcp.config.json` under `guides[].compile.hooks`:

- **`stripAnchors`** — removes explicit `{#anchor}` markers per shard
- **`codeEvidence`** — rewrites Evidence / source-file links to `#L` fragments
- **`inlineInserts`** — inlines captioned insert shards (diagrams, tables, figures, media) from shared libraries
- **`reviewLinks`** — rewrites finding and cross-guide links for monolith cohesion (`hooksConfig.reviewLinks.targetMonolith`)

Optional hook config under `guides[].compile.hooksConfig`. For manifest compile order and `compile.sectionsHeading`, see [Manifest compile order](../features/manifest-compile-order.md).

## inlineInserts

Specification for the `inlineInserts` compile hook. Tests in `packages/mdcp-core/test/inline-inserts.test.ts` map to the sections below (docs first, then TDD).

### Purpose

Guides link to **captioned insert shards** (`.md` files) in typed libraries under the docs root. Shard bodies may be markdown tables, prose, or **media embeds** (images, video, audio). At compile time, the hook:

1. Inlines insert markdown at the **first** link (per guide, per file)
2. Adds a numbered **`####` heading** (GFM only — no HTML, no directives)
3. Rewrites **later** links to the same file as markdown back-links (`[label](#slug)`)

### Layout

One library directory per insert type (library-science convention):

```text
docs/
  diagrams/              # flow charts, sequence diagrams (markdown tables or images)
  tables/                # reference tables, comparison matrices
  figures/               # screenshots, static diagrams
  media/                 # video, audio, and other captioned media embeds
  inserts/               # optional generic captioned blocks
  review/
    insert-catalog.md    # links to ../diagrams/…, ../tables/…, ../figures/…, ../media/…
```

Link targets are always `.md` insert shards. Put binary assets alongside the shard (or under the same library) and reference them from the shard body — for example `![Overview](./component-map.png)` or an HTML `<video>` / `<audio>` block when your renderer supports it.

Shards link with normal markdown — no `<!-- directives -->`.

### Link matching

A link is an insert reference when **all** of the following hold:

- Standard markdown link syntax: `[label](path)`
- Target path contains `diagram`, `diagrams`, `table`, `tables`, `figure`, `figures`, `media`, `insert`, or `inserts`
- Target ends in `.md` (optional `#fragment` suffix is ignored for file lookup)
- Target is not `http://` or `https://`

### Exclusions

The hook **does not** transform:

- Regular shard links (for example `./intro.md`, `../glossary/term.md`)
- Direct links to binary assets (for example `../figures/architecture.png`, `../figures/demo.mp4`) — use a captioned `.md` insert shard that embeds the media instead
- External URLs, even when the path contains `diagrams/`
- Links to missing insert files (left unchanged)
- Body text when `inlineInserts` is not in `compile.hooks`

### First inline (GFM headings)

The first reference to an insert file (document order across all shards in the guide) is replaced with:

```markdown
#### {Kind} {n}. {caption}

{insert shard body — tables, prose, images, video, audio, …}
```

- **Kind** — `Diagram`, `Table`, `Figure`, `Media`, or `Insert` (from parent library directory)
- **n** — serial number for that kind in this guide (see **Numbered captions** below)
- **caption** — link label, or a humanized basename when the label is empty
- **Anchor slug** — GitHub-style slug of the full heading (for example `Table 1. Status codes` → `#table-1-status-codes`)

Output uses GFM headings and back-links for captions. Inlined shard bodies pass through as written (markdown tables, `![images](…)`, or HTML `<video>` / `<audio>` when your renderer supports them).

### Numbered captions

Serial counters are **per insert kind** and **per guide compile**:

| Kind    | First inline heading example   | Second inline (same kind) |
| ------- | ------------------------------ | ------------------------- |
| diagram | `#### Diagram 1. Request flow` | `#### Diagram 2. …`       |
| table   | `#### Table 1. Status codes`   | `#### Table 2. …`         |
| figure  | `#### Figure 1. Component map` | `#### Figure 2. …`        |
| media   | `#### Media 1. Walkthrough`    | `#### Media 2. …`         |

Rules:

- Diagram and table counters are independent (`Diagram 1` then `Table 1` then `Diagram 2` is valid)
- Counters continue across shards via shared per-guide hook state
- Each guide starts at 1 for each kind (two guides sharing one insert file each get their own `Diagram 1`)
- Repeat links to an **already inlined file** do not consume a new number (back-link only)

### Deduplication

Within one guide:

- First link to `../diagrams/flow.md` → inline under numbered heading
- Later links to the same resolved file (any path spelling, with or without `#fragment`) → `[label](#diagram-1-…)`
- Same basename in different libraries (`diagrams/overview.md` vs `tables/overview.md`) → separate headings and anchors

### Path resolution

Lookup order for insert shard paths:

1. Relative to the current shard directory
2. Relative to the shard parent directory
3. `process.cwd()` and its parent
4. Optional `hooksConfig.inlineInserts.searchRoots`

### Config

```json
{
  "name": "architecture-review",
  "compile": {
    "hooks": ["stripAnchors", "inlineInserts", "reviewLinks"],
    "hooksConfig": {
      "inlineInserts": { "searchRoots": ["diagrams"] }
    }
  }
}
```

### Compile output example

Shard input:

```markdown
| Insert                                      | Summary     |
| ------------------------------------------- | ----------- |
| [Request flow](../diagrams/request-flow.md) | Client path |

See [Request flow](../diagrams/request-flow.md) again in prose.
```

Compiled fragment (first guide mention):

```markdown
| Insert | Summary |
| ------ | ------- |

|

#### Diagram 1. Request flow

| Step | Actor  |
| ---- | ------ |
| 1    | Client |

| Client path |

See [Request flow](#diagram-1-request-flow) again in prose.
```

Example fixture: [`examples/sample-guides/inserts-demo/`](https://github.com/betsalel-williamson/mdcp/tree/main/examples/sample-guides/inserts-demo).

**Figure with embedded image** — shard `figures/component-map.md`:

```markdown
![Component map overview](./component-map.png)
```

Catalog link `[Component map](../figures/component-map.md)` compiles to a numbered `#### Figure 1. …` heading followed by that image markdown.

**Media with embedded video** — shard `media/walkthrough.md`:

```markdown
<video src="./walkthrough.mp4" controls></video>
```

Catalog link `[Walkthrough](../media/walkthrough.md)` compiles to `#### Media 1. Walkthrough` followed by the video embed.

Details in the [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md).
