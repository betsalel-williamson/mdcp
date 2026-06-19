import { existsSync, readFileSync } from 'node:fs';
import { dirname, basename } from 'node:path';
import { extractLinks } from './extract.js';
import { defaultSearchRoots, resolveRelativeFile } from '../compile/hooks/path-resolve.js';
import { githubSlugify } from '../refs/slugs.js';
import { demoteHeadings, stripAboutThisGuideHeading } from '../compile/headings.js';
import { extractFirstHeading } from '../compile/compile-title.js';
import type { LinkIssue } from './types.js';
import type { LinkProvenance } from './mark-broken.js';

function shardSlugSet(filePath: string): Set<string> {
  const name = basename(filePath);
  let raw = readFileSync(filePath, 'utf-8').trim();
  if (name === 'about-this-guide.md') {
    const body = stripAboutThisGuideHeading(raw);
    raw = body.trim() ? demoteHeadings(body, 1) : body;
  } else {
    raw = demoteHeadings(raw, 1);
  }
  const slugs = new Set<string>();
  for (const line of raw.split('\n')) {
    const m = line.match(/^#{1,6}\s+(.+)$/);
    if (!m) continue;
    const title = m[1]
      .replace(/\{#.*?\}/g, '')
      .replace(/\*\*/g, '')
      .trim();
    if (title) slugs.add(githubSlugify(title));
  }
  const first = extractFirstHeading(raw);
  if (first.anchor) slugs.add(first.anchor);
  return slugs;
}

export interface LintShardLinksOptions {
  shardFile: string;
  guideDir: string;
  scopeRoot?: string;
}

/** Validate links in a single shard source file. */
export function lintShardLinks(options: LintShardLinksOptions): LinkIssue[] {
  const issues: LinkIssue[] = [];
  const text = readFileSync(options.shardFile, 'utf-8');
  const shardDir = dirname(options.shardFile);
  const searchRoots = [...defaultSearchRoots(), ...(options.scopeRoot ? [options.scopeRoot] : [])];

  const anchorSlugs = shardSlugSet(options.shardFile);

  for (const link of extractLinks(text)) {
    if (link.target.startsWith('#')) {
      const slug = link.target.slice(1);
      if (!anchorSlugs.has(slug)) {
        issues.push({
          kind: 'dead anchor',
          file: options.shardFile,
          line: link.line,
          label: link.label,
          originalTarget: link.target,
          brokenTarget: link.target,
        });
      }
      continue;
    }

    if (/^https?:\/\//i.test(link.target)) continue;

    const filePart = link.target.split('#')[0];
    if (!filePart.endsWith('.md')) continue;

    const resolved =
      resolveRelativeFile(filePart, shardDir, searchRoots) ??
      resolveRelativeFile(filePart, options.guideDir, searchRoots);

    if (!resolved || !existsSync(resolved)) {
      issues.push({
        kind: 'missing file',
        file: options.shardFile,
        line: link.line,
        label: link.label,
        originalTarget: link.target,
        brokenTarget: link.target,
      });
    }
  }

  return issues;
}

export function collectShardProvenance(shardFile: string): LinkProvenance[] {
  const text = readFileSync(shardFile, 'utf-8');
  return extractLinks(text).map((l) => ({
    label: l.label,
    originalTarget: l.target,
    sourceFile: shardFile,
    sourceLine: l.line,
  }));
}
