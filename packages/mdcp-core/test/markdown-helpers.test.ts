import { describe, it, expect } from 'vitest';
import {
  parseAtxHeading,
  isAtxHeading,
  stripPandocAnchors,
  headingTitlePlain,
} from '../src/markdown/index.js';

describe('parseAtxHeading', () => {
  it('parses levels 1–6 with preserved whitespace', () => {
    expect(parseAtxHeading('##  Hello')).toEqual({
      level: 2,
      marker: '##',
      whitespace: '  ',
      title: 'Hello',
    });
  });

  it('returns null for non-headings and fence-like lines', () => {
    expect(parseAtxHeading('not a heading')).toBeNull();
    expect(parseAtxHeading('#nofence')).toBeNull();
    expect(isAtxHeading('### Title')).toBe(true);
  });
});

describe('stripPandocAnchors', () => {
  it('removes {#id} and optional preceding whitespace', () => {
    expect(stripPandocAnchors('## Review {#review-index}', { trimPrecedingWhitespace: true })).toBe(
      '## Review',
    );
  });

  it('is linear on incomplete pumps', () => {
    const input = '{#'.repeat(20_000);
    const start = performance.now();
    stripPandocAnchors(input);
    expect(performance.now() - start).toBeLessThan(50);
  });
});

describe('headingTitlePlain', () => {
  it('matches prior headingTextToPlain semantics', () => {
    expect(headingTitlePlain('**Bold** `{#custom-id}`')).toBe('Bold');
  });
});
