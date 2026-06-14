import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { githubSlugify, buildSlugRegistry, lookupHeadings } from '../src/refs/slugs.js';
import { genRefsFromCompiled, checkRefsRegistry } from '../src/refs/registry.js';
import { resolveRefsPath } from '../src/config/load.js';
import { useTmpDir } from './helpers/tmp-dir.js';

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

describe('resolveRefsPath', () => {
  it('resolves registryFile relative to outputDir (#11)', () => {
    const cwd = '/docs';
    expect(resolveRefsPath(cwd, '_build/compiled', 'refs.json')).toBe(
      '/docs/_build/compiled/refs.json',
    );
  });

  it('normalizes cwd-relative registryFile under outputDir (#11)', () => {
    const cwd = '/docs';
    expect(resolveRefsPath(cwd, '_build/compiled', '_build/compiled/refs.json')).toBe(
      '/docs/_build/compiled/refs.json',
    );
  });

  it('keeps nested paths relative to outputDir', () => {
    const cwd = '/docs';
    expect(resolveRefsPath(cwd, '_build/compiled', 'meta/refs.json')).toBe(
      '/docs/_build/compiled/meta/refs.json',
    );
  });

  it('resolves registryFile when outputDir is "."', () => {
    expect(resolveRefsPath('/docs', '.', 'refs.json')).toBe('/docs/refs.json');
  });

  it('does not treat outputDir-relative refs.json as cwd-relative', () => {
    const cwd = '/docs';
    expect(resolveRefsPath(cwd, '_build/compiled', 'refs.json')).toBe(
      '/docs/_build/compiled/refs.json',
    );
  });
});

describe('checkRefsRegistry', () => {
  const work = useTmpDir('mdcp-refs-');

  it('reports stale registry', () => {
    const refsPath = join(work.path, 'refs.json');
    genRefsFromCompiled('# A\n\n## B\n', refsPath);
    const stale = checkRefsRegistry('# A\n\n## B\n\n## C\n', refsPath);
    expect(stale.ok).toBe(false);
  });

  it('passes when registry matches compile', () => {
    const refsPath = join(work.path, 'refs.json');
    const text = '# A\n\n## B\n';
    genRefsFromCompiled(text, refsPath);
    const ok = checkRefsRegistry(text, refsPath);
    expect(ok.ok).toBe(true);
    expect(readFileSync(refsPath, 'utf-8')).toContain('"slug": "b"');
  });
});
