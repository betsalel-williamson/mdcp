/**
 * Built-in link validation — tests driven by docs/features/link-validation.md.
 */
import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { extractLinks } from '../src/links/extract.js';
import { markBrokenLinks, formatBrokenLinkMarker } from '../src/links/mark-broken.js';
import { validateCompiledLinkTarget } from '../src/links/validate.js';
import { lintShardLinks, collectShardProvenance } from '../src/links/validate-shards.js';
import { lintCompiledLinks } from '../src/links/validate-compiled.js';
import { lintLinks, formatLinkIssue } from '../src/links/lint.js';
import { buildSlugRegistry } from '../src/refs/slugs.js';
import { compileGuideResults } from '../src/compile/assemble.js';
import { MdcpConfigSchema } from '../src/config/schema.js';
import { withTmpDir, withCwd } from './helpers/tmp-dir.js';

describe('extractLinks', () => {
  it('extracts links with line numbers', () => {
    const md = '# Title\n\nSee [doc](./other.md) here.\n';
    const links = extractLinks(md);
    expect(links).toHaveLength(1);
    expect(links[0].label).toBe('doc');
    expect(links[0].target).toBe('./other.md');
    expect(links[0].line).toBe(3);
  });

  it('skips links inside fenced code blocks', () => {
    const md = '```\n[not a link](./x.md)\n```\n[real](./y.md)\n';
    const links = extractLinks(md);
    expect(links).toHaveLength(1);
    expect(links[0].target).toBe('./y.md');
  });

  it('skips links inside inline code spans', () => {
    const md = 'Use `[label](#slug)` syntax.\n[real](./y.md)\n';
    const links = extractLinks(md);
    expect(links).toHaveLength(1);
    expect(links[0].target).toBe('./y.md');
  });

  it('skips links inside double-backtick code spans', () => {
    const md = 'Example `` `[x](./a.md)` `` here.\n';
    expect(extractLinks(md)).toHaveLength(0);
  });
});

