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

## Lessons Learned: Diagrams and Mermaid

When creating presentations, you will likely want to include architecture diagrams or flowcharts using Mermaid. However, there are a few caveats when using Marp:

1. **Synchronous Constraints:** Marp uses `markdown-it` under the hood, which is strictly synchronous. Mermaid's modern rendering APIs are asynchronous, meaning you cannot easily render Mermaid blocks to SVGs during the Marp build process without complex workarounds.
2. **Build Artifacts:** Pre-rendering diagrams to SVG or PNG files and committing them to the repository pollutes your Git history with build artifacts.

### The Solution: Client-Side Rendering via Custom Engine

The cleanest approach is to use a custom Marp engine that intercepts standard ````mermaid` blocks, wraps the raw code in a `div`, and injects the Mermaid JavaScript library to render the diagrams client-side when the HTML presentation is viewed.

**1. Create `marp-engine.js` in your project root:**

```javascript
module.exports = ({ marp }) => {
  // A simple plugin to render mermaid blocks as <div class="mermaid">...</div>
  marp.use((md) => {
    const originalFence = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if (token.info.trim() === 'mermaid') {
        const code = md.utils.escapeHtml(token.content.trim());
        return `<div class="mermaid">\n${code}\n</div>\n`;
      }
      return originalFence(tokens, idx, options, env, self);
    };
  });

  // Inject the Mermaid initialization script at the end of the document
  const originalRender = marp.render.bind(marp);
  marp.render = (markdown, env) => {
    const result = originalRender(markdown, env);
    const script = `
<style>
  .mermaid svg {
    overflow: visible !important;
  }
</style>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    fontFamily: 'inherit'
  });
</script>
`;
    return {
      ...result,
      html: result.html + script,
    };
  };

  return marp;
};
```

**2. Update your `package.json` scripts to use the custom engine:**

Pass the `--engine` flag to the Marp CLI:

```json
{
  "scripts": {
    "presentation:render": "mdcp compile && marp --html true --engine ./marp-engine.js presentations/my-presentation.md -o presentations/my-presentation.html",
    "presentation:preview": "mdcp compile && marp --html true --engine ./marp-engine.js -I presentations --server --watch --preview"
  }
}
```

This allows you to write standard Mermaid code blocks in your MDCP shards and have them render beautifully in your final presentation without managing external image assets.
