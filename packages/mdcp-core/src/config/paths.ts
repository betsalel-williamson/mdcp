import { resolve, relative, isAbsolute } from 'node:path';

function isUnder(parent: string, child: string): boolean {
  const rel = relative(parent, child);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

/**
 * Resolve `file` under `outputDir` (both relative to docs root `cwd`).
 * When `file` is accidentally cwd-relative but already under `outputDir`, use the cwd-relative path.
 */
export function resolveUnderOutputDir(cwd: string, outputDir: string, file: string): string {
  const outputRoot = resolve(cwd, outputDir);
  const underOutputDir = resolve(outputRoot, file);
  const cwdRelative = resolve(cwd, file);
  if (cwdRelative !== underOutputDir && isUnder(outputRoot, cwdRelative)) {
    return cwdRelative;
  }
  return underOutputDir;
}
