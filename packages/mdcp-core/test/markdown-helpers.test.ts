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

  it('returns null for seven hashes', () => {
    expect(parseAtxHeading('####### Title')).toBeNull();
  });

  it('supports tab separator', () => {
    expect(parseAtxHeading('##\tTabbed')).toEqual({
      level: 2,
      marker: '##',
      whitespace: '\t',
      title: 'Tabbed',
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

  it('preserves empty {#} in mode A (trimPrecedingWhitespace: true)', () => {
    expect(stripPandocAnchors('## Review {#}', { trimPrecedingWhitespace: true })).toBe(
      '## Review {#}',
    );
  });

  it('removes empty {#} in mode B (trimPrecedingWhitespace: false)', () => {
    expect(stripPandocAnchors('## Review {#}', { trimPrecedingWhitespace: false })).toBe(
      '## Review ',
    );
  });

  it('trims JS regex whitespace (newlines etc.) preceding anchor in mode A', () => {
    expect(stripPandocAnchors('## Review\n\n\n{#aaa}\n', { trimPrecedingWhitespace: true })).toBe(
      '## Review\n',
    );
  });

  it('diverges on mode A/B for non-slug chars', () => {
    expect(stripPandocAnchors('## Review {#invalid id}', { trimPrecedingWhitespace: true })).toBe(
      '## Review {#invalid id}',
    );
    expect(stripPandocAnchors('## Review {#invalid id}', { trimPrecedingWhitespace: false })).toBe(
      '## Review ',
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
