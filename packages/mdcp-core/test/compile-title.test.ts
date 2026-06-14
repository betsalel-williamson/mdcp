import { describe, it, expect } from 'vitest';
import { extractFirstHeading, stripFirstHeadingLine, formatCompileTitle } from '../src/compile/compile-title.js';

describe('compile-title', () => {
  it('extracts heading text and anchor', () => {
    const h = extractFirstHeading('# Title {#my-id}\n\nbody');
    expect(h.text).toBe('Title');
    expect(h.anchor).toBe('my-id');
  });

  it('strips first heading line', () => {
    expect(stripFirstHeadingLine('# T\n\nbody')).toBe('body');
  });

  it('formats compile title as h2', () => {
    expect(formatCompileTitle('Example glossary')).toBe('## Example glossary');
  });
});
