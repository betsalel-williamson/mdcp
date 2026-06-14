import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  githubSlugify,
  buildSlugRegistry,
  lookupHeadings,
} from '../src/refs/slugs.js';
import {
  genRefsFromCompiled,
  checkRefsRegistry,
} from '../src/refs/registry.js';

describe('githubSlugify', () => {
  it('strips brace ids and punctuation', () => {
    expect(githubSlugify('Hello {#world}!')).toBe('hello');
  });
});

describe('buildSlugRegistry', () => {
  it('disambiguates duplicate slugs', () => {
    const text = '# Guide\n\n## Foo\n\n## Foo\n';
    const reg = buildSlugRegistry(text);
    const slugs = reg.headings.map((h) => h.slug);
    expect(slugs).toContain('foo');
    expect(slugs).toContain('foo-1');
  });
});

describe('lookupHeadings', () => {
  it('fuzzy matches title and slug', () => {
    const reg = buildSlugRegistry('# G\n\n## Authentication flow\n');
    const matches = lookupHeadings(reg, 'auth');
    expect(matches.some((m) => m.title.includes('Authentication'))).toBe(true);
  });
});

describe('semantic chapter keys', () => {
  it('assigns semantic keys for acronym chapter headings', () => {
    const text = '# Admin Guide\n\n## ADM Chapter 1 — Getting started\n';
    const reg = buildSlugRegistry(text);
    const entry = reg.headings.find((h) => h.title.includes('ADM Chapter 1'));
    expect(entry?.key).toBe('adm.ch1');
    expect(reg.slugs[entry!.slug]).toBe('adm.ch1');
  });
});

describe('checkRefsRegistry', () => {
  const work = join(tmpdir(), `mdcp-refs-${Date.now()}`);
  const refsPath = join(work, 'refs.json');

  it('reports stale registry', () => {
    mkdirSync(work, { recursive: true });
    genRefsFromCompiled('# A\n\n## B\n', refsPath);
    const stale = checkRefsRegistry('# A\n\n## B\n\n## C\n', refsPath);
    expect(stale.ok).toBe(false);
    rmSync(work, { recursive: true, force: true });
  });

  it('passes when registry matches compile', () => {
    mkdirSync(work, { recursive: true });
    const text = '# A\n\n## B\n';
    genRefsFromCompiled(text, refsPath);
    const ok = checkRefsRegistry(text, refsPath);
    expect(ok.ok).toBe(true);
    expect(readFileSync(refsPath, 'utf-8')).toContain('"slug": "b"');
    rmSync(work, { recursive: true, force: true });
  });
});
