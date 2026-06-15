import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CompileHookContext } from '../hooks.js';

export function defaultSearchRoots(): string[] {
  return [process.cwd(), resolve(process.cwd(), '..')];
}

export function hookSearchRoots(
  ctx: Pick<CompileHookContext, 'guideName' | 'config' | 'scopeRoot'>,
  configKey: 'inlineInserts',
): string[] {
  const roots = defaultSearchRoots();
  if (ctx.scopeRoot) roots.push(ctx.scopeRoot);
  const guideCfg = ctx.config.guides?.find((g) => g.name === ctx.guideName);
  const hooksConfig = guideCfg?.compile?.hooksConfig;
  const extraRoots = hooksConfig?.[configKey]?.searchRoots ?? [];
  for (const root of extraRoots) {
    roots.push(resolve(process.cwd(), root));
  }
  return roots;
}

export function resolveRelativeFile(
  relPath: string,
  guideDir: string,
  searchRoots: string[] = [],
): string | null {
  const normalized = relPath.replace(/^\.\//, '');
  const filePart = normalized.split('#')[0];
  const candidates = [
    resolve(guideDir, filePart),
    resolve(guideDir, '..', filePart),
    ...searchRoots.map((root) => resolve(root, filePart)),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export function readTextFileAt(
  relPath: string,
  guideDir: string,
  searchRoots: string[] = [],
): string | null {
  const resolved = resolveRelativeFile(relPath, guideDir, searchRoots);
  if (!resolved) return null;
  return readFileSync(resolved, 'utf-8').trim();
}
