import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  rewriteIntraGuideFileLinks,
  rewritePublishRelativeLinks,
} from '../src/compile/publish-links.js';
import { withTmpDir } from './helpers/tmp-dir.js';

describe('publish link rewriting', () => {
  it('rewrites intra-guide .md links to in-document anchors', () => {
    const slugByBasename = new Map([
      ['install-and-quick-start.md', 'install-and-quick-start'],
      ['llm-collaboration.md', 'llm-collaboration'],
      ['agent-integration.md', 'agent-integration'],
    ]);

    const input =
      'Collaborating with an LLM? See [LLM collaboration](./llm-collaboration.md) for details.\n' +
      'Also see [Agent integration](./agent-integration.md#scripts).\n' +
      'External [Legacy migration](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/legacy-migration.md).\n';

    const out = rewriteIntraGuideFileLinks(input, slugByBasename);
    expect(out).toContain('[LLM collaboration](#llm-collaboration)');
    expect(out).toContain('[Agent integration](#scripts)');
    expect(out).toContain(
      '[Legacy migration](https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/legacy-migration.md)',
    );
    expect(out).not.toMatch(/\]\(\.\/llm-collaboration\.md\)/);
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
        '[Preprocessor](../../features/design-constraints/preprocessor-templating.md#preprocessor-templating-out-of-scope).';
      const out = rewritePublishRelativeLinks(input, {
        sourceFile: shard,
        guideDir: join(work, 'docs', 'client-core'),
        currentOutputFile: join(work, 'packages', 'mdcp-core', 'README.md'),
      });

      expect(out).toBe(
        '[Preprocessor](../../docs/features/design-constraints/preprocessor-templating.md#preprocessor-templating-out-of-scope).',
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
});
