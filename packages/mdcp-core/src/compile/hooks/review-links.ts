import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { githubSlugify } from '../../refs/slugs.js';
import { extractFirstHeading } from '../compile-title.js';
import type { CompileHook } from '../hooks.js';
import { hookSearchRoots, resolveRelativeFile } from './path-resolve.js';

const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;
const FIND_FILE_RE = /FIND-\d+\.md$/i;

function slugForMarkdownFile(filePath: string): string | null {
  const text = readFileSync(filePath, 'utf-8');
  const heading = extractFirstHeading(text);
  if (!heading.text) return null;
  return heading.anchor ?? githubSlugify(heading.text);
}

function rewriteFindingLink(
  label: string,
  target: string,
  guideDir: string,
  searchRoots: string[],
  targetMonolith?: string,
): string {
  const pathOnly = target.split('#')[0];
  if (!FIND_FILE_RE.test(pathOnly)) return `[${label}](${target})`;

  const resolved = resolveRelativeFile(target, guideDir, searchRoots);
  if (!resolved) return `[${label}](${target})`;

  const slug = slugForMarkdownFile(resolved);
  if (!slug) return `[${label}](${target})`;

  if (targetMonolith) {
    return `[${label}](${targetMonolith}#${slug})`;
  }
  return `[${label}](#${slug})`;
}

function rewriteCrossMonolithLink(
  label: string,
  target: string,
  guideDir: string,
  searchRoots: string[],
  targetMonolith?: string,
): string {
  const pathOnly = target.split('#')[0];
  if (!pathOnly.endsWith('.md') || pathOnly.startsWith('http')) {
    return `[${label}](${target})`;
  }
  if (FIND_FILE_RE.test(pathOnly)) {
    return rewriteFindingLink(label, target, guideDir, searchRoots, targetMonolith);
  }

  if (!targetMonolith || !pathOnly.includes('../')) {
    return `[${label}](${target})`;
  }

  const resolved = resolveRelativeFile(target, guideDir, searchRoots);
  if (!resolved) return `[${label}](${target})`;

  const fragment = target.includes('#') ? target.split('#')[1] : slugForMarkdownFile(resolved);
  if (!fragment) return `[${label}](${target})`;

  return `[${label}](${targetMonolith}#${fragment})`;
}

export const reviewLinksHook: CompileHook = (ctx) => {
  const guideDir = dirname(ctx.sourceFile);
  const searchRoots = hookSearchRoots(ctx, 'reviewLinks');
  const guideCfg = ctx.config.guides?.find((g) => g.name === ctx.guideName);
  const targetMonolith = guideCfg?.compile?.hooksConfig?.reviewLinks?.targetMonolith;

  return ctx.body.replace(MD_LINK_RE, (match, label: string, target: string) => {
    if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('#')) {
      return match;
    }
    return rewriteCrossMonolithLink(label, target, guideDir, searchRoots, targetMonolith);
  });
};
