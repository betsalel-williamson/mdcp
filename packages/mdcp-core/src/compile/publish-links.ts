import { readFileSync } from 'node:fs';
import { basename, dirname, relative, resolve, isAbsolute } from 'node:path';
import { githubSlugify } from '../refs/slugs.js';
import { extractFirstHeading } from './compile-title.js';
import { demoteHeadings, stripAboutThisGuideHeading } from './headings.js';
import { defaultSearchRoots, resolveRelativeFile } from './hooks/path-resolve.js';
import type { GuideLinkIndex, GuideLinkEntry } from './guide-link-index.js';

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

const PUBLISH_RELATIVE_LINK_RE = /(\[[^\]]*\]\()((?!https?:|\/\/|mailto:)(?:\.\.\/)+[^)]+)\)/g;

export interface PublishRelativeLinkRewriteOptions {
  sourceFile: string;
  guideDir: string;
  scopeRoot?: string;
  currentGuideName?: string;
  /** Absolute path to the publish output being assembled. */
  currentOutputFile: string;
  linkIndex?: GuideLinkIndex;
  searchRoots?: string[];
}

function parseLinkPath(target: string): { path: string; suffix: string } {
  const hash = target.indexOf('#');
  if (hash === -1) return { path: target, suffix: '' };
  return { path: target.slice(0, hash), suffix: target.slice(hash) };
}

function resolvePublishLinkTarget(
  filePart: string,
  options: PublishRelativeLinkRewriteOptions,
): string | null {
  const shardDir = dirname(options.sourceFile);
  const searchRoots = options.scopeRoot ? [options.scopeRoot] : [];
  return (
    resolveRelativeFile(filePart, shardDir, searchRoots) ??
    resolveRelativeFile(filePart, options.guideDir, searchRoots)
  );
}

function isOtherPublishOutput(
  resolvedAbs: string,
  options: PublishRelativeLinkRewriteOptions,
): boolean {
  if (!options.linkIndex) return false;
  for (const entry of options.linkIndex.values()) {
    if (entry.outputFile === resolvedAbs) return true;
  }
  return false;
}

function skipPublishRelativeRewrite(
  resolvedAbs: string,
  options: PublishRelativeLinkRewriteOptions,
): boolean {
  if (!options.linkIndex || !options.currentGuideName) return false;
  const entry = options.linkIndex.get(resolvedAbs);
  return entry?.guideName === options.currentGuideName;
}

/** Rewrite shard-relative file links to paths relative to a publish output file. */
export function rewritePublishRelativeLinks(
  markdown: string,
  options: PublishRelativeLinkRewriteOptions,
): string {
  const outputAbs = resolve(options.currentOutputFile);
  if (!isAbsolute(outputAbs)) return markdown;

  return markdown.replace(PUBLISH_RELATIVE_LINK_RE, (match, prefix, target) => {
    const { path: filePart, suffix } = parseLinkPath(target);
    if (!filePart) return match;

    const resolved = resolvePublishLinkTarget(filePart, options);
    if (!resolved) return match;
    if (isOtherPublishOutput(resolved, options)) return match;
    if (skipPublishRelativeRewrite(resolved, options)) return match;

    const fromDir = dirname(outputAbs);
    const rel = relative(fromDir, resolve(resolved)).replace(/\\/g, '/');
    return `${prefix}${rel}${suffix})`;
  });
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
  currentGuideName?: string;
  currentOutputBasename?: string;
  /** Absolute path to the guide output being assembled. */
  currentOutputFile?: string;
  linkIndex: GuideLinkIndex;
  /** Guide names whose shards keep source `.md` paths instead of monolith `#slug` targets. */
  ignoreGuides?: string[];
  searchRoots?: string[];
}

function resolveIndexedMarkdownLink(
  file: string,
  fragment: string | undefined,
  options: CrossGuideLinkRewriteOptions,
): { entry: GuideLinkEntry; anchor: string } | null {
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
  entry: GuideLinkEntry,
  options: CrossGuideLinkRewriteOptions,
): string {
  const sameGuide =
    options.currentGuideName !== undefined && entry.guideName === options.currentGuideName;
  const sameOutputFile =
    options.currentOutputFile !== undefined && entry.outputFile === options.currentOutputFile;
  const sameBasenameLegacy =
    options.currentOutputBasename !== undefined &&
    entry.outputBasename === options.currentOutputBasename &&
    options.currentOutputFile === undefined;

  if (sameGuide || sameOutputFile || sameBasenameLegacy) {
    return `${prefix}#${anchor})`;
  }

  if (options.currentOutputFile) {
    const fromDir = dirname(options.currentOutputFile);
    const toFile = entry.outputFile;
    if (dirname(toFile) === fromDir) {
      return `${prefix}${basename(toFile)}#${anchor})`;
    }
    let rel = relative(fromDir, toFile).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return `${prefix}${rel}#${anchor})`;
  }

  return `${prefix}${entry.outputBasename}#${anchor})`;
}

/** Rewrite cross-guide `.md` links using the compile-time guide link index. */
export function rewriteCrossGuideFileLinks(
  markdown: string,
  options: CrossGuideLinkRewriteOptions,
): string {
  return markdown.replace(CROSS_GUIDE_MD_LINK_RE, (match, prefix, file, fragment) => {
    const hit = resolveIndexedMarkdownLink(file, fragment, options);
    if (!hit) return match;
    if (options.ignoreGuides?.includes(hit.entry.guideName)) return match;
    return formatCrossGuideTarget(prefix, hit.anchor, hit.entry, options);
  });
}
