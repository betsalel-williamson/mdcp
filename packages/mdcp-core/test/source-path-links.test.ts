/**
 * Source-file link targets and standalone-guide link linting — the two surfaces
 * the gate used to skip. Driven by docs/features/link-validation.md.
 */
import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { hasSourceExtension, sourceExtensionSet } from '../src/compile/hooks/path-resolve.js';
import { codeEvidenceHook } from '../src/compile/hooks/code-evidence.js';
import { lintShardLinks } from '../src/links/validate-shards.js';
import { validateCompiledLinkTarget } from '../src/links/validate.js';
import { lintLinks } from '../src/links/lint.js';
import { buildSlugRegistry } from '../src/refs/slugs.js';
import { compileGuideResults } from '../src/compile/assemble.js';
import { MdcpConfigSchema } from '../src/config/schema.js';
import { withTmpDir } from './helpers/tmp-dir.js';

describe('hasSourceExtension', () => {
  it('accepts source files and rejects prose, markdown and directories', () => {
    expect(hasSourceExtension('src/thing.ts')).toBe(true);
    expect(hasSourceExtension('config/app.yaml#L3')).toBe(true);
    expect(hasSourceExtension('notes.md')).toBe(false);
    expect(hasSourceExtension('src/')).toBe(false);
    expect(hasSourceExtension('path')).toBe(false);
  });
});

describe('lintShardLinks source-file targets', () => {
  it('reports a shard link to a source file that no longer exists', () => {
    withTmpDir('mdcp-src-link-', (work) => {
      const guideDir = join(work, 'g');
      mkdirSync(guideDir, { recursive: true });
      const shard = join(guideDir, 'section.md');
      writeFileSync(shard, '## S\n\n[store](./removed-module.ts)\n');
      const issues = lintShardLinks({ shardFile: shard, guideDir });
      expect(issues.map((i) => i.kind)).toContain('missing file');
      expect(issues[0].brokenTarget).toBe('./removed-module.ts');
    });
  });

  it('accepts a shard link to a source file that exists', () => {
    withTmpDir('mdcp-src-link-ok-', (work) => {
      const guideDir = join(work, 'g');
      mkdirSync(guideDir, { recursive: true });
      writeFileSync(join(guideDir, 'live-module.ts'), 'export const x = 1;\n');
      const shard = join(guideDir, 'section.md');
      writeFileSync(shard, '## S\n\n[store](./live-module.ts)\n');
      expect(lintShardLinks({ shardFile: shard, guideDir })).toEqual([]);
    });
  });

  it('leaves targets without a source extension unvalidated', () => {
    withTmpDir('mdcp-src-link-prose-', (work) => {
      const guideDir = join(work, 'g');
      mkdirSync(guideDir, { recursive: true });
      const shard = join(guideDir, 'section.md');
      writeFileSync(shard, '## S\n\n[a placeholder](path) and [a directory](src/)\n');
      expect(lintShardLinks({ shardFile: shard, guideDir })).toEqual([]);
    });
  });

  it('resolves a source path through the line fragment codeEvidence adds', () => {
    withTmpDir('mdcp-src-link-frag-', (work) => {
      const guideDir = join(work, 'g');
      mkdirSync(guideDir, { recursive: true });
      writeFileSync(join(guideDir, 'live.ts'), 'export const x = 1;\n');
      const shard = join(guideDir, 'section.md');
      writeFileSync(shard, '## S\n\n[x](./live.ts#L1)\n[gone](./gone.ts#L1)\n');
      const issues = lintShardLinks({ shardFile: shard, guideDir });
      expect(issues).toHaveLength(1);
      expect(issues[0].brokenTarget).toBe('./gone.ts#L1');
    });
  });
});

