/**
 * Cross-guide link rewriting — tests driven by the spec in
 * docs/client-core/compile-hooks/cross-guide-links.md.
 */
import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildGuideLinkIndex } from '../src/compile/guide-link-index.js';
import { rewriteCrossGuideFileLinks } from '../src/compile/publish-links.js';
import { compileGuideResults, writeCompiledGuides } from '../src/compile/assemble.js';
import type { CompileOptionsInput } from '../src/compile/assemble.js';
import { withTmpDir } from './helpers/tmp-dir.js';

function writeThreeGuideFixture(
  work: string,
  glossaryCompile?: CompileOptionsInput['guides'] extends (infer G)[] | undefined
    ? G extends { compile?: infer C }
      ? C
      : never
    : never,
): CompileOptionsInput {
  mkdirSync(join(work, 'glossary'), { recursive: true });
  mkdirSync(join(work, 'review', 'outcomes'), { recursive: true });
  mkdirSync(join(work, 'technical'), { recursive: true });

  writeFileSync(
    join(work, 'glossary', 'index.md'),
    '# Glossary\n\n## Sections\n\n- [Terms](./terms.md)\n',
  );
  writeFileSync(
    join(work, 'glossary', 'terms.md'),
    '## Terms\n\nSee [FIND-004](../review/outcomes/FIND-004.md) and [Deployment](../technical/deployment.md).\n',
  );

  writeFileSync(
    join(work, 'review', 'shards.md'),
    '# Architecture review\n\n## Sections\n\n- [Outcomes](./review-outcomes.md)\n',
  );
  writeFileSync(
    join(work, 'review', 'review-outcomes.md'),
    '## Review outcomes\n\nDetails in [FIND-004](./outcomes/FIND-004.md).\n',
  );
  writeFileSync(
    join(work, 'review', 'outcomes', 'FIND-004.md'),
    '# FIND-004 — Example finding\n\nFinding body.\n',
  );

  writeFileSync(
    join(work, 'technical', 'index.md'),
    '# Technical guide\n\n## Sections\n\n- [Deployment](./deployment.md)\n',
  );
  writeFileSync(join(work, 'technical', 'deployment.md'), '# Deployment\n\nDeploy steps.\n');

  return {
    guidesRoot: work,
    compileOrder: ['glossary', 'architecture-review', 'technical-guide'],
    docsRoot: work,
    config: {
      outputDir: '.',
      compileOrder: ['glossary', 'architecture-review', 'technical-guide'],
    },
    guides: [
      {
        name: 'glossary',
        path: 'glossary',
        compile: {
          scopeRoot: '.',
          outputFile: 'glossary.md',
          sectionsHeading: 'Sections',
          ...glossaryCompile,
        },
      },
      {
        name: 'architecture-review',
        path: 'review',
        compile: {
          scopeRoot: '.',
          manifest: 'shards.md',
          outputFile: 'architecture-review.md',
          sectionsHeading: 'Sections',
        },
      },
      {
        name: 'technical-guide',
        path: 'technical',
        compile: {
          scopeRoot: '.',
          outputFile: 'technical-guide.md',
          sectionsHeading: 'Sections',
        },
      },
    ],
  };
}

function writeConsumerFixture(work: string): CompileOptionsInput {
  mkdirSync(join(work, 'glossary'), { recursive: true });
  mkdirSync(join(work, 'review', 'outcomes'), { recursive: true });

  writeFileSync(
    join(work, 'glossary', 'index.md'),
    '# Glossary\n\n## Sections\n\n- [Terms](./terms.md)\n',
  );
  writeFileSync(
    join(work, 'glossary', 'terms.md'),
    '## Terms\n\nSee [FIND-004](../review/outcomes/FIND-004.md).\n',
  );

  writeFileSync(
    join(work, 'review', 'shards.md'),
    '# Architecture review\n\n## Sections\n\n- [Outcomes](./review-outcomes.md)\n',
  );
  writeFileSync(
    join(work, 'review', 'review-outcomes.md'),
    '## Review outcomes\n\nDetails in [FIND-004](./outcomes/FIND-004.md).\n',
  );
  writeFileSync(
    join(work, 'review', 'outcomes', 'FIND-004.md'),
    '# FIND-004 — Example finding\n\nFinding body.\n',
  );

  return {
    guidesRoot: work,
    compileOrder: ['glossary', 'architecture-review'],
    docsRoot: work,
    config: { outputDir: '.', compileOrder: ['glossary', 'architecture-review'] },
    guides: [
      {
        name: 'glossary',
        path: 'glossary',
        compile: {
          scopeRoot: '.',
          outputFile: 'glossary.md',
          sectionsHeading: 'Sections',
        },
      },
      {
        name: 'architecture-review',
        path: 'review',
        compile: {
          scopeRoot: '.',
          manifest: 'shards.md',
          outputFile: 'architecture-review.md',
          sectionsHeading: 'Sections',
        },
      },
    ],
  };
}

