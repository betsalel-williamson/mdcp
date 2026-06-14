import { describe, it, expect } from 'vitest';
import { MdcpConfigSchema } from '../src/config/schema.js';
import { loadConfig } from '../src/config/load.js';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('MdcpConfigSchema', () => {
  it('parses minimal config', () => {
    const cfg = MdcpConfigSchema.parse({
      compileOrder: ['glossary'],
    });
    expect(cfg.outputFile).toBe('guides.md');
    expect(cfg.refs.registryFile).toBe('refs.json');
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

  it('rejects empty compileOrder', () => {
    expect(() => MdcpConfigSchema.parse({ compileOrder: [] })).toThrow();
  });
});

describe('loadConfig', () => {
  const work = join(tmpdir(), `mdcp-config-${Date.now()}`);

  it('loads config from disk', () => {
    mkdirSync(work, { recursive: true });
    writeFileSync(join(work, 'mdcp.config.json'), JSON.stringify({ compileOrder: ['a'] }));
    const cfg = loadConfig('mdcp.config.json', work);
    expect(cfg.compileOrder).toEqual(['a']);
    rmSync(work, { recursive: true, force: true });
  });

  it('throws when config missing', () => {
    expect(() => loadConfig('missing.json', work)).toThrow(/Config not found/);
  });

  it('resolves config path from configBase, not docs cwd', () => {
    const repo = join(tmpdir(), `mdcp-config-${Date.now()}`);
    const docs = join(repo, 'docs');
    mkdirSync(docs, { recursive: true });
    writeFileSync(join(docs, 'mdcp.config.json'), JSON.stringify({ compileOrder: ['a'] }));
    const cfg = loadConfig('docs/mdcp.config.json', repo);
    expect(cfg.compileOrder).toEqual(['a']);
    rmSync(repo, { recursive: true, force: true });
  });
});
