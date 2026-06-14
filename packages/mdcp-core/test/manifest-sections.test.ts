import { describe, it, expect } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeSectionsManifest } from '../src/manifest/sections.js';

describe('writeSectionsManifest', () => {
  const work = join(tmpdir(), `mdcp-manifest-${Date.now()}`);

  it('writes guide-relative paths from index.md, not absolute paths', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(
      join(work, 'index.md'),
      '# Guide\n\n- [One](./01-one.md)\n- [Two](./02-two.md)\n',
    );
    writeFileSync(join(work, '01-one.md'), '# One\n');
    writeFileSync(join(work, '02-two.md'), '# Two\n');

    const count = writeSectionsManifest(work);
    expect(count).toBe(2);

    const text = readFileSync(join(work, 'sections.txt'), 'utf-8');
    expect(text).toBe('01-one.md\n02-two.md\n');
    expect(text).not.toMatch(/^\//m);
    expect(text).not.toContain(work);

    rmSync(work, { recursive: true, force: true });
  });

  it('replaces stale absolute sections.txt with guide-relative paths', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(join(work, 'index.md'), '# Guide\n\n- [Alpha](./alpha.md)\n');
    writeFileSync(join(work, 'alpha.md'), '# Alpha\n');
    writeFileSync(join(work, 'sections.txt'), `${join(work, 'alpha.md')}\n`);

    writeSectionsManifest(work);

    const text = readFileSync(join(work, 'sections.txt'), 'utf-8');
    expect(text).toBe('alpha.md\n');

    rmSync(work, { recursive: true, force: true });
  });
});