describe('cross-guide link rewriting', () => {
  it('buildGuideLinkIndex maps shard paths to output basenames and slugs', () => {
    withTmpDir('mdcp-link-index-', (work) => {
      const opts = writeConsumerFixture(work);
      const index = buildGuideLinkIndex(opts, work);

      const finding = join(work, 'review', 'outcomes', 'FIND-004.md');
      expect(index.get(finding)).toEqual({
        guideName: 'architecture-review',
        outputBasename: 'architecture-review.md',
        slug: 'find-004',
      });

      const terms = join(work, 'glossary', 'terms.md');
      expect(index.get(terms)).toEqual({
        guideName: 'glossary',
        outputBasename: 'glossary.md',
        slug: 'terms',
      });
    });
  });

  it('rewriteCrossGuideFileLinks targets another guide output with finding slug', () => {
    withTmpDir('mdcp-cross-rewrite-', (work) => {
      const opts = writeConsumerFixture(work);
      const index = buildGuideLinkIndex(opts, work);
      const sourceFile = join(work, 'glossary', 'terms.md');

      const out = rewriteCrossGuideFileLinks('See [FIND-004](../review/outcomes/FIND-004.md).', {
        sourceFile,
        guideDir: join(work, 'glossary'),
        scopeRoot: work,
        currentOutputBasename: 'glossary.md',
        linkIndex: index,
      });

      expect(out).toBe('See [FIND-004](architecture-review.md#find-004).');
    });
  });

  it('rewriteCrossGuideFileLinks uses in-document anchors within the same output', () => {
    withTmpDir('mdcp-same-output-', (work) => {
      const opts = writeConsumerFixture(work);
      const index = buildGuideLinkIndex(opts, work);
      const sourceFile = join(work, 'review', 'review-outcomes.md');

      const out = rewriteCrossGuideFileLinks('See [FIND-004](./outcomes/FIND-004.md).', {
        sourceFile,
        guideDir: join(work, 'review'),
        scopeRoot: work,
        currentOutputBasename: 'architecture-review.md',
        linkIndex: index,
      });

      expect(out).toBe('See [FIND-004](#find-004).');
    });
  });

  it('rewriteCrossGuideFileLinks preserves explicit fragments', () => {
    withTmpDir('mdcp-fragment-', (work) => {
      const opts = writeConsumerFixture(work);
      const index = buildGuideLinkIndex(opts, work);
      const sourceFile = join(work, 'glossary', 'terms.md');

      const out = rewriteCrossGuideFileLinks(
        '[FIND-004](../review/outcomes/FIND-004.md#custom-anchor).',
        {
          sourceFile,
          guideDir: join(work, 'glossary'),
          scopeRoot: work,
          currentOutputBasename: 'glossary.md',
          linkIndex: index,
        },
      );

      expect(out).toBe('[FIND-004](architecture-review.md#custom-anchor).');
    });
  });

  it('compileGuideResults rewrites cross-monolith links in consumer layout', () => {
    withTmpDir('mdcp-consumer-compile-', (work) => {
      const opts = writeConsumerFixture(work);
      writeCompiledGuides(opts, join(work, 'guides.md'));

      const glossary = readFileSync(join(work, 'glossary.md'), 'utf-8');
      expect(glossary).toContain('[FIND-004](architecture-review.md#find-004)');
      expect(glossary).not.toMatch(/\]\(\.\.\/review\/outcomes\/FIND-004\.md\)/);

      const review = readFileSync(join(work, 'architecture-review.md'), 'utf-8');
      expect(review).toContain('[FIND-004](#find-004)');
      expect(review).not.toMatch(/\]\(\.\/outcomes\/FIND-004\.md\)/);
    });
  });

  describe('three guides — hub links to two outputs', () => {
    it('buildGuideLinkIndex maps each shard to its guide output', () => {
      withTmpDir('mdcp-three-index-', (work) => {
        const opts = writeThreeGuideFixture(work);
        const index = buildGuideLinkIndex(opts, work);

        expect(index.get(join(work, 'review', 'outcomes', 'FIND-004.md'))).toEqual({
          guideName: 'architecture-review',
          outputBasename: 'architecture-review.md',
          slug: 'find-004',
        });
        expect(index.get(join(work, 'technical', 'deployment.md'))).toEqual({
          guideName: 'technical-guide',
          outputBasename: 'technical-guide.md',
          slug: 'deployment',
        });
      });
    });

    it('rewriteCrossGuideFileLinks routes each link to the correct output file', () => {
      withTmpDir('mdcp-three-rewrite-', (work) => {
        const opts = writeThreeGuideFixture(work);
        const index = buildGuideLinkIndex(opts, work);
        const sourceFile = join(work, 'glossary', 'terms.md');
        const input =
          'See [FIND-004](../review/outcomes/FIND-004.md) and [Deployment](../technical/deployment.md).';

        const out = rewriteCrossGuideFileLinks(input, {
          sourceFile,
          guideDir: join(work, 'glossary'),
          scopeRoot: work,
          currentOutputBasename: 'glossary.md',
          linkIndex: index,
        });

        expect(out).toBe(
          'See [FIND-004](architecture-review.md#find-004) and [Deployment](technical-guide.md#deployment).',
        );
      });
    });

    it('compileGuideResults rewrites each cross-guide link to its native output', () => {
      withTmpDir('mdcp-three-compile-', (work) => {
        const opts = writeThreeGuideFixture(work);
        writeCompiledGuides(opts, join(work, 'guides.md'));

        const glossary = readFileSync(join(work, 'glossary.md'), 'utf-8');
        expect(glossary).toContain('[FIND-004](architecture-review.md#find-004)');
        expect(glossary).toContain('[Deployment](technical-guide.md#deployment)');
        expect(glossary).not.toMatch(/\]\(\.\.\/review\/outcomes\/FIND-004\.md\)/);
        expect(glossary).not.toMatch(/\]\(\.\.\/technical\/deployment\.md\)/);
      });
    });

    it('ignoreGuides keeps shard paths for listed guides only', () => {
      withTmpDir('mdcp-ignore-guides-', (work) => {
        const opts = writeThreeGuideFixture(work, {
          crossGuideLinks: { ignoreGuides: ['technical-guide'] },
        });
        writeCompiledGuides(opts, join(work, 'guides.md'));

        const glossary = readFileSync(join(work, 'glossary.md'), 'utf-8');
        expect(glossary).toContain('[FIND-004](architecture-review.md#find-004)');
        expect(glossary).toContain('[Deployment](../technical/deployment.md)');
        expect(glossary).not.toContain('[Deployment](technical-guide.md#deployment)');
      });
    });

    it('rewriteCrossGuideFileLinks honors ignoreGuides per target guide', () => {
      withTmpDir('mdcp-ignore-rewrite-', (work) => {
        const opts = writeThreeGuideFixture(work);
        const index = buildGuideLinkIndex(opts, work);
        const sourceFile = join(work, 'glossary', 'terms.md');
        const input =
          'See [FIND-004](../review/outcomes/FIND-004.md) and [Deployment](../technical/deployment.md).';

        const out = rewriteCrossGuideFileLinks(input, {
          sourceFile,
          guideDir: join(work, 'glossary'),
          scopeRoot: work,
          currentOutputBasename: 'glossary.md',
          linkIndex: index,
          ignoreGuides: ['technical-guide'],
        });

        expect(out).toBe(
          'See [FIND-004](architecture-review.md#find-004) and [Deployment](../technical/deployment.md).',
        );
      });
    });
  });

  it('compileGuideResults leaves unresolved markdown links unchanged', () => {
    withTmpDir('mdcp-unresolved-', (work) => {
      mkdirSync(join(work, 'glossary'), { recursive: true });
      writeFileSync(
        join(work, 'glossary', 'index.md'),
        '# Glossary\n\n## Sections\n\n- [Terms](./terms.md)\n',
      );
      writeFileSync(
        join(work, 'glossary', 'terms.md'),
        '## Terms\n\nSee [Missing](../missing/shard.md).\n',
      );

      const results = compileGuideResults({
        guidesRoot: work,
        compileOrder: ['glossary'],
        docsRoot: work,
        guides: [
          {
            name: 'glossary',
            path: 'glossary',
            compile: {
              scopeRoot: '.',
              outputFile: 'glossary.md',
              sectionsHeading: 'Sections',
            },
          },
        ],
      });

      expect(results[0].text).toContain('[Missing](../missing/shard.md)');
    });
  });
});
