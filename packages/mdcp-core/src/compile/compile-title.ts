import { isAtxHeading, parseAtxHeading } from '../markdown/index.js';

function isSlugChar(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return (
    (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0x30 && c <= 0x39) || c === 0x2d
  );
}

/** Split trailing Pandoc {#id} from a heading title (forward scan, stripPandocAnchors rules). */
function splitTrailingPandocAnchor(title: string): { text: string; anchor: string | null } {
  let end = title.length;
  while (end > 0) {
    const c = title.charCodeAt(end - 1);
    if (c === 0x20 || c === 0x09) end--;
    else break;
  }

  if (end === 0 || title[end - 1] !== '}') {
    return { text: title.trim(), anchor: null };
  }

  const closeBrace = end - 1;
  let openBrace = closeBrace - 1;
  while (openBrace >= 0 && title[openBrace] !== '{') openBrace--;

  if (
    openBrace < 0 ||
    openBrace + 1 >= closeBrace ||
    title[openBrace + 1] !== '#' ||
    openBrace + 2 >= closeBrace
  ) {
    return { text: title.trim(), anchor: null };
  }

  const slugStart = openBrace + 2;
  for (let k = slugStart; k < closeBrace; k++) {
    if (!isSlugChar(title[k])) {
      return { text: title.trim(), anchor: null };
    }
  }

  let textEnd = openBrace;
  while (textEnd > 0) {
    const c = title.charCodeAt(textEnd - 1);
    if (c === 0x20 || c === 0x09) textEnd--;
    else break;
  }

  const slug = title.slice(slugStart, closeBrace);
  return { text: title.slice(0, textEnd).trim(), anchor: slug.toLowerCase() };
}

export function extractFirstHeading(body: string): {
  text: string | null;
  anchor: string | null;
} {
  const trimmed = body.trimStart();
  const newline = trimmed.indexOf('\n');
  const firstLine = newline === -1 ? trimmed : trimmed.slice(0, newline);
  const parsed = parseAtxHeading(firstLine);
  if (!parsed) return { text: null, anchor: null };
  const { text, anchor } = splitTrailingPandocAnchor(parsed.title);
  return { text: text || null, anchor };
}

export function stripFirstHeadingLine(body: string): string {
  const lines = body.split('\n');
  if (lines.length === 0) return body;
  if (isAtxHeading(lines[0])) {
    return lines.slice(1).join('\n').trimStart();
  }
  return body;
}

export function formatCompileTitle(title: string): string {
  return `## ${title}`;
}
