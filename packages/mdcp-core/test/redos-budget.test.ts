import { describe, it, expect } from 'vitest';
import { stripExplicitAnchorMarkers } from '../src/compile/anchors.js';
import { headingTextToPlain } from '../src/refs/slugs.js';
import { demoteHeadings } from '../src/compile/headings.js';
import { manySpaces, nestedOpenAnchors, timeMs } from './helpers/redos-pumps.js';

/** Tight budget: safe linear parsers finish well under this; polynomial paths blow it. */
const BUDGET_MS = 50;
const SPACE_N = 40_000;
const ANCHOR_N = 25_000;

describe('ReDoS budget demos (CodeQL js/polynomial-redos)', () => {
  it('stripExplicitAnchorMarkers stays under budget on long leading spaces + incomplete {#', () => {
    // Alert #1 class: \s* before {#…}
    const input = manySpaces(SPACE_N) + '{#';
    const ms = timeMs(() => {
      stripExplicitAnchorMarkers(input);
    });
    expect(ms).toBeLessThan(BUDGET_MS);
  });

  it('headingTextToPlain stays under budget on nested {{# pumps', () => {
    // Alerts #4/#6 class: \{#.*?\}
    const input = nestedOpenAnchors(ANCHOR_N);
    const ms = timeMs(() => {
      headingTextToPlain(input);
    });
    expect(ms).toBeLessThan(BUDGET_MS);
  });

  it('demoteHeadings stays under budget on long whitespace after hashes', () => {
    // Alerts #2/#3/#5 class: heading \s+ + rest
    const input = '#' + manySpaces(SPACE_N) + 'Title';
    const ms = timeMs(() => {
      demoteHeadings(input);
    });
    expect(ms).toBeLessThan(BUDGET_MS);
  });
});
