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
const PREPROCESSOR_SHARD = 'docs/features/design-constraints/preprocessor-templating.md';
const GLOSSARY_MANIFEST = '../glossary/index.md';

const GUIDE_INDEXES = [
  'docs/features/index.md',
  'docs/developer/index.md',
  'docs/client-cli/index.md',
  'docs/client-core/index.md',
] as const;

const COMPILED_GUIDES = [
  'DEVELOPERS.md',
  'packages/mdcp-cli/README.md',
  'packages/mdcp-core/README.md',
] as const;

describe('design scope documentation (#26)', () => {
  const designConstraintsIndex = readRepoDoc('docs/features/design-constraints/index.md');
  const preprocessorShard = readRepoDoc(PREPROCESSOR_SHARD);
  const gfmScopeShard = readRepoDoc('docs/features/design-constraints/gfm-scope.md');
  const featureCatalog = readRepoDoc('docs/features/feature-catalog.md');
  const compileHooks = readRepoDoc('docs/client-core/compile-hooks/index.md');
  const glossary = readRepoDoc('docs/glossary/index.md');

  it('uses the GitHub slug for the preprocessor heading', () => {
    expect(githubSlugify(PREPROCESSOR_HEADING)).toBe(PREPROCESSOR_SLUG);
  });

  it('shards design constraints with a manifest and section files', () => {
    expect(designConstraintsIndex).toContain('# Design constraints');
    expect(designConstraintsIndex).toContain('./preprocessor-templating.md');
    expect(designConstraintsIndex).toContain('./gfm-scope.md');
    expect(designConstraintsIndex).toContain('./md-tree-integration.md');
  });

  it('documents preprocessor and templating only in the preprocessor shard', () => {
    expect(preprocessorShard).toMatch(/# Preprocessor \/ templating \(out of scope\)/);
    expect(preprocessorShard).toContain(
      'preprocess (optional) → mdcp compile / check → postprocess (optional)',
    );
    expect(preprocessorShard).toContain('{{variable}}');
    expect(preprocessorShard).toContain('Handlebars');
    expect(preprocessorShard).toContain('inlineInserts');
    expect(preprocessorShard).toContain('Not compile hooks');
    expect(featureCatalog).not.toContain('{% if %}');
    expect(compileHooks).not.toContain('{{variables}}');
  });

  it('links scope topics from catalog and hooks without repeating the spec', () => {
    expect(featureCatalog).toContain(
      `./design-constraints/preprocessor-templating.md#${PREPROCESSOR_SLUG}`,
    );
    expect(featureCatalog).toContain('[authored GFM](../glossary/index.md#gfm)');
    expect(compileHooks).toContain('[authored GFM](../glossary/index.md#gfm)');
    expect(compileHooks).toContain(
      `../../features/design-constraints/preprocessor-templating.md#${PREPROCESSOR_SLUG}`,
    );
  });

  it('defines GFM and authored GFM in the shared glossary', () => {
    expect(glossary).toContain('## GFM');
    expect(glossary).toContain('## Authored GFM');
    expect(glossary).toContain('GitHub Flavored Markdown');
    expect(gfmScopeShard).toContain('[GFM](../../glossary/index.md#gfm)');
  });

  it('lists glossary in every guide manifest', () => {
    for (const indexPath of GUIDE_INDEXES) {
      expect(readRepoDoc(indexPath)).toContain(GLOSSARY_MANIFEST);
    }
  });

  it('stitches glossary into every compiled guide output', () => {
    for (const outputPath of COMPILED_GUIDES) {
      const compiled = readRepoDoc(outputPath);
      expect(compiled).toContain('## GFM');
      expect(compiled).toContain('## Authored GFM');
    }
  });
});
