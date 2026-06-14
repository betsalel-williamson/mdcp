import { resolve, relative, isAbsolute } from 'node:path';

function isUnder(parent: string, child: string): boolean {
  const rel = relative(parent, child);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

/** True when outputFile targets outside the docs tree (repo publish via `..`). */
export function isPublishEscapePath(file: string): boolean {
  if (isAbsolute(file)) return false;
  return file.startsWith('..') || file.includes('/..') || file.includes('\\..');
}

/**
 * Resolve per-guide `compile.outputFile` under docs root `cwd`.
 * Publish paths with `..` resolve from `cwd`; other paths join under `outputDir`.
 */
export function resolveGuideOutputPath(cwd: string, outputDir: string, outputFile: string): string {
  if (isAbsolute(outputFile)) return outputFile;
  if (isPublishEscapePath(outputFile)) return resolve(cwd, outputFile);
  return resolveUnderOutputDir(cwd, outputDir, outputFile);
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
