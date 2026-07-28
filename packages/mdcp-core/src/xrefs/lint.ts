import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isAtxHeading } from '../markdown/index.js';

const LINK_RE = /\[([^\]]*)\]\([^)]*\)/g;
const CH_REF_RE =
  /\b(?:Ch\.?\s*\d+(?:\s*[–—-]\s*[^|.\n]+)?|Chapter\s+\d+(?:\s*[–—-]\s*[^|.\n]+)?)\b/gi;
const SEE_CHAPTER_RE = /\bSee\s+Chapter\s+\d+\b/gi;
const SEE_CAPITAL_UNLINKED_RE = /\bSee\s+(?!your\s)(?!\[)\w/;
const SEE_LOWERCASE_UNLINKED_RE = /(?<=[(,])\s*see\s+(?!\[)\w/;

const SKIP_FILES = new Set(['index.md']);
const SKIP_PREFIXES = ['table-of-contents'];

function stripLinks(line: string): string {
  return line.replace(LINK_RE, '');
}

function shouldSkip(filename: string): boolean {
  if (SKIP_FILES.has(filename)) return true;
  return SKIP_PREFIXES.some((p) => filename.startsWith(p));
}

function lintFile(path: string, root: string): string[] {
  const issues: string[] = [];
  const rel = path.replace(root + '/', '').replace(root + '\\', '');
  const text = readFileSync(path, 'utf-8');
  let inFence = false;

  for (let num = 0; num < text.split('\n').length; num++) {
    const line = text.split('\n')[num];
    const stripped = line.trim();
    if (stripped.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !stripped) continue;
    if (isAtxHeading(stripped)) continue;

    const plain = stripLinks(line);
    for (const m of plain.matchAll(CH_REF_RE)) {
      issues.push(`${rel}:${num + 1}: bare cross-ref: ${JSON.stringify(m[0])}`);
    }
    for (const m of line.matchAll(SEE_CHAPTER_RE)) {
      if (!LINK_RE.test(line)) {
        issues.push(`${rel}:${num + 1}: unlinked: ${JSON.stringify(m[0])}`);
      }
    }
    if (line.includes('| See |')) continue;
    if (/\b[Ss]ee\s+\[/.test(line)) continue;
    if (SEE_CAPITAL_UNLINKED_RE.test(line)) {
      issues.push(`${rel}:${num + 1}: unlinked See reference`);
    }
    if (SEE_LOWERCASE_UNLINKED_RE.test(line)) {
      issues.push(`${rel}:${num + 1}: unlinked see reference`);
    }
  }
  return issues;
}

function collectMdFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectMdFiles(full));
    } else if (entry.endsWith('.md') && !shouldSkip(entry)) {
      out.push(full);
    }
  }
  return out;
}

export function lintXrefs(scanRoots: string[]): string[] {
  const issues: string[] = [];
  for (const root of scanRoots) {
    try {
      for (const file of collectMdFiles(root)) {
        issues.push(...lintFile(file, root));
      }
    } catch {
      // skip missing dirs
    }
  }
  return issues;
}
