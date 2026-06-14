import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { sectionFiles } from '../src/compile/assemble.js';

describe('sectionFiles', () => {
  const work = join(tmpdir(), `mdcp-sections-${Date.now()}`);

  it('returns shards in index link order', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(
      join(work, 'index.md'),
      '# Guide\n\n- [One](./01-one.md)\n- [Two](./02-two.md)\n',
    );
    writeFileSync(join(work, '01-one.md'), '# One\n');
    writeFileSync(join(work, '02-two.md'), '# Two\n');

    const files = sectionFiles(work);
    expect(files).toEqual([resolve(work, '01-one.md'), resolve(work, '02-two.md')]);
    rmSync(work, { recursive: true, force: true });
  });

  it('reads sections.txt when present', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(join(work, 'index.md'), '# Guide\n');
    writeFileSync(join(work, 'sections.txt'), 'b.md\na.md\n');
    writeFileSync(join(work, 'a.md'), '# A\n');
    writeFileSync(join(work, 'b.md'), '# B\n');

    expect(sectionFiles(work)).toEqual([resolve(work, 'b.md'), resolve(work, 'a.md')]);
    rmSync(work, { recursive: true, force: true });
  });

  it('limits manifest links to text after sectionsHeading', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(
      join(work, 'index.md'),
      '# Glossary\n\nSee [Preamble](./00-preamble.md).\n\n## Sections\n\n- [One](./01-one.md)\n',
    );
    writeFileSync(join(work, '00-preamble.md'), '# P\n');
    writeFileSync(join(work, '01-one.md'), '# One\n');

    const files = sectionFiles(work, { sectionsHeading: 'Sections' });
    expect(files).toEqual([resolve(work, '01-one.md')]);
    rmSync(work, { recursive: true, force: true });
  });

  it('supports shards.md manifest name', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(join(work, 'shards.md'), '# Shards\n\n- [Alpha](./alpha.md)\n');
    writeFileSync(join(work, 'alpha.md'), '# Alpha\n');

    expect(sectionFiles(work, { manifest: 'shards.md' })).toEqual([resolve(work, 'alpha.md')]);
    rmSync(work, { recursive: true, force: true });
  });

  it('resolves parent-relative manifest links with scopeRoot', () => {
    mkdirSync(work, { recursive: true });
    const child = join(work, 'compiled');
    const sibling = join(work, 'sibling');
    mkdirSync(child, { recursive: true });
    mkdirSync(sibling, { recursive: true });
    writeFileSync(join(child, 'shards.md'), '# M\n\n- [Doc](../sibling/doc.md)\n');
    writeFileSync(join(sibling, 'doc.md'), '# Doc\n');

    const files = sectionFiles(child, {
      manifest: 'shards.md',
      scopeRoot: work,
    });
    expect(files).toEqual([resolve(sibling, 'doc.md')]);
    rmSync(work, { recursive: true, force: true });
  });
});
