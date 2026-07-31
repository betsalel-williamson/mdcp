/** Linear line-range parser for code-evidence (avoid polynomial-adjacent regexes). */

const WORD_CHAR = /[A-Za-z0-9_]/;
const WS = /\s/;
const DASHES = new Set(['-', '–', '—']);

function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && WORD_CHAR.test(ch);
}

function isWordBoundary(text: string, index: number): boolean {
  return isWordChar(text[index - 1]) !== isWordChar(text[index]);
}

function skipWs(text: string, i: number): number {
  while (i < text.length && WS.test(text[i]!)) i++;
  return i;
}

function readDigits(text: string, i: number): { value: string; end: number } | null {
  if (i >= text.length || text[i]! < '0' || text[i]! > '9') return null;
  const start = i;
  while (i < text.length && text[i]! >= '0' && text[i]! <= '9') i++;
  return { value: text.slice(start, i), end: i };
}

function startsIgnoreCase(text: string, i: number, literal: string): boolean {
  if (i + literal.length > text.length) return false;
  return text.slice(i, i + literal.length).toLowerCase() === literal;
}

export function formatLineFragment(start: string, end?: string): string {
  if (end && end !== start) return `L${start}-L${end}`;
  return `L${start}`;
}

/**
 * Parse first line-range mention in `text` (parity with former LINE_RANGE_RE).
 * Forms: `L6-L8`, `lines 10-20`, `line 42`, `:10-20`, `:7`, bare `1-2`.
 */
export function lineRangeFromText(text: string): string | null {
  for (let i = 0; i < text.length; i++) {
    const found =
      tryDigitRangeAt(text, i) ??
      tryPrefixedSingleAt(text, i) ??
      tryColonRangeAt(text, i) ??
      tryColonSingleAt(text, i);
    if (found) return found;
  }
  return null;
}

/** `\b(?:L|lines?\s*)?(\d+)\s*[-–—]\s*(?:L)?(\d+)\b` */
function tryDigitRangeAt(text: string, i: number): string | null {
  if (!isWordBoundary(text, i)) return null;

  // Greedy optional group: try with prefix (L first, then lines?), then without.
  const prefixEnds: number[] = [];
  if (startsIgnoreCase(text, i, 'l')) prefixEnds.push(i + 1);
  if (startsIgnoreCase(text, i, 'lines')) prefixEnds.push(skipWs(text, i + 5));
  else if (startsIgnoreCase(text, i, 'line')) prefixEnds.push(skipWs(text, i + 4));
  prefixEnds.push(i);

  for (const start of prefixEnds) {
    const d1 = readDigits(text, start);
    if (!d1) continue;
    let j = skipWs(text, d1.end);
    if (j >= text.length || !DASHES.has(text[j]!)) continue;
    j++;
    j = skipWs(text, j);
    // Optional single-letter L before the second number (`L8` in `L6-L8`).
    if (
      startsIgnoreCase(text, j, 'l') &&
      j + 1 < text.length &&
      text[j + 1]! >= '0' &&
      text[j + 1]! <= '9'
    ) {
      j += 1;
    }
    const d2 = readDigits(text, j);
    if (!d2) continue;
    if (!isWordBoundary(text, d2.end)) continue;
    return formatLineFragment(d1.value, d2.value);
  }
  return null;
}

/** `\b(?:L|line\s*)(\d+)\b` — prefix required. */
function tryPrefixedSingleAt(text: string, i: number): string | null {
  if (!isWordBoundary(text, i)) return null;

  const ends: number[] = [];
  if (startsIgnoreCase(text, i, 'l')) ends.push(i + 1);
  if (startsIgnoreCase(text, i, 'line')) ends.push(skipWs(text, i + 4));

  for (const start of ends) {
    const d = readDigits(text, start);
    if (!d) continue;
    if (!isWordBoundary(text, d.end)) continue;
    return formatLineFragment(d.value);
  }
  return null;
}

/** `:(\d+)\s*[-–—]\s*(\d+)\b` */
function tryColonRangeAt(text: string, i: number): string | null {
  if (text[i] !== ':') return null;
  const d1 = readDigits(text, i + 1);
  if (!d1) return null;
  let j = skipWs(text, d1.end);
  if (j >= text.length || !DASHES.has(text[j]!)) return null;
  j++;
  j = skipWs(text, j);
  const d2 = readDigits(text, j);
  if (!d2) return null;
  if (!isWordBoundary(text, d2.end)) return null;
  return formatLineFragment(d1.value, d2.value);
}

/** `:(\d+)\b` */
function tryColonSingleAt(text: string, i: number): string | null {
  if (text[i] !== ':') return null;
  const d = readDigits(text, i + 1);
  if (!d) return null;
  if (!isWordBoundary(text, d.end)) return null;
  return formatLineFragment(d.value);
}
