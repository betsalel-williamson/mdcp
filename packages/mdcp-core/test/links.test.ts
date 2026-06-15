/**
 * Built-in link validation — tests driven by docs/features/link-validation.md.
 */
import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { extractLinks } from '../src/links/extract.js';
import { markBrokenLinks, formatBrokenLinkMarker } from '../src/links/mark-broken.js';
import { validateCompiledLinkTarget } from '../src/links/validate.js';
import { lintShardLinks, collectShardProvenance } from '../src/links/validate-shards.js';
import { lintCompiledLinks } from '../src/links/validate-compiled.js';
import { lintLinks, formatLinkIssue } from '../src/links/lint.js';
import { buildSlugRegistry } from '../src/refs/slugs.js';
import { compileGuideResults } from '../src/compile/assemble.js';
import { MdcpConfigSchema } from '../src/config/schema.js';
import { withTmpDir } from './helpers/tmp-dir.js';

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
