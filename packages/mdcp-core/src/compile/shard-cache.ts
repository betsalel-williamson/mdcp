import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { extractLinks, type ExtractedLink } from '../links/extract.js';
import type { LinkProvenance } from '../links/mark-broken.js';
import { githubSlugify } from '../refs/slugs.js';
import { extractFirstHeading } from './compile-title.js';
import { sectionBodyForSlug, slugForDemotedSection } from './section-slug.js';

export interface ShardSnapshot {
  raw: string;
  processed: string;
  slug: string | null;
  links: ExtractedLink[];
  provenance: LinkProvenance[];
  anchorSlugs: Set<string>;
}

/** Absolute shard path → cached read + derived compile metadata. */
export type ShardCache = Map<string, ShardSnapshot>;

function anchorSlugsFromProcessed(processed: string): Set<string> {
  const slugs = new Set<string>();
  for (const line of processed.split('\n')) {
    const m = line.match(/^#{1,6}\s+(.+)$/);
    if (!m) continue;
    const title = m[1]
      .replace(/\{#.*?\}/g, '')
      .replace(/\*\*/g, '')
      .trim();
    if (title) slugs.add(githubSlugify(title));
  }
  const first = extractFirstHeading(processed);
  if (first.anchor) slugs.add(first.anchor);
  return slugs;
}

function provenanceFromLinks(links: ExtractedLink[], sourceFile: string): LinkProvenance[] {
  return links.map((l) => ({
    label: l.label,
    originalTarget: l.target,
    sourceFile,
    sourceLine: l.line,
  }));
}

/** Read a shard once and populate derived compile/lint fields. */
export function loadShardSnapshot(
  filePath: string,
  cache: ShardCache,
  preambleSection = 'about-this-guide.md',
): ShardSnapshot {
  const absPath = resolve(filePath);
  const existing = cache.get(absPath);
  if (existing) return existing;

  const name = basename(absPath);
  const raw = readFileSync(absPath, 'utf-8').trim();
  const processed = sectionBodyForSlug(name, raw, preambleSection);
  const slug = slugForDemotedSection(name, processed);
  const links = extractLinks(raw);
  const snapshot: ShardSnapshot = {
    raw,
    processed,
    slug,
    links,
    provenance: provenanceFromLinks(links, absPath),
    anchorSlugs: anchorSlugsFromProcessed(processed),
  };
  cache.set(absPath, snapshot);
  return snapshot;
}

/** Assign disambiguated slugs for a section list (same rules as buildSectionSlugMap). */
export function assignSectionSlugs(
  sectionPaths: string[],
  cache?: ShardCache,
  preambleSection = 'about-this-guide.md',
): Map<string, string> {
  const slugCounts = new Map<string, number>();
  const slugByPath = new Map<string, string>();

  for (const filePath of sectionPaths) {
    const absPath = resolve(filePath);
    let baseSlug: string | null;
    if (cache?.has(absPath)) {
      baseSlug = cache.get(absPath)!.slug;
    } else if (cache) {
      baseSlug = loadShardSnapshot(filePath, cache, preambleSection).slug;
    } else {
      const name = basename(filePath);
      const raw = readFileSync(filePath, 'utf-8').trim();
      const processed = sectionBodyForSlug(name, raw, preambleSection);
      baseSlug = slugForDemotedSection(name, processed);
    }
    if (!baseSlug) continue;

    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;
    slugByPath.set(absPath, slug);
  }

  return slugByPath;
}

export function createShardCache(): ShardCache {
  return new Map();
}
