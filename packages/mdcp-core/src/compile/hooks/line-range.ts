/** Linear line-range parser for code-evidence (avoid polynomial-adjacent regexes). */

import { getLocalePack } from '../../locale/index.js';
import type { LocalePack } from '../../locale/types.js';

const WORD_CHAR = /[A-Za-z0-9_]/;
const WS = /\s/;
/** Hyphen / en dash / em dash — distinct code points (legacy `[-–—]` class). */
const DASHES = new Set([
  '\u002D', // hyphen-minus '-'
  '\u2013', // en dash '–'
  '\u2014', // em dash '—'
]);

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

function startsIgnoreCase(text: string, i: number, literalLower: string): boolean {
  if (i + literalLower.length > text.length) return false;
  return text.slice(i, i + literalLower.length).toLowerCase() === literalLower;
}

/** Protocol single-letter `L` prefix (GitHub fragment shape — not locale wording). */
function matchLetterLPrefix(text: string, i: number): number | null {
  if (!startsIgnoreCase(text, i, 'l')) return null;
  // Do not treat the start of a longer word cue as bare `L` (handled via locale words).
  if (
    i + 1 < text.length &&
    isWordChar(text[i + 1]!) &&
    (text[i + 1]! < '0' || text[i + 1]! > '9')
  ) {
    return null;
  }
  return i + 1;
}

function wordPrefixEnds(text: string, i: number, words: readonly string[]): number[] {
  const ends: number[] = [];
  for (const word of words) {
    const lower = word.toLowerCase();
    if (!startsIgnoreCase(text, i, lower)) continue;
    ends.push(skipWs(text, i + lower.length));
  }
  return ends;
}

function canStartMatch(text: string, i: number, words: readonly string[]): boolean {
  const c = text[i]!;
  if (c >= '0' && c <= '9') return true;
  if (c === 'L' || c === 'l') return true;
  for (const word of words) {
    if (startsIgnoreCase(text, i, word.toLowerCase())) return true;
  }
  return false;
}

export function formatLineFragment(start: string, end?: string): string {
  if (end && end !== start) return `L${start}-L${end}`;
  return `L${start}`;
}

/**
 * Parse first line-range mention in `text` (parity with former LINE_RANGE_RE).
 * Language-neutral forms: `L6-L8`, `:10-20`, `:7`, bare `1-2`.
 * Locale word forms: from `locale.lineRangeWords` (en-US: `line` / `lines`).
 * Output is always a GitHub-style `L…` fragment (not localized).
 */
export function lineRangeFromText(
  text: string,
  locale: LocalePack = getLocalePack(),
): string | null {
  const words = locale.lineRangeWords;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    // Only positions that can start a match — skip pure whitespace / punctuation pumps.
    if (c === ':') {
      const found = tryColonRangeAt(text, i) ?? tryColonSingleAt(text, i);
      if (found) return found;
      continue;
    }
    if (!canStartMatch(text, i, words)) continue;
    if (!isWordBoundary(text, i)) continue;
    const found = tryDigitRangeAt(text, i, words) ?? tryPrefixedSingleAt(text, i, words);
    if (found) return found;
  }
  return null;
}

/** Optional `L` / locale words, then `\d+\s*[-–—]\s*(?:L)?\d+`. */
function tryDigitRangeAt(text: string, i: number, words: readonly string[]): string | null {
  if (!isWordBoundary(text, i)) return null;

  const prefixEnds: number[] = [];
  const lEnd = matchLetterLPrefix(text, i);
  if (lEnd !== null) prefixEnds.push(lEnd);
  prefixEnds.push(...wordPrefixEnds(text, i, words));
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

/**
 * Shortest locale word forms only (en-US: `line` not `lines`) — parity with
 * former `\b(?:L|line\s*)(\d+)\b`. Longer plural cues still work for ranges.
 */
function singleCueWords(words: readonly string[]): readonly string[] {
  if (!words.length) return [];
  let minLen = words[0]!.length;
  for (const w of words) {
    if (w.length < minLen) minLen = w.length;
  }
  return words.filter((w) => w.length === minLen);
}

/** Required `L` or shortest locale word, then `\d+`. */
function tryPrefixedSingleAt(text: string, i: number, words: readonly string[]): string | null {
  if (!isWordBoundary(text, i)) return null;

  const ends: number[] = [];
  const lEnd = matchLetterLPrefix(text, i);
  if (lEnd !== null) ends.push(lEnd);
  ends.push(...wordPrefixEnds(text, i, singleCueWords(words)));

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
