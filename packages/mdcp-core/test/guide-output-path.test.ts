import { describe, it, expect } from 'vitest';
import { resolveGuideOutputPath } from '../src/config/paths.js';

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
