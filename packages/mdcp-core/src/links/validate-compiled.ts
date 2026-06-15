import { buildSlugRegistry } from '../refs/slugs.js';
import { extractLinks } from './extract.js';
import { validateCompiledLinkTarget } from './validate.js';
import type { LinkIssue } from './types.js';

export interface LintCompiledLinksOptions {
  markdown: string;
  outputFile: string;
  guideName?: string;
  knownOutputBasenames?: Set<string>;
  knownSlugs?: Set<string>;
}

/** Validate links in assembled compiled guide output. */
export function lintCompiledLinks(options: LintCompiledLinksOptions): LinkIssue[] {
  const issues: LinkIssue[] = [];
  const registry = buildSlugRegistry(options.markdown);
  const lines = options.markdown.split('\n');
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const stripped = lines[i].trim();
    if (stripped.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (lines[i].includes('**BROKEN LINK:**')) {
      issues.push({
        kind: 'dead anchor',
        file: options.outputFile,
        line: i + 1,
        label: '',
        originalTarget: '',
        brokenTarget: lines[i].trim(),
        guideName: options.guideName,
      });
    }
  }

  for (const link of extractLinks(options.markdown)) {
    if (lines[link.line - 1]?.includes('**BROKEN LINK:**')) continue;

    const result = validateCompiledLinkTarget(link.target, registry, {
      outputFile: options.outputFile,
      knownOutputBasenames: options.knownOutputBasenames,
      knownSlugs: options.knownSlugs,
    });
    if (result.valid) continue;
    issues.push({
      kind: result.reason ?? 'dead anchor',
      file: options.outputFile,
      line: link.line,
      label: link.label,
      originalTarget: link.target,
      brokenTarget: result.brokenTarget ?? link.target,
      guideName: options.guideName,
    });
  }

  return issues;
}
