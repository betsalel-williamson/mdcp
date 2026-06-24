import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface DocsDetectionResult {
  docsRoot: string;
  hasExistingDocs: boolean;
  signals: string[];
  existingGuides: string[];
  markdownFileCount: number;
}

const ROOT_DOC_SIGNALS = ['mkdocs.yml', 'docusaurus.config.js', 'book.toml', 'vitepress.config.ts'];

function countMarkdownFiles(dir: string): number {
  if (!existsSync(dir)) return 0;
  let count = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      count += countMarkdownFiles(full);
    } else if (entry.endsWith('.md')) {
      count += 1;
    }
  }
  return count;
}

function listGuideDirs(docsRoot: string): string[] {
  if (!existsSync(docsRoot)) return [];
  return readdirSync(docsRoot).filter((name) => {
    const full = join(docsRoot, name);
    return statSync(full).isDirectory() && existsSync(join(full, 'index.md'));
  });
}

/** Scan repo for existing documentation layout (non-destructive). */
export function detectExistingDocs(repoRoot: string, docsRoot: string): DocsDetectionResult {
  const absDocs = join(repoRoot, docsRoot);
  const signals: string[] = [];
  const existingGuides = listGuideDirs(absDocs);
  const markdownFileCount = countMarkdownFiles(absDocs);

  if (existsSync(join(repoRoot, 'README.md'))) signals.push('README.md');
  for (const file of ROOT_DOC_SIGNALS) {
    if (existsSync(join(repoRoot, file))) signals.push(file);
  }
  if (markdownFileCount > 0) signals.push(`${markdownFileCount} markdown files under ${docsRoot}/`);
  if (existingGuides.length) signals.push(`guide manifests: ${existingGuides.join(', ')}`);

  const hasExistingDocs = signals.length > 0;

  return {
    docsRoot,
    hasExistingDocs,
    signals,
    existingGuides,
    markdownFileCount,
  };
}
