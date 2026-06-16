import { describe, it, expect } from 'vitest';
import { MdcpConfigSchema } from '../src/config/schema.js';
import { loadConfig, resolveOutputPath, resolveRefsPath } from '../src/config/load.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { useTmpDir, withTmpDir } from './helpers/tmp-dir.js';

describe('MdcpConfigSchema', () => {
  it('parses minimal config', () => {
    const cfg = MdcpConfigSchema.parse({
      compileOrder: ['glossary'],
    });
    expect(cfg.outputFile).toBeUndefined();
    expect(cfg.outputDir).toBe('_build');
    expect(cfg.refs.registryFile).toBe('.caches/refs.json');
  });

  it('parses per-guide compile options', () => {
    const cfg = MdcpConfigSchema.parse({
      compileOrder: ['glossary'],
      guides: [
        {
          name: 'glossary',
          path: 'docs/example',
          compile: {
            title: 'Example glossary',
            manifest: 'index.md',
            outputFile: 'out/glossary.md',
            hooks: ['stripAnchors'],
          },
        },
      ],
    });
    expect(cfg.guides?.[0].compile?.title).toBe('Example glossary');
    expect(cfg.guides?.[0].compile?.hooks).toContain('stripAnchors');
  });

  it('parses object-form hook opt-out', () => {
    const cfg = MdcpConfigSchema.parse({
      compileOrder: ['glossary'],
      guides: [
        {
          name: 'glossary',
          compile: {
            hooks: { codeEvidence: false, inlineInserts: false },
          },
        },
      ],
    });
    const hooks = cfg.guides?.[0].compile?.hooks;
    expect(hooks).toEqual({ codeEvidence: false, inlineInserts: false });
  });

  it('rejects empty compileOrder', () => {
    expect(() => MdcpConfigSchema.parse({ compileOrder: [] })).toThrow();
  });

  it('parses backup defaults', () => {
    const cfg = MdcpConfigSchema.parse({
      compileOrder: ['glossary'],
    });
    expect(cfg.backup.enabled).toBe(false);
    expect(cfg.backup.dir).toBe('.caches/backups');
    expect(cfg.backup.ext).toBe('');
  });

  it('parses explicit backup config', () => {
    const cfg = MdcpConfigSchema.parse({
      compileOrder: ['glossary'],
      backup: { enabled: true, dir: 'archive', ext: '.bak' },
    });
    expect(cfg.backup.enabled).toBe(true);
    expect(cfg.backup.dir).toBe('archive');
    expect(cfg.backup.ext).toBe('.bak');
  });

  it('parses link validation defaults', () => {
    const cfg = MdcpConfigSchema.parse({
      compileOrder: ['glossary'],
      guides: [
        {
          name: 'glossary',
          compile: { links: { markBroken: true } },
        },
      ],
      lint: { links: { enabled: true, severity: 'error' } },
    });
    expect(cfg.guides?.[0].compile?.links?.markBroken).toBe(true);
    expect(cfg.lint?.links?.enabled).toBe(true);
    expect(cfg.lint?.links?.severity).toBe('error');
  });
});

describe('loadConfig', () => {
  const work = useTmpDir('mdcp-config-');

  it('loads config from disk', () => {
    writeFileSync(join(work.path, 'mdcp.config.json'), JSON.stringify({ compileOrder: ['a'] }));
    const cfg = loadConfig('mdcp.config.json', work.path);
    expect(cfg.compileOrder).toEqual(['a']);
  });

  it('throws when config missing', () => {
    expect(() => loadConfig('missing.json', work.path)).toThrow(/Config not found/);
  });

  it('resolves config path from configBase, not docs cwd', () => {
    withTmpDir('mdcp-config-', (repo) => {
      const docs = join(repo, 'docs');
      mkdirSync(docs, { recursive: true });
      writeFileSync(join(docs, 'mdcp.config.json'), JSON.stringify({ compileOrder: ['a'] }));
      const cfg = loadConfig('docs/mdcp.config.json', repo);
      expect(cfg.compileOrder).toEqual(['a']);
    });
  });
});

describe('resolveUnderOutputDir paths', () => {
  it('resolves outputFile relative to outputDir', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['a'],
      outputDir: '_build/compiled',
      outputFile: 'guides.md',
    });
    expect(resolveOutputPath(config, '/docs')).toBe('/docs/_build/compiled/guides.md');
  });

  it('normalizes cwd-relative outputFile under outputDir', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['a'],
      outputDir: '_build/compiled',
      outputFile: '_build/compiled/guides.md',
    });
    expect(resolveOutputPath(config, '/docs')).toBe('/docs/_build/compiled/guides.md');
  });

  it('resolves refs.registryFile via resolveRefsPath', () => {
    expect(resolveRefsPath('/docs', '_build', '.caches/refs.json')).toBe(
      '/docs/_build/.caches/refs.json',
    );
  });
});
