import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolveGuideOutputPath } from '../src/config/paths.js';
import { resolveGuideLinkBase } from '../src/config/load.js';
import { writeCompiledGuides } from '../src/compile/assemble.js';
import { withTmpDir } from './helpers/tmp-dir.js';

describe('resolveGuideOutputPath (#18)', () => {
  const cwd = '/docs';

  it('joins bare outputFile under nested outputDir', () => {
    expect(resolveGuideOutputPath(cwd, '_build/compiled', 'glossary.md')).toBe(
      '/docs/_build/compiled/glossary.md',
    );
  });

  it('normalizes cwd-relative path already under outputDir', () => {
    expect(resolveGuideOutputPath(cwd, '_build/compiled', '_build/compiled/glossary.md')).toBe(
      '/docs/_build/compiled/glossary.md',
    );
  });

  it('keeps publish paths with .. relative to cwd', () => {
    expect(resolveGuideOutputPath(cwd, '_build/compiled', '../DEVELOPERS.md')).toBe(
      '/DEVELOPERS.md',
    );
    expect(resolveGuideOutputPath(cwd, '.', '../packages/foo/README.md')).toBe(
      '/packages/foo/README.md',
    );
  });

  it('resolves simple paths under outputDir when outputDir is "."', () => {
    expect(resolveGuideOutputPath(cwd, '.', 'out/README.md')).toBe('/docs/out/README.md');
  });
});

describe('resolveGuideLinkBase with per-guide output (#18)', () => {
  it('uses outputDir join for bare compile.outputFile', () => {
    expect(
      resolveGuideLinkBase({ outputDir: '_build/compiled', outputFile: 'guides.md' }, '/docs', {
        outputFile: 'glossary.md',
      }),
    ).toBe('/docs/_build/compiled/glossary.md');
  });
});

describe('writeCompiledGuides per-guide path (#18)', () => {
  it('writes bare outputFile under nested outputDir', () => {
    withTmpDir('mdcp-guide-out-', (work) => {
      const guideDir = join(work, '_build', 'compiled', 'glossary');
      mkdirSync(guideDir, { recursive: true });
      writeFileSync(join(guideDir, 'index.md'), '# Guide\n\n- [intro](intro.md)\n');
      writeFileSync(join(guideDir, 'intro.md'), '# Guide\n\n## Hello\n');

      const expected = join(work, '_build', 'compiled', 'glossary.md');
      const opts = {
        guidesRoot: join(work, '_build', 'compiled'),
        compileOrder: ['glossary'],
        cwd: work,
        config: {
          outputDir: '_build/compiled',
          outputFile: 'guides.md',
          compileOrder: ['glossary'],
        },
        guides: [
          {
            name: 'glossary',
            compile: { outputFile: 'glossary.md', manifest: 'index.md' },
          },
        ],
      };

      writeCompiledGuides(opts, join(work, '_build', 'compiled', 'guides.md'));
      expect(readFileSync(expected, 'utf-8')).toContain('## Hello');
    });
  });
});
