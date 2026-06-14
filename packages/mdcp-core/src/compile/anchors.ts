/** Remove Pandoc-style {#id} markers from compiled output. */
export function stripExplicitAnchorMarkers(markdown: string): string {
  return markdown.replace(/\s*\{#[a-z0-9-]+\}/gi, '');
}
