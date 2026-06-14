import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolveUnderOutputDir, defaultGuideOutputFile } from '../src/config/paths.js';
import { resolveGuideLinkBase, resolveGuideDir } from '../src/config/load.js';
import { MdcpConfigSchema } from '../src/config/schema.js';
import { writeCompiledGuides } from '../src/compile/assemble.js';
import { withTmpDir } from './helpers/tmp-dir.js';

describe('resolveUnderOutputDir (unified layout)', () => {
  const docsRoot = '/docs';

  it('joins paths under outputDir', () => {
    expect(resolveUnderOutputDir(docsRoot, '_build', 'features.md')).toBe(
      '/docs/_build/features.md',
    );
  });

  it('resolves publish paths with .. from outputDir', () => {
    expect(resolveUnderOutputDir(docsRoot, '_build', '../packages/foo/README.md')).toBe(
      '/docs/packages/foo/README.md',
    );
    expect(resolveUnderOutputDir(docsRoot, '_build', '../../DEVELOPERS.md')).toBe('/DEVELOPERS.md');
  });

  it('defaults refs under .caches', () => {
    const cfg = MdcpConfigSchema.parse({ compileOrder: ['a'] });
    expect(cfg.refs.registryFile).toBe('.caches/refs.json');
    expect(cfg.outputDir).toBe('_build');
  });
});

describe('defaultGuideOutputFile', () => {
  it('uses guide.md for a single guide', () => {
    expect(defaultGuideOutputFile('glossary', 1)).toBe('guide.md');
  });

  it('uses {name}.md for multiple guides', () => {
    expect(defaultGuideOutputFile('features', 3)).toBe('features.md');
  });
});

describe('resolveGuideDir', () => {
  it('resolves default guide dir under docs root', () => {
    const config = MdcpConfigSchema.parse({ compileOrder: ['features'] });
    expect(resolveGuideDir('features', config, '/docs')).toBe('/docs/features');
  });
});

describe('writeCompiledGuides per-guide defaults', () => {
  it('writes default outputs under outputDir', () => {
    withTmpDir('mdcp-unified-', (work) => {
      const guideDir = join(work, 'glossary');
      mkdirSync(guideDir, { recursive: true });
      writeFileSync(join(guideDir, 'index.md'), '# Guide\n\n- [intro](intro.md)\n');
      writeFileSync(join(guideDir, 'intro.md'), '# Guide\n\n## Hello\n');

      const expected = join(work, '_build', 'guide.md');
      const opts = {
        guidesRoot: work,
        compileOrder: ['glossary'],
        cwd: work,
        config: { outputDir: '_build', compileOrder: ['glossary'] },
        guides: [{ name: 'glossary', compile: { manifest: 'index.md' } }],
      };

      writeCompiledGuides(opts);
      expect(readFileSync(expected, 'utf-8')).toContain('## Hello');
    });
  });
});

describe('resolveGuideLinkBase', () => {
  it('uses outputDir join for default per-guide output', () => {
    expect(resolveGuideLinkBase({ outputDir: '_build' }, '/docs', 'glossary', 2, undefined)).toBe(
      '/docs/_build/glossary.md',
    );
  });
});
