import { describe, it, expect } from 'vitest';
import { resolve, join } from 'node:path';
import { MdcpConfigSchema } from '../src/config/schema.js';
import { guideScanDirs, shardLintPaths, xrefScanDirs } from '../src/config/load.js';

describe('guideScanDirs', () => {
  it('returns compileOrder guide dirs under cwd', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features', 'developer'],
      guides: [{ name: 'features' }, { name: 'developer', path: 'dev' }],
    });
    const cwd = '/docs';
    expect(guideScanDirs(config, cwd)).toEqual([resolve(cwd, 'features'), resolve(cwd, 'dev')]);
  });

  it('xrefScanDirs matches guideScanDirs', () => {
    const config = MdcpConfigSchema.parse({
      outputDir: '_build',
      compileOrder: ['a', 'b'],
      guides: [{ name: 'b', path: 'custom/b' }],
    });
    const cwd = '/repo/docs';
    expect(xrefScanDirs(config, cwd)).toEqual(guideScanDirs(config, cwd));
  });
});

describe('shardLintPaths', () => {
  it('parses lint.markdownlint.shardsGlobs in schema', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['g'],
      lint: { markdownlint: { shardsGlobs: ['glossary', 'review'] } },
    });
    expect(config.lint?.markdownlint?.shardsGlobs).toEqual(['glossary', 'review']);
  });

  it('defaults to guideScanDirs when shardsGlobs omitted', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['guide'],
      guides: [{ name: 'guide', path: 'guide' }],
    });
    const cwd = '/docs';
    expect(shardLintPaths(config, cwd)).toEqual(guideScanDirs(config, cwd));
  });

  it('resolves shardsGlobs relative to cwd', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['guide'],
      lint: { markdownlint: { shardsGlobs: ['glossary', 'review/security'] } },
    });
    const cwd = '/docs';
    expect(shardLintPaths(config, cwd)).toEqual([
      join('/docs', 'glossary'),
      join('/docs', 'review/security'),
    ]);
  });
});
