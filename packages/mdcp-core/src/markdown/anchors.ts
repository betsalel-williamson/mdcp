function isSlugChar(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return (
    (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0x30 && c <= 0x39) || c === 0x2d
  );
}

function trimTrailingAsciiWhitespace(text: string): string {
  let end = text.length;
  while (end > 0) {
    const c = text.charCodeAt(end - 1);
    if (c === 0x20 || c === 0x09) end--;
    else break;
  }
  return end === text.length ? text : text.slice(0, end);
}

/** Remove Pandoc-style {#id} markers without polynomial regex backtracking. */
export function stripPandocAnchors(
  text: string,
  options?: { trimPrecedingWhitespace?: boolean },
): string {
  const trimPreceding = options?.trimPrecedingWhitespace ?? false;
  let result = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '{' && i + 1 < text.length && text[i + 1] === '#') {
      let j = i + 2;
      let valid = true;
      while (j < text.length && text[j] !== '}') {
        if (trimPreceding) {
          if (!isSlugChar(text[j])) {
            valid = false;
            break;
          }
        } else if (text[j] === '{') {
          valid = false;
          break;
        }
        j++;
      }
      if (valid && j < text.length && text[j] === '}') {
        if (trimPreceding) {
          result = trimTrailingAsciiWhitespace(result);
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
