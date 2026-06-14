import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { githubSlugify } from '../refs/slugs.js';
import { extractFirstHeading } from './compile-title.js';
import { demoteHeadings, stripAboutThisGuideHeading } from './headings.js';

function sectionBodyForSlug(filename: string, content: string): string {
  if (filename === 'about-this-guide.md') {
    const body = stripAboutThisGuideHeading(content);
    return body.trim() ? demoteHeadings(body, 1) : body;
  }
  return demoteHeadings(content, 1);
}

const INTRA_GUIDE_MD_LINK_RE = /(\[[^\]]*\]\()((?!https?:)(?:\.\/)?[^)#/\s][^)#]*\.md)(#[^)]*)?\)/g;

/** Map shard basenames to GitHub-style slugs for the first heading after compile demotion. */
export function buildSectionSlugMap(sectionPaths: string[]): Map<string, string> {
  const slugCounts = new Map<string, number>();
  const slugByBasename = new Map<string, string>();

  for (const filePath of sectionPaths) {
    const name = basename(filePath);
    const raw = readFileSync(filePath, 'utf-8').trim();
    const processed = sectionBodyForSlug(name, raw);
    const heading = extractFirstHeading(processed);
    if (!heading.text) continue;

    const base = heading.anchor ?? githubSlugify(heading.text);
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