describe('markBrokenLinks', () => {
  it('replaces dead anchor with marker showing label, original target, broken target', () => {
    const md = '# Guide\n\n## Section\n\nSee [bad](#missing-slug).\n';
    const { markdown, issues } = markBrokenLinks(md, {
      provenance: [
        {
          label: 'bad',
          originalTarget: '#missing-slug',
          sourceFile: '/docs/client/consumer.md',
          sourceLine: 5,
        },
      ],
      enabled: true,
    });
    expect(markdown).toContain('**BROKEN LINK:**');
    expect(markdown).toContain('"bad"');
    expect(markdown).not.toMatch(/\]\(#missing-slug\)/);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('does not replace unresolved .md paths (peer / shard validation)', () => {
    const md = 'Link [Missing](./gone.md) here.\n';
    const { markdown } = markBrokenLinks(md, {
      enabled: true,
      outputFile: '/out/guide.md',
    });
    expect(markdown).toContain('[Missing](./gone.md)');
    expect(markdown).not.toContain('**BROKEN LINK:**');
  });

  it('leaves link unchanged when disabled', () => {
    const md = '[bad](#missing-slug)\n';
    const { markdown } = markBrokenLinks(md, { enabled: false });
    expect(markdown).toBe(md);
  });
});

describe('formatBrokenLinkMarker', () => {
  it('formats marker prose', () => {
    expect(formatBrokenLinkMarker('T', './a.md', '#x', 'dead anchor in compiled guide')).toBe(
      '**BROKEN LINK:** "T" (`./a.md`) → `#x` (dead anchor in compiled guide)',
    );
  });
});

describe('validateCompiledLinkTarget', () => {
  it('accepts existing slug', () => {
    const md = '# Guide\n\n## Hello\n\n[link](#hello)\n';
    const registry = buildSlugRegistry(md);
    expect(validateCompiledLinkTarget('#hello', registry).valid).toBe(true);
  });

  it('rejects dead anchor', () => {
    const registry = buildSlugRegistry('# Guide\n\n## Hello\n');
    const r = validateCompiledLinkTarget('#missing', registry);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('dead anchor');
  });

  it('rejects indexed shard paths in publish-only output', () => {
    withTmpDir('mdcp-publish-shard-', (work) => {
      const shard = join(work, 'features', 'legacy.md');
      mkdirSync(join(work, 'features'), { recursive: true });
      writeFileSync(shard, '# Legacy\n');
      const publishOut = join(work, 'packages', 'cli', 'README.md');
      mkdirSync(dirname(publishOut), { recursive: true });
      writeFileSync(publishOut, '# CLI\n');

      const r = validateCompiledLinkTarget(
        '../../docs/features/legacy.md',
        buildSlugRegistry('# CLI\n'),
        {
          outputFile: publishOut,
          publishOnly: true,
          allowedPublishPaths: new Set([publishOut]),
          disallowedShardPaths: new Set([shard]),
        },
      );
      expect(r.valid).toBe(false);
      expect(r.reason).toBe('missing publish path');
    });
  });

  it('allows non-indexed .md paths that exist in publish-only output', () => {
    withTmpDir('mdcp-publish-example-', (work) => {
      const example = join(work, 'examples', 'prompt.md');
      mkdirSync(join(work, 'examples'), { recursive: true });
      writeFileSync(example, '# Prompt\n');
      const publishOut = join(work, 'packages', 'cli', 'README.md');
      mkdirSync(dirname(publishOut), { recursive: true });
      writeFileSync(publishOut, '# CLI\n');

      const r = validateCompiledLinkTarget(
        '../../examples/prompt.md',
        buildSlugRegistry('# CLI\n'),
        {
          outputFile: publishOut,
          publishOnly: true,
          allowedPublishPaths: new Set([publishOut]),
          disallowedShardPaths: new Set(),
        },
      );
      expect(r.valid).toBe(true);
    });
  });

  it('accepts cross-publish README links by fragment when href path is rewritten', () => {
    withTmpDir('mdcp-cross-publish-', (work) => {
      const cliOut = join(work, 'packages', 'cli', 'README.md');
      const coreOut = join(work, 'packages', 'core', 'README.md');
      mkdirSync(dirname(cliOut), { recursive: true });
      mkdirSync(dirname(coreOut), { recursive: true });
      writeFileSync(coreOut, '# Core\n\n## Cross-guide link rewriting\n\nSpec.\n');
      writeFileSync(cliOut, '# CLI\n\nSee [spec](../core/README.md#cross-guide-link-rewriting).\n');

      const r = validateCompiledLinkTarget(
        '../core/README.md#cross-guide-link-rewriting',
        buildSlugRegistry(readFileSync(cliOut, 'utf-8')),
        {
          outputFile: cliOut,
          publishOnly: true,
          allowedPublishPaths: new Set([cliOut, coreOut]),
          disallowedShardPaths: new Set(),
        },
      );
      expect(r.valid).toBe(true);
    });
  });
});

describe('lintShardLinks', () => {
  it('reports missing .md at shard path:line', () => {
    withTmpDir('mdcp-lint-shard-', (work) => {
      const guideDir = join(work, 'g');
      mkdirSync(guideDir, { recursive: true });
      const shard = join(guideDir, 'section.md');
      writeFileSync(shard, '## S\n\n[Missing](./gone.md)\n');
      const issues = lintShardLinks({ shardFile: shard, guideDir });
      expect(issues.some((i) => i.kind === 'missing file')).toBe(true);
      expect(issues[0].file).toBe(shard);
    });
  });

  it('reports dead #fragment in same shard', () => {
    withTmpDir('mdcp-lint-frag-', (work) => {
      const guideDir = join(work, 'g');
      mkdirSync(guideDir, { recursive: true });
      const shard = join(guideDir, 'section.md');
      writeFileSync(shard, '## S\n\n[bad](#no-such-heading)\n');
      const issues = lintShardLinks({ shardFile: shard, guideDir });
      expect(issues.some((i) => i.kind === 'dead anchor')).toBe(true);
    });
  });
});

describe('lintCompiledLinks', () => {
  it('reports dead #slug after demotion', () => {
    const md = '# Guide\n\n## Real\n\n[bad](#fake-slug)\n';
    const issues = lintCompiledLinks({
      markdown: md,
      outputFile: '/out/guide.md',
    });
    expect(issues.some((i) => i.kind === 'dead anchor')).toBe(true);
  });

  it('detects BROKEN LINK markers in output', () => {
    const md = '**BROKEN LINK:** "X" (`./a.md`) → `#x` (dead anchor)\n';
    const issues = lintCompiledLinks({ markdown: md, outputFile: '/out.md' });
    expect(issues.length).toBe(1);
  });

  it('ignores BROKEN LINK examples inside fenced code blocks', () => {
    const md = '```markdown\n**BROKEN LINK:** "X" (`./a.md`) → `#x` (dead anchor)\n```\n';
    const issues = lintCompiledLinks({ markdown: md, outputFile: '/out.md' });
    expect(issues).toHaveLength(0);
  });
});

describe('formatLinkIssue', () => {
  it('uses link: prefix for error severity', () => {
    const msg = formatLinkIssue(
      {
        kind: 'dead anchor',
        file: 'a.md',
        line: 1,
        label: 'L',
        originalTarget: './x.md',
        brokenTarget: '#x',
      },
      'error',
    );
    expect(msg).toMatch(/^link: a\.md:1:/);
  });

  it('uses link-warn: prefix for warn severity', () => {
    const msg = formatLinkIssue(
      {
        kind: 'dead anchor',
        file: 'a.md',
        line: 1,
        label: 'L',
        originalTarget: './x.md',
        brokenTarget: '#x',
      },
      'warn',
    );
    expect(msg).toMatch(/^link-warn: a\.md:1:/);
  });
});

describe('lintLinks', () => {
  it('aggregates compiled issues', () => {
    withTmpDir('mdcp-lint-links-', (work) => {
      mkdirSync(join(work, 'g'), { recursive: true });
      writeFileSync(join(work, 'g', 'index.md'), '# G\n\n- [s](s.md)\n');
      writeFileSync(join(work, 'g', 's.md'), '# G\n\n## Hi\n\n[bad](#nope)\n');
      const results = compileGuideResults({
        guidesRoot: work,
        compileOrder: ['g'],
        docsRoot: work,
        config: { outputDir: '.', compileOrder: ['g'] },
        guides: [
          {
            name: 'g',
            path: 'g',
            compile: { outputFile: 'out.md', links: { markBroken: false } },
          },
        ],
      });
      const issues = lintLinks({
        config: MdcpConfigSchema.parse({ compileOrder: ['g'], outputDir: '.' }),
        docsRoot: work,
        results,
      });
      expect(issues.length).toBeGreaterThan(0);
    });
  });
});

describe('compileGuideResults link validation e2e', () => {
  it('rewrites cross-guide publish link to guides.md#slug after index ownership fix', () => {
    withTmpDir('mdcp-publish-broken-', (work) => {
      mkdirSync(join(work, 'features'), { recursive: true });
      mkdirSync(join(work, 'client-cli'), { recursive: true });

      writeFileSync(
        join(work, 'features', 'index.md'),
        '# Features\n\n## Sections\n\n- [Legacy](./legacy-migration.md)\n',
      );
      writeFileSync(
        join(work, 'features', 'legacy-migration.md'),
        '# Legacy migration\n\nContent.\n',
      );

      writeFileSync(
        join(work, 'client-cli', 'index.md'),
        '# CLI\n\n## Sections\n\n- [Consumer](./consumer.md)\n',
      );
      writeFileSync(
        join(work, 'client-cli', 'consumer.md'),
        '# CLI\n\n## Consumer\n\nSee [Legacy](../features/legacy-migration.md).\n',
      );

      const results = compileGuideResults({
        guidesRoot: work,
        compileOrder: ['features', 'client-cli'],
        docsRoot: work,
        config: {
          outputDir: '.',
          outputFile: 'guides.md',
          compileOrder: ['features', 'client-cli'],
        },
        guides: [
          { name: 'features' },
          {
            name: 'client-cli',
            compile: { outputFile: 'README.md', links: { markBroken: true } },
          },
        ],
      });

      const readme = results.find((r) => r.name === 'client-cli')!.text;
      expect(readme).toContain('guides.md#legacy-migration');
      expect(readme).not.toContain('**BROKEN LINK:**');
    });
  });

  it('ignoreGuides keeps shard paths and lint flags them in publish output', () => {
    withTmpDir('mdcp-ignore-features-', (work) => {
      const docsRoot = join(work, 'docs');
      mkdirSync(join(docsRoot, 'features'), { recursive: true });
      mkdirSync(join(docsRoot, 'client-cli'), { recursive: true });
      mkdirSync(join(work, 'packages', 'cli'), { recursive: true });

      writeFileSync(
        join(docsRoot, 'features', 'index.md'),
        '# Features\n\n## Sections\n\n- [Legacy](./legacy-migration.md)\n',
      );
      writeFileSync(join(docsRoot, 'features', 'legacy-migration.md'), '# Legacy migration\n');

      writeFileSync(
        join(docsRoot, 'client-cli', 'index.md'),
        '# CLI\n\n## Sections\n\n- [Consumer](./consumer.md)\n',
      );
      writeFileSync(
        join(docsRoot, 'client-cli', 'consumer.md'),
        '## Consumer\n\n[Legacy](../features/legacy-migration.md)\n',
      );

      const compileOptions = {
        guidesRoot: docsRoot,
        compileOrder: ['features', 'client-cli'],
        docsRoot,
        config: {
          outputDir: '.',
          outputFile: 'guides.md',
          compileOrder: ['features', 'client-cli'],
        },
        guides: [
          { name: 'features' },
          {
            name: 'client-cli',
            compile: {
              outputFile: '../../packages/cli/README.md',
              crossGuideLinks: { ignoreGuides: ['features'] },
              links: { markBroken: true },
            },
          },
        ],
      };

      const results = compileGuideResults(compileOptions);

      const readme = results.find((r) => r.name === 'client-cli')!.text;
      expect(readme).toMatch(/\[Legacy\]\([^)]*features\/legacy-migration\.md\)/);
      expect(readme).not.toContain('guides.md#legacy-migration');
      expect(readme).not.toContain('**BROKEN LINK:**');

      const issues = lintLinks({
        config: MdcpConfigSchema.parse({
          compileOrder: ['features', 'client-cli'],
          outputDir: '.',
          outputFile: 'guides.md',
        }),
        docsRoot,
        results,
        compileOptions,
      });
      expect(
        issues.some(
          (i) =>
            i.guideName === 'client-cli' &&
            i.kind === 'missing publish path' &&
            i.originalTarget.includes('legacy-migration.md'),
        ),
      ).toBe(true);
    });
  });

  it('keeps cross-publish README paths when linking between publish outputs', () => {
    withTmpDir('mdcp-cross-publish-compile-', (work) => {
      const docsRoot = join(work, 'docs');
      mkdirSync(join(docsRoot, 'client-cli'), { recursive: true });
      mkdirSync(join(docsRoot, 'client-core', 'compile-hooks'), { recursive: true });
      mkdirSync(join(work, 'packages', 'cli'), { recursive: true });
      mkdirSync(join(work, 'packages', 'core'), { recursive: true });

      writeFileSync(
        join(docsRoot, 'client-core', 'index.md'),
        '# Core\n\n## Sections\n\n- [Cross-guide](./compile-hooks/cross-guide-links.md)\n',
      );
      writeFileSync(
        join(docsRoot, 'client-core', 'compile-hooks', 'cross-guide-links.md'),
        '# Cross-guide link rewriting\n\nSpec.\n',
      );
      writeFileSync(
        join(docsRoot, 'client-cli', 'index.md'),
        '# CLI\n\n## Sections\n\n- [Glossary](./glossary.md)\n',
      );
      writeFileSync(
        join(docsRoot, 'client-cli', 'glossary.md'),
        '## ignoreGuides\n\nSee [Cross-guide](../client-core/compile-hooks/cross-guide-links.md).\n',
      );

      const compileOptions = {
        guidesRoot: docsRoot,
        compileOrder: ['client-core', 'client-cli'],
        docsRoot,
        config: {
          outputDir: '.',
          compileOrder: ['client-core', 'client-cli'],
        },
        guides: [
          {
            name: 'client-core',
            compile: { outputFile: '../../packages/core/README.md' },
          },
          {
            name: 'client-cli',
            compile: { outputFile: '../../packages/cli/README.md' },
          },
        ],
      };

      const results = compileGuideResults(compileOptions);
      writeFileSync(
        join(work, 'packages', 'core', 'README.md'),
        results.find((r) => r.name === 'client-core')!.text,
      );
      writeFileSync(
        join(work, 'packages', 'cli', 'README.md'),
        results.find((r) => r.name === 'client-cli')!.text,
      );

      const readme = results.find((r) => r.name === 'client-cli')!.text;
      expect(readme).toContain('../core/README.md#cross-guide-link-rewriting');
      expect(readme).not.toContain('../../docs/core/README.md');

      const issues = lintLinks({
        config: MdcpConfigSchema.parse({
          compileOrder: ['client-core', 'client-cli'],
          outputDir: '.',
        }),
        docsRoot,
        results,
        compileOptions,
      });
      expect(issues.some((i) => i.originalTarget.includes('core/README.md'))).toBe(false);
    });
  });

  it('flags disallowed shard links when docsRoot is relative', () => {
    withTmpDir('mdcp-ignore-rel-root-', (work) => {
      withCwd(work, () => {
        const docsRoot = join(work, 'docs');
        mkdirSync(join(docsRoot, 'features'), { recursive: true });
        mkdirSync(join(docsRoot, 'client-cli'), { recursive: true });
        mkdirSync(join(work, 'packages', 'cli'), { recursive: true });

        writeFileSync(
          join(docsRoot, 'features', 'index.md'),
          '# Features\n\n- [Legacy](./legacy.md)\n',
        );
        writeFileSync(join(docsRoot, 'features', 'legacy.md'), '# Legacy\n');
        writeFileSync(
          join(docsRoot, 'client-cli', 'index.md'),
          '# CLI\n\n- [Consumer](./consumer.md)\n',
        );
        writeFileSync(
          join(docsRoot, 'client-cli', 'consumer.md'),
          '## Consumer\n\n[Legacy](../features/legacy.md)\n',
        );

        const compileOptions = {
          guidesRoot: 'docs',
          compileOrder: ['features', 'client-cli'],
          docsRoot: 'docs',
          config: {
            outputDir: '.',
            outputFile: 'guides.md',
            compileOrder: ['features', 'client-cli'],
          },
          guides: [
            { name: 'features' },
            {
              name: 'client-cli',
              compile: {
                outputFile: '../../packages/cli/README.md',
                crossGuideLinks: { ignoreGuides: ['features'] },
              },
            },
          ],
        };

        const results = compileGuideResults(compileOptions);
        const issues = lintLinks({
          config: MdcpConfigSchema.parse({
            compileOrder: ['features', 'client-cli'],
            outputDir: '.',
            outputFile: 'guides.md',
          }),
          docsRoot: 'docs',
          results,
          compileOptions,
        });
        expect(issues.some((i) => i.kind === 'missing publish path')).toBe(true);
      });
    });
  });
});

describe('collectShardProvenance', () => {
  it('collects original targets from shard', () => {
    withTmpDir('mdcp-prov-', (work) => {
      const f = join(work, 'a.md');
      writeFileSync(f, '[L](../b.md)\n');
      const p = collectShardProvenance(f);
      expect(p[0].originalTarget).toBe('../b.md');
    });
  });
});
