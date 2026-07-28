import { stripPandocAnchors } from '../markdown/index.js';

/** Remove Pandoc-style {#id} markers from compiled output. */
export function stripExplicitAnchorMarkers(markdown: string): string {
  return stripPandocAnchors(markdown, { trimPrecedingWhitespace: true });
}
