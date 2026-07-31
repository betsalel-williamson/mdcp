import { describe, it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lintXrefs } from '../src/xrefs/lint.js';
import { findChapterRefs, hasUnlinkedLowercaseSee } from '../src/xrefs/chapter-refs.js';
import { useTmpDir } from './helpers/tmp-dir.js';

describe('findChapterRefs', () => {
  it('matches Ch. / Ch / Chapter forms with optional dash titles', () => {
    expect(findChapterRefs('See Ch. 1 for details')).toEqual(['Ch. 1']);
    expect(findChapterRefs('See Ch 2 for details')).toEqual(['Ch 2']);
    expect(findChapterRefs('See Chapter 3 for details')).toEqual(['Chapter 3']);
    expect(findChapterRefs('Ch. 1 – Introduction')).toEqual(['Ch. 1 – Introduction']);
    expect(findChapterRefs('Ch. 1 - Introduction more')).toEqual(['Ch. 1 - Introduction more']);
    expect(findChapterRefs('Ch. 1 — Intro | rest')).toEqual(['Ch. 1 — Intro']);
    expect(findChapterRefs('Ch. 1. Next sentence')).toEqual(['Ch. 1']);
    expect(findChapterRefs('Chapter 10 - Foo.Bar')).toEqual(['Chapter 10 - Foo']);
  });

  it('rejects near-misses', () => {
    expect(findChapterRefs('no match here')).toEqual([]);
    expect(findChapterRefs('Chapters 1')).toEqual([]);
    expect(findChapterRefs('Ch.x 1')).toEqual([]);
  });
});

describe('hasUnlinkedLowercaseSee', () => {
  it('flags lowercase see after ( or ,', () => {
    expect(hasUnlinkedLowercaseSee('(see Section 2)')).toBe(true);
    expect(hasUnlinkedLowercaseSee('foo, see bar')).toBe(true);
    expect(hasUnlinkedLowercaseSee('(see [Section 2](./x.md))')).toBe(false);
    expect(hasUnlinkedLowercaseSee('See Section 2')).toBe(false);
  });
});

describe('lintXrefs', () => {
  const work = useTmpDir('mdcp-xrefs-');

  it('flags bare See Section N', () => {
    writeFileSync(join(work.path, 'bad.md'), 'See Section 2 for details.\n');
    const issues = lintXrefs([work.path]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatch(/bare cross-ref|unlinked/i);
  });

  it('allows markdown links', () => {
    writeFileSync(join(work.path, 'ok.md'), 'See [Section 2](./other.md#section-2) for details.\n');
    expect(lintXrefs([work.path])).toEqual([]);
  });

  it('ignores bare refs inside fenced code', () => {
    writeFileSync(join(work.path, 'ok.md'), '```\nSee Section 2\n```\n');
    expect(lintXrefs([work.path])).toEqual([]);
  });

  it('flags bare Ch. refs', () => {
    writeFileSync(join(work.path, 'ch.md'), 'See Ch. 4 for the protocol.\n');
    const issues = lintXrefs([work.path]);
    expect(issues.some((i) => i.includes('bare cross-ref') && i.includes('Ch. 4'))).toBe(true);
  });
});
