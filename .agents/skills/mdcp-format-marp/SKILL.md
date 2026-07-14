---
name: mdcp-format-marp
description: >-
  Formatting skill for Marp Presentations. Use this skill when the user is
  authoring, compiling, or formatting slide decks and presentations using MDCP
  shards and the Marp (Markdown Presentation Ecosystem) framework. Triggers
  when users mention Marp, slide decks, presentations, or rendering Mermaid
  diagrams for slides.
---

# MDCP Formatting Pack: Marp Presentation

This skill provides guidance and conventions for using MDCP shards to author presentations using [Marp](https://marp.app/) (Markdown Presentation Ecosystem).

## Layout

```text
docs/
  presentations/
    {presentation-name}/
      index.md                    # Guide manifest with Marp frontmatter
      00-intro.md                 # First slide / intro
      01-problem.md               # Subsequent slides
      ...
```

## Marp Frontmatter

Your `index.md` should include the necessary Marp frontmatter to enable presentation mode and set global themes.

```markdown
---
marp: true
theme: default
paginate: true
---

# Presentation Title
```

## Slide Separators

Marp uses `---` to separate slides. When compiling MDCP shards, you can either:

1. Include `---` at the end of each shard.
2. Rely on the `mdcp compile` process to concatenate them, but ensure you manually add `---` where slide breaks are intended.

## Compiling

Configure a guide in your `mdcp.config.json` to compile the presentation shards into a single output file:

```json
{
  "name": "presentation-name",
  "compile": {
    "outputFile": "../../build/presentations/presentation-name.md",
    "includeBanner": false
  }
}
```

After running `mdcp compile`, use the Marp CLI or VS Code extension to export the compiled Markdown file to PDF, HTML, or PPTX.

## Lessons Learned: Diagrams and Mermaid

When creating presentations, you will likely want to include architecture diagrams or flowcharts using Mermaid. However, there are a few caveats when using Marp:

1. **Synchronous Constraints:** Marp uses `markdown-it` under the hood, which is strictly synchronous. Mermaid's modern rendering APIs are asynchronous, meaning you cannot easily render Mermaid blocks to SVGs during the Marp build process without complex workarounds.
2. **Client-Side Glitches:** We previously attempted to use a custom Marp engine to render Mermaid diagrams on the client side (in the browser). However, this approach resulted in rendering glitches and layout issues when exporting to PDF or viewing the HTML.

### The Solution: Pre-Render SVGs

The most reliable approach we've found is to **pre-render your Mermaid diagrams to SVG files** and include them as standard Markdown images.

**1. Create your Mermaid files (`.mmd`) alongside your shards:**

```text
docs/
  presentations/
    my-presentation/
      assets/
        architecture.mmd
```

**2. Render the SVGs:**

Use the Mermaid CLI to render the diagrams before compiling your presentation:

```bash
npx @mermaid-js/mermaid-cli -i docs/presentations/my-presentation/assets/architecture.mmd -o docs/presentations/my-presentation/assets/architecture.svg
```

**3. Reference the SVGs in your shards:**

```markdown
![System Architecture](./assets/architecture.svg)
```

While this means you have to manage SVG artifacts in your repository, it guarantees that your diagrams will render perfectly in all Marp output formats (HTML, PDF, PPTX) without any client-side rendering issues.
