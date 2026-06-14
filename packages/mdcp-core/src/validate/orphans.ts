import { readdirSync, existsSync } from 'node:fs';
import { join, basename, relative, resolve } from 'node:path';
import { sectionFiles } from '../compile/assemble.js';

export interface OrphanIssue {
  type: 'orphan_shard' | 'missing_guide' | 'broken_manifest' | 'broken_toc';
  message: string;
  path?: string;
}

export interface GuideDirEntry {
  name: string;
  dir: string;
  manifest?: string;
  sectionsHeading?: string;
  scopeRoot?: string;
}

export function checkOrphansForGuides(guides: GuideDirEntry[]): OrphanIssue[] {
  const issues: OrphanIssue[] = [];
  const registered = new Set<string>();

  for (const guide of guides) {
    const { name, dir, manifest, sectionsHeading, scopeRoot } = guide;
    if (!existsSync(dir)) {
      issues.push({
        type: 'missing_guide',
        message: `Guide directory missing: ${name}`,
        path: dir,
      });
      continue;
    }

    let files: string[];
    try {
      files = sectionFiles(dir, {
        manifest,
        sectionsHeading,
        scopeRoot: scopeRoot ? resolve(scopeRoot) : undefined,
      });
    } catch (e) {
      issues.push({
        type: 'broken_toc',
        message: `Cannot read sections for ${name}: ${(e as Error).message}`,
        path: dir,
      });
      continue;
    }

    for (const f of files) {
      const relKey = f.startsWith(dir) ? join(name, relative(dir, f)) : join(name, basename(f));
      registered.add(relKey);
      if (!existsSync(f)) {
        issues.push({
          type: 'broken_manifest',
          message: `sections manifest lists missing file: ${relKey}`,
          path: f,
        });
      }
    }
  }

  for (const guide of guides) {
    const { name, dir, manifest = 'index.md' } = guide;
    if (!existsSync(dir)) continue;

    const skip = new Set([manifest, 'shards.md']);
    const onDisk = readdirSync(dir).filter((n: string) => n.endsWith('.md') && !skip.has(n));
    for (const f of onDisk) {
      const rel = join(name, f);
      if (!registered.has(rel)) {
        issues.push({
          type: 'orphan_shard',
          message: `Orphaned shard not in sections manifest: ${rel}`,
          path: join(dir, f),
        });
      }
    }
  }

  return issues;
}

/** @deprecated Use checkOrphansForGuides with explicit guide dirs. */
export function checkOrphans(guidesRoot: string, compileOrder: string[]): OrphanIssue[] {
  return checkOrphansForGuides(
    compileOrder.map((name) => ({
      name,
      dir: join(guidesRoot, name),
    })),
  );
}

export function guideDirEntriesFromNames(guidesRoot: string, names: string[]): GuideDirEntry[] {
  return names.map((name) => ({
    name,
    dir: join(guidesRoot, name),
  }));
}
