import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { githubSlugify } from '../src/refs/slugs.js';

const repoRoot = join(import.meta.dirname, '../../..');

function readRepoDoc(...segments: string[]): string {
  return readFileSync(join(repoRoot, ...segments), 'utf8');
}

const PREPROCESSOR_HEADING = 'Preprocessor / templating (out of scope)';
const PREPROCESSOR_SLUG = 'preprocessor-templating-out-of-scope';

describe('design scope documentation (#26)', () => {
  const designConstraints = readRepoDoc('docs/features/design-constraints.md');
  const featureCatalog = readRepoDoc('docs/features/feature-catalog.md');
  const compileHooks = readRepoDoc('docs/client-core/compile-hooks/index.md');
  const coreReadme = readRepoDoc('packages/mdcp-core/README.md');

  it('uses the GitHub slug for the preprocessor heading', () => {
    expect(githubSlugify(PREPROCESSOR_HEADING)).toBe(PREPROCESSOR_SLUG);
  });

  it('documents preprocessor and templating as out of scope', () => {
    expect(designConstraints).toMatch(/## Preprocessor \/ templating \(out of scope\)/);
    expect(designConstraints).toContain(
      'preprocess (optional) → mdcp compile / check → postprocess (optional)',
    );
    expect(designConstraints).toContain('{{variable}}');
    expect(designConstraints).toContain('Handlebars');
    expect(designConstraints).toContain('inlineInserts');
    expect(designConstraints).toContain('Not the same as compile hooks');
  });

  it('cross-links compile hooks from the feature catalog', () => {
    expect(featureCatalog).toContain('not a general preprocessor or template engine');
    expect(featureCatalog).toContain(`./design-constraints.md#${PREPROCESSOR_SLUG}`);
    expect(featureCatalog).toContain('No preprocessor / templating');
  });

  it('points compile-hook readers at repo design constraints', () => {
    expect(compileHooks).toContain('Not general templating');
    expect(compileHooks).toContain('{{variables}}');
    expect(compileHooks).toContain(
      `https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/design-constraints.md#${PREPROCESSOR_SLUG}`,
    );
  });

  it('defines GFM and authored GFM in the product glossary', () => {
    const glossary = readRepoDoc('docs/features/glossary.md');
    expect(glossary).toContain('## GFM');
    expect(glossary).toContain('GitHub Flavored Markdown');
    expect(glossary).toContain('Authored GFM');
    expect(designConstraints).toContain('[authored GFM](./glossary.md#gfm)');
    expect(featureCatalog).toContain('[authored GFM](./glossary.md#gfm)');
    expect(compileHooks).toContain(
      'https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/glossary.md#gfm',
    );
  });

  it('keeps the published core README link on the repo shard', () => {
    expect(coreReadme).toContain(
      `https://github.com/betsalel-williamson/mdcp/blob/main/docs/features/design-constraints.md#${PREPROCESSOR_SLUG}`,
    );
    expect(coreReadme).not.toContain('#preprocessor--templating-out-of-scope');
  });
});