describe('validateCompiledLinkTarget source-file targets', () => {
  it('reports a compiled link to a source file that no longer exists', () => {
    withTmpDir('mdcp-compiled-src-', (work) => {
      const out = join(work, 'out.md');
      writeFileSync(out, '# Out\n');
      const result = validateCompiledLinkTarget('./removed-module.ts', buildSlugRegistry('# Out'), {
        outputFile: out,
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('missing file');
    });
  });

  it('accepts a compiled link to a source file that exists', () => {
    withTmpDir('mdcp-compiled-src-ok-', (work) => {
      const out = join(work, 'out.md');
      writeFileSync(out, '# Out\n');
      writeFileSync(join(work, 'live.ts'), 'export const x = 1;\n');
      const result = validateCompiledLinkTarget('./live.ts#L1', buildSlugRegistry('# Out'), {
        outputFile: out,
      });
      expect(result.valid).toBe(true);
    });
  });
});

describe('lintLinks over standaloneGuides', () => {
  function workspace(work: string) {
    mkdirSync(join(work, 'g'), { recursive: true });
    writeFileSync(join(work, 'g', 'index.md'), '# G\n\n- [s](s.md)\n');
    writeFileSync(join(work, 'g', 's.md'), '# G\n\n## Hi\n');
    return compileGuideResults({
      guidesRoot: work,
      compileOrder: ['g'],
      docsRoot: work,
      config: { outputDir: '.', compileOrder: ['g'] },
      guides: [
        { name: 'g', path: 'g', compile: { outputFile: 'out.md', links: { markBroken: false } } },
      ],
    });
  }

  it('reports a dead link in a file registered as a standalone guide', () => {
    withTmpDir('mdcp-standalone-', (work) => {
      const results = workspace(work);
      writeFileSync(join(work, 'CHARTER.md'), '# Charter\n\n[component](./removed/thing.ts)\n');
      const config = MdcpConfigSchema.parse({
        compileOrder: ['g'],
        outputDir: '.',
        standaloneGuides: ['CHARTER.md'],
      });
      const issues = lintLinks({ config, docsRoot: work, results, scanRoot: work });
      const standalone = issues.filter((i) => i.file.endsWith('CHARTER.md'));
      expect(standalone).toHaveLength(1);
      expect(standalone[0].kind).toBe('missing file');
    });
  });

  it('expands standalone globs and leaves clean standalone guides alone', () => {
    withTmpDir('mdcp-standalone-glob-', (work) => {
      const results = workspace(work);
      mkdirSync(join(work, 'skills', 'a'), { recursive: true });
      writeFileSync(join(work, 'skills', 'a', 'SKILL.md'), '# A\n\n[gone](../../nope.md)\n');
      writeFileSync(join(work, 'CLEAN.md'), '# Clean\n\n[g](./g/s.md)\n');
      const config = MdcpConfigSchema.parse({
        compileOrder: ['g'],
        outputDir: '.',
        standaloneGuides: ['skills/**/*.md', 'CLEAN.md'],
      });
      const issues = lintLinks({ config, docsRoot: work, results, scanRoot: work });
      expect(issues.filter((i) => i.file.endsWith('SKILL.md'))).toHaveLength(1);
      expect(issues.filter((i) => i.file.endsWith('CLEAN.md'))).toHaveLength(0);
    });
  });

  it('skips standalone guides when no scan root is given', () => {
    withTmpDir('mdcp-standalone-off-', (work) => {
      const results = workspace(work);
      writeFileSync(join(work, 'CHARTER.md'), '# Charter\n\n[component](./removed/thing.ts)\n');
      const config = MdcpConfigSchema.parse({
        compileOrder: ['g'],
        outputDir: '.',
        standaloneGuides: ['CHARTER.md'],
      });
      const issues = lintLinks({ config, docsRoot: work, results });
      expect(issues.filter((i) => i.file.endsWith('CHARTER.md'))).toHaveLength(0);
    });
  });
});

describe('configurable source extensions for links', () => {
  it('defaults cover more than one ecosystem', () => {
    for (const path of [
      'src/a.ts',
      'app/main.py',
      'cmd/serve.go',
      'lib/thing.rb',
      'src/Main.java',
      'infra/main.tf',
      'policy/access.rego',
      'schema/user.proto',
      'build.gradle',
      'deploy/values.yaml',
    ]) {
      expect(hasSourceExtension(path)).toBe(true);
    }
    expect(hasSourceExtension('notes.md')).toBe(false);
    expect(hasSourceExtension('src/thing.unheardof')).toBe(false);
  });

  it('accepts an extension a repository adds in config', () => {
    const extensions = sourceExtensionSet(['unheardof', '.alsoOK']);
    expect(hasSourceExtension('src/thing.unheardof', extensions)).toBe(true);
    expect(hasSourceExtension('src/thing.ALSOOK', extensions)).toBe(true);
    expect(hasSourceExtension('src/thing.ts', extensions)).toBe(true);
  });

  it('validates a link whose extension comes only from config', () => {
    withTmpDir('mdcp-ext-link-', (work) => {
      const guideDir = join(work, 'g');
      mkdirSync(guideDir, { recursive: true });
      const shard = join(guideDir, 'section.md');
      writeFileSync(shard, '## S\n\n[rules](./gone.unheardof)\n');
      expect(lintShardLinks({ shardFile: shard, guideDir })).toEqual([]);
      const issues = lintShardLinks({
        shardFile: shard,
        guideDir,
        sourceExtensions: sourceExtensionSet(['unheardof']),
      });
      expect(issues.map((i) => i.kind)).toEqual(['missing file']);
    });
  });
});

describe('codeEvidence rebases source links without a line fragment', () => {
  it('rebases a data-file link for output published elsewhere', () => {
    withTmpDir('mdcp-evidence-data-', (work) => {
      const guideDir = join(work, 'g');
      mkdirSync(guideDir, { recursive: true });
      mkdirSync(join(work, 'out'), { recursive: true });
      writeFileSync(join(guideDir, 'measurements.csv'), 'a,b\n1,2\n');
      const body = codeEvidenceHook({
        guideName: 'g',
        filename: 'section.md',
        body: 'Source: [measurements](./measurements.csv)\n',
        config: { compileOrder: ['g'] },
        sourceFile: join(guideDir, 'section.md'),
        outputFile: join(work, 'out', 'guide.md'),
      });
      expect(body).toContain('](../g/measurements.csv)');
    });
  });

  it('leaves a link alone when its target does not resolve', () => {
    withTmpDir('mdcp-evidence-unresolved-', (work) => {
      const guideDir = join(work, 'g');
      mkdirSync(guideDir, { recursive: true });
      const body = codeEvidenceHook({
        guideName: 'g',
        filename: 'section.md',
        body: 'Source: [gone](./gone.csv)\n',
        config: { compileOrder: ['g'] },
        sourceFile: join(guideDir, 'section.md'),
        outputFile: join(work, 'out', 'guide.md'),
      });
      expect(body).toContain('](./gone.csv)');
    });
  });
});
