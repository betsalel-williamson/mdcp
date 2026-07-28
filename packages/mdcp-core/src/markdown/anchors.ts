export function isSlugChar(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return (
    (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0x30 && c <= 0x39) || c === 0x2d
  );
}

/** Split trailing Pandoc {#id} from a heading title (forward scan, stripPandocAnchors rules). */
export function splitTrailingPandocAnchor(title: string): { text: string; anchor: string | null } {
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

/** Remove Pandoc-style {#id} markers without polynomial regex backtracking. */
export function stripPandocAnchors(
  text: string,
  options?: { trimPrecedingWhitespace?: boolean },
): string {
  if (text.indexOf('{#') === -1) return text;

  const trimPreceding = options?.trimPrecedingWhitespace ?? false;
  let result = '';
  let i = 0;

  // Mode A (trimPrecedingWhitespace: true): parity with old regex /\s*\{#[a-z0-9-]+\}/gi
  // requires >=1 slug char and trims all preceding regex whitespace.
  // Mode B (trimPrecedingWhitespace: false): strictly strips well-formed anchors,
  // allowing empty {#} but not touching surrounding text.

  while (i < text.length) {
    if (text[i] === '{' && i + 1 < text.length && text[i + 1] === '#') {
      let j = i + 2;
      let valid = true;
      let slugLen = 0;
      while (j < text.length && text[j] !== '}') {
        if (trimPreceding) {
          if (!isSlugChar(text[j])) {
            valid = false;
            break;
          }
          slugLen++;
        } else if (text[j] === '{') {
          valid = false;
          break;
        }
        j++;
      }

      if (trimPreceding && slugLen === 0) {
        valid = false;
      }

      if (valid && j < text.length && text[j] === '}') {
        if (trimPreceding) {
          result = result.replace(/\s+$/, '');
        }
        i = j + 1;
        continue;
      }
    }

    result += text[i];
    i++;
  }

  return result;
}
