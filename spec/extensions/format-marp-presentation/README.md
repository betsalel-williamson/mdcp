# Formatting Pack: Marp Presentation (`format-marp-presentation`)

This extension provides guidance and conventions for using MDCP shards to author presentations using [Marp](https://marp.app/) (Markdown Presentation Ecosystem).

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
    "outputFile": "../../presentations/presentation-name.md",
    "includeBanner": false
  }
}
```

After running `mdcp compile`, use the Marp CLI or VS Code extension to export the compiled Markdown file to PDF, HTML, or PPTX.
