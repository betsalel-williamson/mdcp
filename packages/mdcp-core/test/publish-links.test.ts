import { describe, it, expect } from 'vitest';
import {
  rewriteIntraGuideFileLinks,
  rewritePublishPathLinks,
} from '../src/compile/publish-links.js';

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
    const input =
      'See [`package.json`](../../package.json) and [Feature Catalog](../features/feature-catalog.md).\n' +
      'Config: [`docs/mdcp.config.json`](../mdcp.config.json).\n';

    const out = rewritePublishPathLinks(input, {
      stripParentSegments: 2,
      oneLevelPrefix: 'docs/',
    });
    expect(out).toContain('[`package.json`](package.json)');
    expect(out).toContain('[Feature Catalog](docs/features/feature-catalog.md)');
    expect(out).toContain('[`docs/mdcp.config.json`](docs/mdcp.config.json)');
  });
});
