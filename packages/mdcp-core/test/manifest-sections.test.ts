import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { writeSectionsManifest } from '../src/manifest/sections.js';
import { useTmpDir } from './helpers/tmp-dir.js';

describe('writeSectionsManifest', () => {
  const work = useTmpDir('mdcp-manifest-');

  it('writes guide-relative paths from index.md, not absolute paths', () => {
    writeFileSync(
      join(work.path, 'index.md'),
      '# Guide\n\n- [One](./01-one.md)\n- [Two](./02-two.md)\n',
    );
    writeFileSync(join(work.path, '01-one.md'), '# One\n');
    writeFileSync(join(work.path, '02-two.md'), '# Two\n');

    const count = writeSectionsManifest(work.path);
    expect(count).toBe(2);

    const text = readFileSync(join(work.path, 'sections.txt'), 'utf-8');
    expect(text).toBe('01-one.md\n02-two.md\n');
    expect(text).not.toMatch(/^\//m);
    expect(text).not.toContain(work.path);
  });

  it('replaces stale absolute sections.txt with guide-relative paths', () => {
    writeFileSync(join(work.path, 'index.md'), '# Guide\n\n- [Alpha](./alpha.md)\n');
    writeFileSync(join(work.path, 'alpha.md'), '# Alpha\n');
    writeFileSync(join(work.path, 'sections.txt'), `${join(work.path, 'alpha.md')}\n`);

    writeSectionsManifest(work.path);

    const text = readFileSync(join(work.path, 'sections.txt'), 'utf-8');
    expect(text).toBe('alpha.md\n');
  });
});
