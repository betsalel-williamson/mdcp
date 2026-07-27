import { relative, resolve, sep } from 'node:path';
import fg from 'fast-glob';
import ignoreFactory from 'ignore';
import { readFileSync, existsSync } from 'node:fs';

export interface CoverageResult {
  /** Repo-root-relative POSIX paths of markdown files a guide accounts for. Sorted, unique. */
  captured: string[];
  /** Repo-root-relative POSIX paths of scanned markdown no guide accounts for. Sorted, unique. */
  uncaptured: string[];
  /** Resolved `standaloneGuides` files that exist. Sorted, unique. */
  standalone: string[];
  /** `standaloneGuides` entries that matched no file on disk. */
  missingStandalone: string[];
}

export interface CoverageOptions {
  /** Absolute scan root. */
  root: string;
  /** Absolute guide directories — the whole subtree counts as captured. */
  guideDirs: string[];
  /** Absolute guide output targets plus top-level `outputFile`. */
  outputFiles: string[];
  /** `standaloneGuides` paths or globs, relative to `root`. */
  standaloneGuides: string[];
  /** Extra ignore globs; built-in defaults are always added internally. */
  ignore: string[];
  /** Honor the root `.gitignore` when walking. */
  gitignore: boolean;
}

/** Directories always skipped, even when `.gitignore` does not list them. */
const BUILT_IN_IGNORE = ['**/.git/**', '**/node_modules/**', '**/.agents/**'];

function toPosix(p: string): string {
  return p.split(sep).join('/');
}

function sortedUnique(paths: string[]): string[] {
  return [...new Set(paths)].sort();
}

/** True when `absPath` is `dir` or lives inside the `dir` subtree. */
function isUnder(dir: string, absPath: string): boolean {
  const rel = relative(dir, absPath);
  return rel === '' || (!rel.startsWith('..') && !rel.startsWith(`..${sep}`));
}

/** Filter root-relative POSIX paths through the root `.gitignore`, when present. */
function gitignoreFilter(root: string, relPaths: string[]): string[] {
  const gitignorePath = resolve(root, '.gitignore');
  if (!existsSync(gitignorePath)) return relPaths;
  const matcher = ignoreFactory().add(readFileSync(gitignorePath, 'utf-8'));
  return relPaths.filter((rel) => !matcher.ignores(rel));
}

/**
 * Compute documentation coverage for the scan root.
 *
 * A markdown file is **captured** when it lives inside a guide directory subtree,
 * is a guide output target, or matches a `standaloneGuides` entry. Whatever the
 * scan finds that is not captured is **uncaptured**. Guide directory membership in
 * a manifest is the orphan check's job, so a whole guide directory counts as
 * captured and its shards are never double-reported.
 */
export function computeCoverage(opts: CoverageOptions): CoverageResult {
  const root = resolve(opts.root);

  const scannedRel = fg.sync('**/*.md', {
    cwd: root,
    dot: true,
    onlyFiles: true,
    followSymbolicLinks: false,
    ignore: [...BUILT_IN_IGNORE, ...opts.ignore],
  });

  const scanned = opts.gitignore ? gitignoreFilter(root, scannedRel) : scannedRel;

  const guideDirs = opts.guideDirs.map((d) => resolve(d));
  const outputFiles = new Set(opts.outputFiles.map((f) => resolve(f)));

  const standaloneMatches = new Set<string>();
  const missingStandalone: string[] = [];
  for (const entry of opts.standaloneGuides) {
    const matches = fg.sync(entry, {
      cwd: root,
      dot: true,
      onlyFiles: true,
      followSymbolicLinks: false,
    });
    if (matches.length === 0) {
      missingStandalone.push(entry);
      continue;
    }
    for (const m of matches) standaloneMatches.add(toPosix(m));
  }

  const captured: string[] = [];
  const uncaptured: string[] = [];
  for (const rel of scanned) {
    const posix = toPosix(rel);
    const abs = resolve(root, rel);
    const isCaptured =
      guideDirs.some((dir) => isUnder(dir, abs)) ||
      outputFiles.has(abs) ||
      standaloneMatches.has(posix);
    if (isCaptured) captured.push(posix);
    else uncaptured.push(posix);
  }

  return {
    captured: sortedUnique(captured),
    uncaptured: sortedUnique(uncaptured),
    standalone: sortedUnique([...standaloneMatches]),
    missingStandalone: sortedUnique(missingStandalone),
  };
}
