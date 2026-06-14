import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { buildSlugRegistry, type RefsRegistry } from './slugs.js';

export function writeRefsRegistry(registry: RefsRegistry, outputPath: string): void {
  writeFileSync(outputPath, JSON.stringify(registry, null, 2) + '\n', 'utf-8');
}

export function readRefsRegistry(path: string): RefsRegistry {
  return JSON.parse(readFileSync(path, 'utf-8')) as RefsRegistry;
}

export function checkRefsRegistry(
  compiledText: string,
  registryPath: string,
): { ok: boolean; message: string } {
  const fresh = buildSlugRegistry(compiledText);
  const freshJson = JSON.stringify(fresh, null, 2) + '\n';

  if (!existsSync(registryPath)) {
    return { ok: false, message: `Missing ${registryPath}; run: mdcp refs gen` };
  }

  const existing = readFileSync(registryPath, 'utf-8');
  if (existing !== freshJson) {
    return { ok: false, message: 'refs.json is stale; run: mdcp refs gen' };
  }
  return { ok: true, message: 'refs.json is up to date' };
}

export function genRefsFromCompiled(compiledText: string, registryPath: string): RefsRegistry {
  const registry = buildSlugRegistry(compiledText);
  writeRefsRegistry(registry, registryPath);
  return registry;
}
