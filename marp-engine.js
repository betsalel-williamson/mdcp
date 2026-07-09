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
      html: result.html + script
    };
  };

  return marp;
};
