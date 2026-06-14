import { readFileSync, existsSync } from 'node:fs';
import { resolve, basename, dirname } from 'node:path';
import { buildSectionSlugMap } from './publish-links.js';
import { sectionFiles, type SectionFilesOptions } from './section-manifest.js';
import { defaultGuideOutputFile } from '../config/paths.js';
import type { CompileOptions } from './assemble.js';

export interface GuideLinkEntry {
  outputBasename: string;
  slug: string;
}

/** Absolute shard path → compiled output target. */
export type GuideLinkIndex = Map<string, GuideLinkEntry>;

const FILE_LINK_RE = /\[[^\]]*\]\(([^)]+\.md)(?:#[^)]*)?\)/g;

function collectLinkedSectionPaths(guideDir: string, options: SectionFilesOptions): string[] {
  const scope = options.scopeRoot ? resolve(options.scopeRoot) : null;
  const collected = new Set(sectionFiles(guideDir, options));
  const queue = [...collected];

  while (queue.length > 0) {
    const filePath = queue.shift()!;
    const text = readFileSync(filePath, 'utf-8');
    for (const match of text.matchAll(FILE_LINK_RE)) {
      const rel = match[1].split('#')[0];
      const resolved = resolve(dirname(filePath), rel);
      if (scope && !resolved.startsWith(scope + '/') && resolved !== scope) {
        continue;
      }
      if (!existsSync(resolved) || collected.has(resolved)) continue;
      collected.add(resolved);
      queue.push(resolved);
    }
  }

  return [...collected];
}

function resolveGuideDir(
  name: string,
  guidesRoot: string,
  guidePath: string | undefined,
  cwd: string,
): string {
  if (guidePath) return resolve(cwd, guidePath);
  return resolve(guidesRoot, name);
}

function outputBasenameForGuide(
  guideName: string,
  compile: { outputFile?: string } | undefined,
  config: { outputFile?: string } | undefined,
  compileOrderLength: number,
): string {
  if (compile?.outputFile) return basename(compile.outputFile);
  if (config?.outputFile !== undefined) return basename(config.outputFile);
  return basename(defaultGuideOutputFile(guideName, compileOrderLength));
}

/** Build a cross-guide link index from every guide in compileOrder. */
export function buildGuideLinkIndex(
  options: CompileOptions,
  cwd: string = options.docsRoot ?? process.cwd(),
): GuideLinkIndex {
  const guideConfigMap = new Map((options.guides ?? []).map((g) => [g.name, g]));
  const index: GuideLinkIndex = new Map();

  for (const name of options.compileOrder) {
    const cfg = guideConfigMap.get(name);
    const compile = cfg?.compile;
    const guideDir = resolveGuideDir(name, options.guidesRoot, cfg?.path, cwd);
    const scopeRoot = compile?.scopeRoot ? resolve(cwd, compile.scopeRoot) : undefined;

    const files = collectLinkedSectionPaths(guideDir, {
      manifest: compile?.manifest,
      scopeRoot,
      sectionsHeading: compile?.sectionsHeading,
    });
    const slugByBasename = buildSectionSlugMap(files);
    const outputBasename = outputBasenameForGuide(
      name,
      compile,
      options.config,
      options.compileOrder.length,
    );

    for (const filePath of files) {
      const slug = slugByBasename.get(basename(filePath));
      if (!slug) continue;
      index.set(filePath, { outputBasename, slug });
    }
  }

  return index;
}
