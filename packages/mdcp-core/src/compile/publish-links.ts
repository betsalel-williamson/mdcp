import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { githubSlugify } from '../refs/slugs.js';
import { extractFirstHeading } from './compile-title.js';
import { demoteHeadings, stripAboutThisGuideHeading } from './headings.js';
import { defaultSearchRoots, resolveRelativeFile } from './hooks/path-resolve.js';
import type { GuideLinkIndex } from './guide-link-index.js';

function sectionBodyForSlug(filename: string, content: string): string {
  if (filename === 'about-this-guide.md') {
    const body = stripAboutThisGuideHeading(content);
    return body.trim() ? demoteHeadings(body, 1) : body;
  }
  return demoteHeadings(content, 1);
}

/** Slug for a shard file after compile demotion (shared by index build and hooks). */
export function slugForSectionFile(filePath: string): string | null {
  const name = basename(filePath);
  const raw = readFileSync(filePath, 'utf-8').trim();
  const processed = sectionBodyForSlug(name, raw);
  return slugForDemotedSection(name, processed);
}

const INTRA_GUIDE_MD_LINK_RE = /(\[[^\]]*\]\()((?!https?:)(?:\.\/)?[^)#/\s][^)#]*\.md)(#[^)]*)?\)/g;
const CROSS_GUIDE_MD_LINK_RE =
  /(\[[^\]]*\]\()((?!https?:)(?:(?:\.\.\/)+|\.\/)[^)#/\s][^)#]*\.md)(#[^)]*)?\)/g;
const FIND_FILE_RE = /^FIND-\d+\.md$/i;

function slugForDemotedSection(filename: string, processed: string): string | null {
  if (FIND_FILE_RE.test(filename)) {
    return githubSlugify(filename.replace(/\.md$/i, ''));
  }
  const heading = extractFirstHeading(processed);
  if (!heading.text) return null;
  return heading.anchor ?? githubSlugify(heading.text);
}

/** Map shard basenames to GitHub-style slugs for the first heading after compile demotion. */
export function buildSectionSlugMap(sectionPaths: string[]): Map<string, string> {
  const slugCounts = new Map<string, number>();
  const slugByBasename = new Map<string, string>();

  for (const filePath of sectionPaths) {
    const name = basename(filePath);
    const raw = readFileSync(filePath, 'utf-8').trim();
    const processed = sectionBodyForSlug(name, raw);
    const baseSlug = slugForDemotedSection(name, processed);
    if (!baseSlug) continue;

    const base = baseSlug;
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const slug = count === 0 ? base : `${base}-${count}`;
    slugByBasename.set(name, slug);
  }

  return slugByBasename;
}

export interface PublishPathRewriteOptions {
  stripParentSegments: number;
  oneLevelPrefix: string;
}

/** Rewrite shard-relative paths for publish outputs outside the guide directory. */
export function rewritePublishPathLinks(
  markdown: string,
  options: PublishPathRewriteOptions,
): string {
  let out = markdown;
  if (options.stripParentSegments >= 2) {
    out = out.replace(/(\[[^\]]*\]\()\.\.\/\.\.\//g, '$1');
  }
  if (options.stripParentSegments >= 1) {
    out = out.replace(/(\[[^\]]*\]\()\.\.\//g, `$1${options.oneLevelPrefix}`);
  }
  return out;
}

/** Rewrite same-guide shard links to in-document anchors for publish outputs (npm READMEs). */
export function rewriteIntraGuideFileLinks(
  markdown: string,
  slugByBasename: Map<string, string>,
): string {
  return markdown.replace(INTRA_GUIDE_MD_LINK_RE, (match, prefix, file, fragment) => {
    const name = basename(file.split('/').pop() ?? file);
    const slug = slugByBasename.get(name);
    if (!slug) return match;
    if (fragment) return `${prefix}#${fragment.slice(1)})`;
    return `${prefix}#${slug})`;
  });
}

export interface CrossGuideLinkRewriteOptions {
  sourceFile: string;
  guideDir: string;
  scopeRoot?: string;
  currentOutputBasename?: string;
  linkIndex: GuideLinkIndex;
  /** When set, all indexed targets rewrite to this output file (reviewLinks hook). */
  targetMonolith?: string;
  searchRoots?: string[];
}

function resolveIndexedMarkdownLink(
  file: string,
  fragment: string | undefined,
  options: CrossGuideLinkRewriteOptions,
): { entry: { outputBasename: string; slug: string }; anchor: string } | null {
  const shardDir = dirname(options.sourceFile);
  const searchRoots = [
    ...(options.searchRoots ?? defaultSearchRoots()),
    ...(options.scopeRoot ? [options.scopeRoot] : []),
  ];

  const resolved =
    resolveRelativeFile(file, shardDir, searchRoots) ??
    resolveRelativeFile(file, options.guideDir, searchRoots);
  if (!resolved) return null;

  const entry = options.linkIndex.get(resolved);
  if (!entry) return null;

  const anchor = fragment ? fragment.slice(1) : entry.slug;
  return { entry, anchor };
}

function formatCrossGuideTarget(
  prefix: string,
  anchor: string,
  entry: { outputBasename: string },
  options: CrossGuideLinkRewriteOptions,
): string {
  const targetOutput = options.targetMonolith ?? entry.outputBasename;
  const current = options.currentOutputBasename;
  if (!current || targetOutput === current) {
    return `${prefix}#${anchor})`;
  }
  return `${prefix}${targetOutput}#${anchor})`;
}

/** Rewrite cross-guide `.md` links using the compile-time guide link index. */
export function rewriteCrossGuideFileLinks(
  markdown: string,
  options: CrossGuideLinkRewriteOptions,
): string {
  return markdown.replace(CROSS_GUIDE_MD_LINK_RE, (match, prefix, file, fragment) => {
    const hit = resolveIndexedMarkdownLink(file, fragment, options);
    if (!hit) return match;
    return formatCrossGuideTarget(prefix, hit.anchor, hit.entry, options);
  });
}
