import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { sectionFiles } from '../src/compile/assemble.js';
import { useTmpDir } from './helpers/tmp-dir.js';

describe('sectionFiles', () => {
  const work = useTmpDir('mdcp-sections-');

  it('returns shards in index link order', () => {
    writeFileSync(
      join(work.path, 'index.md'),
      '# Guide\n\n- [One](./01-one.md)\n- [Two](./02-two.md)\n',
    );
    writeFileSync(join(work.path, '01-one.md'), '# One\n');
    writeFileSync(join(work.path, '02-two.md'), '# Two\n');

    const files = sectionFiles(work.path);
    expect(files).toEqual([resolve(work.path, '01-one.md'), resolve(work.path, '02-two.md')]);
  });

  it('reads sections.txt when present', () => {
    writeFileSync(join(work.path, 'index.md'), '# Guide\n');
    writeFileSync(join(work.path, 'sections.txt'), 'b.md\na.md\n');
    writeFileSync(join(work.path, 'a.md'), '# A\n');
    writeFileSync(join(work.path, 'b.md'), '# B\n');

    expect(sectionFiles(work.path)).toEqual([
      resolve(work.path, 'b.md'),
      resolve(work.path, 'a.md'),
    ]);
  });

  it('limits manifest links to text after sectionsHeading', () => {
    writeFileSync(
      join(work.path, 'index.md'),
      '# Glossary\n\nSee [Preamble](./00-preamble.md).\n\n## Sections\n\n- [One](./01-one.md)\n',
    );
    writeFileSync(join(work.path, '00-preamble.md'), '# P\n');
    writeFileSync(join(work.path, '01-one.md'), '# One\n');

    const files = sectionFiles(work.path, { sectionsHeading: 'Sections' });
    expect(files).toEqual([resolve(work.path, '01-one.md')]);
  });

  it('supports shards.md manifest name', () => {
    writeFileSync(join(work.path, 'shards.md'), '# Shards\n\n- [Alpha](./alpha.md)\n');
    writeFileSync(join(work.path, 'alpha.md'), '# Alpha\n');

    expect(sectionFiles(work.path, { manifest: 'shards.md' })).toEqual([
      resolve(work.path, 'alpha.md'),
    ]);
  });

  it('resolves parent-relative manifest links with scopeRoot', () => {
    const child = join(work.path, 'compiled');
    const sibling = join(work.path, 'sibling');
    mkdirSync(child, { recursive: true });
    mkdirSync(sibling, { recursive: true });
    writeFileSync(join(child, 'shards.md'), '# M\n\n- [Doc](../sibling/doc.md)\n');
    writeFileSync(join(sibling, 'doc.md'), '# Doc\n');

    const files = sectionFiles(child, {
      manifest: 'shards.md',
      scopeRoot: work.path,
    });
    expect(files).toEqual([resolve(sibling, 'doc.md')]);
  });
});
