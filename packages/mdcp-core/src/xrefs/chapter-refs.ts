/** Linear scanners for chapter / See xref lint (avoid polynomial-adjacent regexes). */

const WORD_CHAR = /[A-Za-z0-9_]/;
const WS = /\s/;
/** Hyphen / en dash / em dash — distinct code points (legacy `[–—-]` class). */
const DASHES = new Set([
  '\u002D', // hyphen-minus '-'
  '\u2013', // en dash '–'
  '\u2014', // em dash '—'
]);

function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && WORD_CHAR.test(ch);
}

/** JS `\b`-compatible boundary between word / non-word (ASCII `\w`). */
export function isWordBoundary(text: string, index: number): boolean {
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

function eqIgnoreCase(text: string, start: number, literal: string): boolean {
  if (start + literal.length > text.length) return false;
  return text.slice(start, start + literal.length).toLowerCase() === literal.toLowerCase();
}

/**
 * Optional `\s*[–—-]\s*[^|.\n]+` after a chapter number.
 * Mirrors legacy regex backtracking: shorten the title until it ends on a
 * word boundary; otherwise omit the title.
 */
function endWithOptionalDashTitle(text: string, afterDigits: number): number | null {
  if (!isWordBoundary(text, afterDigits)) return null;

  let k = skipWs(text, afterDigits);
  if (k < text.length && DASHES.has(text[k]!)) {
    k++;
    k = skipWs(text, k);
    const titleStart = k;
    while (k < text.length && text[k] !== '|' && text[k] !== '.' && text[k] !== '\n') k++;
    let titleEnd = k;
    while (titleEnd > titleStart && !isWordBoundary(text, titleEnd)) titleEnd--;
    if (titleEnd > titleStart) return titleEnd;
  }
  return afterDigits;
}

function matchChapterRefAt(text: string, i: number): string | null {
  if (!isWordBoundary(text, i)) return null;

  if (eqIgnoreCase(text, i, 'chapter')) {
    const j = i + 7;
    if (isWordChar(text[j])) return null;
    const afterWs = skipWs(text, j);
    if (afterWs === j) return null;
    const digits = readDigits(text, afterWs);
    if (!digits) return null;
    const end = endWithOptionalDashTitle(text, digits.end);
    if (end === null) return null;
    return text.slice(i, end);
  }

  if (!eqIgnoreCase(text, i, 'ch')) return null;
  let j = i + 2;
  if (text[j] === '.') j++;
  const afterWs = skipWs(text, j);
  const digits = readDigits(text, afterWs);
  if (!digits) return null;
  const end = endWithOptionalDashTitle(text, digits.end);
  if (end === null) return null;
  return text.slice(i, end);
}

/** All `Ch.` / `Chapter` bare refs on a line (left-to-right, non-overlapping). */
export function findChapterRefs(text: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    const m = matchChapterRefAt(text, i);
    if (m) {
      out.push(m);
      i += m.length;
      continue;
    }
    i++;
  }
  return out;
}

/** Legacy `/(?<=[(,])\s*see\s+(?!\[)\w/` without `\s*` backtracking. */
export function hasUnlinkedLowercaseSee(line: string): boolean {
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== '(' && line[i] !== ',') continue;
    let j = skipWs(line, i + 1);
    if (line.slice(j, j + 3) !== 'see') continue;
    j += 3;
    if (j >= line.length || !WS.test(line[j]!)) continue;
    j = skipWs(line, j);
    if (j >= line.length || line[j] === '[') continue;
    if (isWordChar(line[j])) return true;
  }
  return false;
}
