import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FILE_LINK_RE = /\[[^\]]*\]\(([^)]+\.md)(?:#[^)]*)?\)/g;
const SLUG_LINK_RE = /\]\(#([^)]+)\)/g;

export interface SectionFilesOptions {
  manifest?: string;
  scopeRoot?: string;
  sectionsHeading?: string;
}

function manifestTextForSections(text: string, sectionsHeading?: string): string {
  if (!sectionsHeading) return text;
  const escaped = sectionsHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^##\\s+${escaped}\\s*$`, 'im');
  const match = re.exec(text);
  if (!match || match.index === undefined) return text;
  return text.slice(match.index);
}

function resolveManifestPaths(
  guideDir: string,
  text: string,
  options: SectionFilesOptions,
): string[] {
  const scope = options.scopeRoot ? resolve(options.scopeRoot) : null;
  const files: string[] = [];

  for (const match of text.matchAll(FILE_LINK_RE)) {
    const rel = match[1].split('#')[0];
    const resolved = resolve(guideDir, rel);
    if (scope && !resolved.startsWith(scope + '/') && resolved !== scope) {
      continue;
    }
    if (!files.includes(resolved)) files.push(resolved);
  }

  for (const match of text.matchAll(SLUG_LINK_RE)) {
    const slug = match[1];
    if (slug === 'table-of-contents') continue;
    const name = `${slug}.md`;
    const local = join(guideDir, name);
    if (existsSync(local) && !files.includes(local)) {
      files.push(local);
    }
  }

  return files;
}

export function sectionFiles(guideDir: string, options: SectionFilesOptions = {}): string[] {
  const manifestName = options.manifest ?? 'index.md';
  const indexPath = join(guideDir, manifestName);
  if (!existsSync(indexPath)) {
    throw new Error(`No ${manifestName} in ${guideDir}`);
  }

  const text = readFileSync(indexPath, 'utf-8');
  const scopedText = manifestTextForSections(text, options.sectionsHeading);

  const resolved = resolveManifestPaths(guideDir, scopedText, options);
  if (resolved.length > 0) return resolved;

  return readdirSync(guideDir)
    .filter((n: string) => n.endsWith('.md') && n !== manifestName && n !== 'shards.md')
    .sort()
    .map((n: string) => join(guideDir, n));
}
