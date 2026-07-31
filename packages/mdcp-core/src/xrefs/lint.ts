import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getLocalePack, type LocalePack } from '../locale/index.js';
import { isAtxHeading } from '../markdown/index.js';

const LINK_RE = /\[([^\]]*)\]\([^)]*\)/g;

const SKIP_FILES = new Set(['index.md']);
const SKIP_PREFIXES = ['table-of-contents'];

function stripLinks(line: string): string {
  return line.replace(LINK_RE, '');
}

function shouldSkip(filename: string): boolean {
  if (SKIP_FILES.has(filename)) return true;
  return SKIP_PREFIXES.some((p) => filename.startsWith(p));
}

function lintFile(path: string, root: string, locale: LocalePack): string[] {
  const issues: string[] = [];
  const rel = path.replace(root + '/', '').replace(root + '\\', '');
  const text = readFileSync(path, 'utf-8');
  const { xrefs } = locale;
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
    for (const m of plain.matchAll(xrefs.chapterRef)) {
      issues.push(`${rel}:${num + 1}: ${xrefs.bareCrossRefMessage(m[0])}`);
    }
    for (const m of line.matchAll(xrefs.seeChapter)) {
      if (!LINK_RE.test(line)) {
        issues.push(`${rel}:${num + 1}: ${xrefs.unlinkedMessage(m[0])}`);
      }
    }
    if (line.includes(xrefs.seeTableCell)) continue;
    if (xrefs.seeLinked.test(line)) continue;
    if (xrefs.seeCapitalUnlinked.test(line)) {
      issues.push(`${rel}:${num + 1}: ${xrefs.unlinkedSeeCapitalMessage}`);
    }
    if (xrefs.seeLowercaseUnlinked.test(line)) {
      issues.push(`${rel}:${num + 1}: ${xrefs.unlinkedSeeLowercaseMessage}`);
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

export function lintXrefs(scanRoots: string[], locale: LocalePack = getLocalePack()): string[] {
  const issues: string[] = [];
  for (const root of scanRoots) {
    try {
      for (const file of collectMdFiles(root)) {
        issues.push(...lintFile(file, root, locale));
      }
    } catch {
      // skip missing dirs
    }
  }
  return issues;
}
