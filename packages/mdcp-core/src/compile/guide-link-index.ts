import { resolve, basename } from 'node:path';
import { buildSectionSlugMap } from './publish-links.js';
import { sectionFiles, linkedSectionFiles } from './section-manifest.js';
import { resolveUnderOutputDir, defaultGuideOutputFile } from '../config/paths.js';
import type { CompileOptions } from './assemble.js';

export interface GuideLinkEntry {
  guideName: string;
  outputBasename: string;
  /** Absolute path to the guide's compiled output file. */
  outputFile: string;
  slug: string;
}

/** Absolute shard path → compiled output target. */
export type GuideLinkIndex = Map<string, GuideLinkEntry>;

function isIndexableShardPath(
  filePath: string,
  guideDirs: Map<string, string>,
  compileOrder: string[],
  guidesRoot: string,
): boolean {
  const abs = resolve(filePath);
  const glossaryDir = resolve(guidesRoot, 'glossary');
  if (abs === glossaryDir || abs.startsWith(`${glossaryDir}/`)) return true;
  return guideForShardPath(abs, guideDirs, compileOrder) !== undefined;
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

function guideForShardPath(
  filePath: string,
  guideDirs: Map<string, string>,
  compileOrder: string[],
): string | undefined {
  for (const name of compileOrder) {
    const dir = guideDirs.get(name);
    if (!dir) continue;
    if (filePath === dir || filePath.startsWith(dir + '/')) return name;
  }
  return undefined;
}

function ownerPriority(
  filePath: string,
  guideName: string,
  manifestOwners: Map<string, string>,
  guideDirs: Map<string, string>,
  compileOrder: string[],
): number {
  if (manifestOwners.get(filePath) === guideName) return 3;
  if (guideForShardPath(filePath, guideDirs, compileOrder) === guideName) return 2;
  return 1;
}

function resolveShardOwner(
  filePath: string,
  compilingGuide: string,
  manifestOwners: Map<string, string>,
  guideDirs: Map<string, string>,
  compileOrder: string[],
): string {
  const manifestOwner = manifestOwners.get(filePath);
  if (manifestOwner) return manifestOwner;
  const pathOwner = guideForShardPath(filePath, guideDirs, compileOrder);
  if (pathOwner) return pathOwner;
  return compilingGuide;
}

function outputFileForGuide(
  guideName: string,
  compile: { outputFile?: string } | undefined,
  config: { outputFile?: string; outputDir?: string } | undefined,
  compileOrderLength: number,
  cwd: string,
): string {
  const rel =
    compile?.outputFile ??
    (config?.outputFile !== undefined
      ? config.outputFile
      : defaultGuideOutputFile(guideName, compileOrderLength));
  return resolveUnderOutputDir(cwd, config?.outputDir ?? '_build', rel);
}

/** Build a cross-guide link index from every guide in compileOrder. */
export function buildGuideLinkIndex(
  options: CompileOptions,
  cwd: string = options.docsRoot ?? process.cwd(),
): GuideLinkIndex {
  const guideConfigMap = new Map((options.guides ?? []).map((g) => [g.name, g]));
  const index: GuideLinkIndex = new Map();
  const manifestOwners = new Map<string, string>();
  const guideDirs = new Map<string, string>();

  for (const name of options.compileOrder) {
    const cfg = guideConfigMap.get(name);
    const compile = cfg?.compile;
    const guideDir = resolveGuideDir(name, options.guidesRoot, cfg?.path, cwd);
    guideDirs.set(name, guideDir);
    const manifestFiles = sectionFiles(guideDir, {
      manifest: compile?.manifest,
      scopeRoot: compile?.scopeRoot ? resolve(cwd, compile.scopeRoot) : undefined,
      sectionsHeading: compile?.sectionsHeading,
    });
    for (const f of manifestFiles) {
      manifestOwners.set(f, name);
    }
  }

  for (const name of options.compileOrder) {
    const cfg = guideConfigMap.get(name);
    const compile = cfg?.compile;
    const guideDir = guideDirs.get(name)!;
    const scopeRoot = compile?.scopeRoot ? resolve(cwd, compile.scopeRoot) : undefined;

    const files = linkedSectionFiles(guideDir, {
      manifest: compile?.manifest,
      scopeRoot,
      sectionsHeading: compile?.sectionsHeading,
    });
    const slugByPath = buildSectionSlugMap(files);

    for (const filePath of files) {
      if (!isIndexableShardPath(filePath, guideDirs, options.compileOrder, options.guidesRoot)) {
        continue;
      }
      const slug = slugByPath.get(resolve(filePath));
      if (!slug) continue;

      const owner = resolveShardOwner(
        filePath,
        name,
        manifestOwners,
        guideDirs,
        options.compileOrder,
      );
      const existing = index.get(filePath);
      if (
        existing &&
        ownerPriority(
          filePath,
          existing.guideName,
          manifestOwners,
          guideDirs,
          options.compileOrder,
        ) >= ownerPriority(filePath, owner, manifestOwners, guideDirs, options.compileOrder)
      ) {
        continue;
      }

      const ownerCfg = guideConfigMap.get(owner);
      const ownerCompile = ownerCfg?.compile;
      const outputFile = outputFileForGuide(
        owner,
        ownerCompile,
        options.config,
        options.compileOrder.length,
        cwd,
      );
      index.set(filePath, {
        guideName: owner,
        outputBasename: basename(outputFile),
        outputFile,
        slug,
      });
    }
  }

  return index;
}
