import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  buildSectionSlugMap,
  rewriteIntraGuideFileLinks,
  rewritePublishRelativeLinks,
} from '../src/compile/publish-links.js';
import { compileGuideResults } from '../src/compile/assemble.js';
import { withTmpDir } from './helpers/tmp-dir.js';

describe('publish link rewriting', () => {
  it('rewrites intra-guide .md links to in-document anchors', () => {
    const guideDir = '/fake/guide';
    const slugByPath = new Map([
      [resolve(guideDir, 'install-and-quick-start.md'), 'install-and-quick-start'],
      [resolve(guideDir, 'llm-collaboration.md'), 'llm-collaboration'],
      [resolve(guideDir, 'agent-integration.md'), 'agent-integration'],
    ]);

    const input =
      'Collaborating with an LLM? See [LLM collaboration](./llm-collaboration.md) for details.\n' +
      'Also see [Agent integration](./agent-integration.md#scripts).\n' +
      'External [Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md).\n';

    const out = rewriteIntraGuideFileLinks(input, slugByPath, guideDir);
    expect(out).toContain('[LLM collaboration](#llm-collaboration)');
    expect(out).toContain('[Agent integration](#scripts)');
    expect(out).toContain(
      '[Feature catalog](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/feature-catalog.md)',
    );
    expect(out).not.toMatch(/\]\(\.\/llm-collaboration\.md\)/);
  });

  it('rewrites co-compiled glossary shard links by basename', () => {
    const guideDir = '/fake/developer';
    const glossaryDir = '/fake/glossary';
    const slugByPath = new Map([
      [resolve(glossaryDir, 'mdcp.md'), 'mdcp'],
      [resolve(glossaryDir, 'gfm.md'), 'gfm'],
    ]);

    const out = rewriteIntraGuideFileLinks(
      '- [MDCP](./mdcp.md)\n- [GFM](./gfm.md)\n',
      slugByPath,
      guideDir,
    );
    expect(out).toBe('- [MDCP](#mdcp)\n- [GFM](#gfm)\n');
  });

  it('rewrites shard-relative repo paths for publish outputs', () => {
    withTmpDir('mdcp-publish-rel-root-', (work) => {
      const docsDeveloper = join(work, 'docs', 'developer');
      mkdirSync(docsDeveloper, { recursive: true });
      mkdirSync(join(work, 'docs', 'features'), { recursive: true });
      writeFileSync(join(work, 'package.json'), '{}');
      writeFileSync(join(work, 'docs', 'mdcp.config.json'), '{}');
      writeFileSync(join(work, 'docs', 'features', 'feature-catalog.md'), '# Catalog\n');
      const shard = join(docsDeveloper, 'guide.md');
      writeFileSync(shard, '# Guide\n');

      const input =
        'See [`package.json`](../../package.json) and [Feature Catalog](../features/feature-catalog.md).\n' +
        'Config: [`docs/mdcp.config.json`](../mdcp.config.json).\n';

      const out = rewritePublishRelativeLinks(input, {
        sourceFile: shard,
        guideDir: docsDeveloper,
        currentOutputFile: join(work, 'DEVELOPERS.md'),
      });

      expect(out).toContain('[`package.json`](package.json)');
      expect(out).toContain('[Feature Catalog](docs/features/feature-catalog.md)');
      expect(out).toContain('[`docs/mdcp.config.json`](docs/mdcp.config.json)');
    });
  });

  it('rewrites nested shard paths for package publish outputs', () => {
    withTmpDir('mdcp-publish-rel-nested-', (work) => {
      const hooksDir = join(work, 'docs', 'client-core', 'compile-hooks');
      mkdirSync(hooksDir, { recursive: true });
      mkdirSync(join(work, 'docs', 'features', 'design-constraints'), { recursive: true });
      writeFileSync(
        join(work, 'docs', 'features', 'design-constraints', 'preprocessor-templating.md'),
        '# Preprocessor\n',
      );
      const shard = join(hooksDir, 'index.md');
      writeFileSync(shard, '# Hooks\n');

      const input =
        '[Preprocessor](../../features/design-constraints/preprocessor-templating.md#preprocessor--templating-out-of-scope).';
      const out = rewritePublishRelativeLinks(input, {
        sourceFile: shard,
        guideDir: join(work, 'docs', 'client-core'),
        currentOutputFile: join(work, 'packages', 'mdcp-core', 'README.md'),
      });

      expect(out).toBe(
        '[Preprocessor](../../docs/features/design-constraints/preprocessor-templating.md#preprocessor--templating-out-of-scope).',
      );
    });
  });

  it('leaves unresolvable cross-publish paths unchanged', () => {
    withTmpDir('mdcp-publish-rel-skip-', (work) => {
      const guideDir = join(work, 'docs', 'client-cli');
      mkdirSync(guideDir, { recursive: true });
      mkdirSync(join(work, 'docs', 'features'), { recursive: true });
      writeFileSync(join(work, 'docs', 'features', 'feature-catalog.md'), '# Catalog\n');
      const shard = join(guideDir, 'section.md');
      writeFileSync(shard, '# Section\n');

      const input =
        '[Cross-guide](../mdcp-core/README.md#cross-guide-link-rewriting) and [Features](../features/feature-catalog.md).';
      const out = rewritePublishRelativeLinks(input, {
        sourceFile: shard,
        guideDir,
        currentOutputFile: join(work, 'packages', 'mdcp-cli', 'README.md'),
      });

      expect(out).toContain('[Cross-guide](../mdcp-core/README.md#cross-guide-link-rewriting)');
      expect(out).toContain('[Features](../../docs/features/feature-catalog.md)');
    });
  });

  it('buildSectionSlugMap keys by full path so nested index.md files get distinct slugs', () => {
    withTmpDir('mdcp-slug-index-collision-', (work) => {
      const guideDir = join(work, 'client-core');
      const hooksDir = join(guideDir, 'compile-hooks');
      mkdirSync(hooksDir, { recursive: true });
      writeFileSync(join(guideDir, 'index.md'), '# Client core\n');
      writeFileSync(join(hooksDir, 'index.md'), '# Compile hooks — overview\n');

      const slugByPath = buildSectionSlugMap([
        join(guideDir, 'index.md'),
        join(hooksDir, 'index.md'),
      ]);

      expect(slugByPath.get(resolve(guideDir, 'index.md'))).toBe('client-core');
      expect(slugByPath.get(resolve(hooksDir, 'index.md'))).toBe('compile-hooks--overview');
    });
  });

  it('rewrites nested index.md intra-guide links using full path slug', () => {
    withTmpDir('mdcp-intra-nested-index-', (work) => {
      const guideDir = join(work, 'client-core');
      const hooksDir = join(guideDir, 'compile-hooks');
      mkdirSync(hooksDir, { recursive: true });
      writeFileSync(join(guideDir, 'index.md'), '# Client core\n');
      writeFileSync(join(hooksDir, 'index.md'), '# Compile hooks — overview\n');

      const slugByPath = buildSectionSlugMap([
        join(guideDir, 'index.md'),
        join(hooksDir, 'index.md'),
      ]);

      const input = 'See [Compile hooks](./compile-hooks/index.md).';
      const out = rewriteIntraGuideFileLinks(input, slugByPath, guideDir);
      expect(out).toBe('See [Compile hooks](#compile-hooks--overview).');
    });
  });

  it('rewrites cross-guide links when label contains ] inside inline code', () => {
    withTmpDir('mdcp-bracket-label-', (work) => {
      mkdirSync(join(work, 'features', 'design-constraints'), { recursive: true });
      mkdirSync(join(work, 'client-core', 'compile-hooks'), { recursive: true });

      writeFileSync(
        join(work, 'features', 'index.md'),
        '# Features\n\n## Sections\n\n- [Constraints](./design-constraints/preprocessor-templating.md)\n',
      );
      writeFileSync(
        join(work, 'features', 'design-constraints', 'preprocessor-templating.md'),
        '# Preprocessor\n\n[`guides[].compile.hooks`](../../client-core/compile-hooks/index.md)\n',
      );
      writeFileSync(
        join(work, 'client-core', 'index.md'),
        '# Core\n\n## Sections\n\n- [Hooks](./compile-hooks/index.md)\n',
      );
      writeFileSync(join(work, 'client-core', 'compile-hooks', 'index.md'), '# Compile hooks\n');

      const results = compileGuideResults({
        guidesRoot: work,
        compileOrder: ['features', 'client-core'],
        docsRoot: work,
        config: {
          outputDir: '.',
          outputFile: 'guides.md',
          compileOrder: ['features', 'client-core'],
        },
        guides: [
          { name: 'features' },
          { name: 'client-core', compile: { outputFile: 'README.md' } },
        ],
      });

      const features = results.find((r) => r.name === 'features')!.text;
      expect(features).toContain('[`guides[].compile.hooks`](README.md#compile-hooks)');
      expect(features).not.toContain('compile-hooks/index.md');
    });
  });

  it('rewrites bare sibling links when sourceFile is outside guideDir', () => {
    const guideDir = '/fake/guide/compiled';
    const sourceFile = '/fake/guide/section-a.md';
    const slugByPath = new Map([
      [resolve('/fake/guide/section-a.md'), 'section-a'],
      [resolve('/fake/guide/topic/section-b.md'), 'section-b'],
      [resolve('/fake/guide/assets/diagram.md'), 'diagram'],
    ]);

    const input =
      'See [Section B](topic/section-b.md) and [Diagram](assets/diagram.md#architecture).';

    const out = rewriteIntraGuideFileLinks(input, slugByPath, guideDir, { sourceFile });
    expect(out).toBe('See [Section B](#section-b) and [Diagram](#architecture).');
  });

  it('e2e: rewrites bare sibling links when guideDir differs from shard tree', () => {
    withTmpDir('mdcp-bare-sibling-e2e-', (work) => {
      const guideBase = join(work, 'guide');
      const guideCompiled = join(guideBase, 'compiled');
      mkdirSync(guideCompiled, { recursive: true });
      mkdirSync(join(guideBase, 'topic'), { recursive: true });
      mkdirSync(join(guideBase, 'assets'), { recursive: true });

      writeFileSync(
        join(guideCompiled, 'shards.md'),
        '- [A](../section-a.md)\n- [B](../topic/section-b.md)\n- [Diag](../assets/diagram.md)\n',
      );
      writeFileSync(
        join(guideBase, 'section-a.md'),
        '# Section A\n\nSee [Topic B](topic/section-b.md) and [Diagram](assets/diagram.md).\n',
      );
      writeFileSync(join(guideBase, 'topic', 'section-b.md'), '# Section B\n');
      writeFileSync(join(guideBase, 'assets', 'diagram.md'), '# Diagram\n');

      const results = compileGuideResults({
        guidesRoot: work,
        compileOrder: ['guide/compiled'],
        docsRoot: work,
        config: {
          outputDir: '.',
          outputFile: 'guides.md',
          compileOrder: ['guide/compiled'],
        },
        guides: [
          {
            name: 'guide/compiled',
            compile: {
              manifest: 'shards.md',
              outputFile: 'my-guide.md',
              scopeRoot: '.',
            },
          },
        ],
      });

      const guideText = results.find((r) => r.name === 'guide/compiled')!.text;
      expect(guideText).toContain('[Topic B](#section-b)');
      expect(guideText).toContain('[Diagram](#diagram)');
      expect(guideText).not.toContain('topic/section-b.md)');
      expect(guideText).not.toContain('assets/diagram.md)');
    });
  });
});
