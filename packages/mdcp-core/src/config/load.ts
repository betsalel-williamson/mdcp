import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { MdcpConfigSchema, type MdcpConfig, type GuideConfig } from './schema.js';
import { resolveUnderOutputDir, defaultGuideOutputFile } from './paths.js';

export { defaultGuideOutputFile, resolveUnderOutputDir } from './paths.js';

export function loadConfig(configPath: string, configBase: string): MdcpConfig {
  const abs = resolve(configBase, configPath);
  if (!existsSync(abs)) {
    throw new Error(`Config not found: ${abs}`);
  }
  const raw = JSON.parse(readFileSync(abs, 'utf-8'));
  return MdcpConfigSchema.parse(raw);
}

export function resolveOutputPath(config: MdcpConfig, docsRoot: string): string | undefined {
  if (config.outputFile === undefined) return undefined;
  return resolveUnderOutputDir(docsRoot, config.outputDir, config.outputFile);
}

export function resolveRefsPath(docsRoot: string, outputDir: string, file: string): string {
  return resolveUnderOutputDir(docsRoot, outputDir, file);
}

/** Docs root — parent of guide shard directories (CLI `--docs-root`). */
export function resolveDocsRoot(_config: MdcpConfig, docsRoot: string): string {
  return docsRoot;
}

export function resolveGuideDir(name: string, config: MdcpConfig, docsRoot: string): string {
  const guide = config.guides?.find((g) => g.name === name);
  if (guide?.path) return resolve(docsRoot, guide.path);
  return join(docsRoot, name);
}

export function effectiveGuideOutputFile(
  guideName: string,
  compile: GuideConfig['compile'],
  compileOrderLength: number,
): string {
  return compile?.outputFile ?? defaultGuideOutputFile(guideName, compileOrderLength);
}

/** Absolute path to the rendered document readers open (per-guide output or monolith). */
export function resolveGuideLinkBase(
  config: { outputDir?: string; outputFile?: string },
  docsRoot: string,
  guideName: string,
  compileOrderLength: number,
  compile?: { outputFile?: string },
): string {
  const outputDir = config.outputDir ?? '_build';
  if (compile?.outputFile) {
    return resolveUnderOutputDir(docsRoot, outputDir, compile.outputFile);
  }
  if (config.outputFile !== undefined) {
    return resolveUnderOutputDir(docsRoot, outputDir, config.outputFile);
  }
  return resolveUnderOutputDir(
    docsRoot,
    outputDir,
    defaultGuideOutputFile(guideName, compileOrderLength),
  );
}

export function getGuideConfig(config: MdcpConfig, name: string): GuideConfig | undefined {
  return config.guides?.find((g) => g.name === name);
}

/** Registered guide directories under docsRoot — the mdcp-managed fileset. */
export function guideScanDirs(config: MdcpConfig, docsRoot: string): string[] {
  const dirs = new Set<string>();
  for (const name of config.compileOrder) {
    dirs.add(resolveGuideDir(name, config, docsRoot));
  }
  return [...dirs];
}

/** Shard markdownlint paths: optional shardsGlobs override, else guideScanDirs. */
export function shardLintPaths(config: MdcpConfig, docsRoot: string): string[] {
  const globs = config.lint?.markdownlint?.shardsGlobs;
  if (globs?.length) return globs.map((g) => resolve(docsRoot, g));
  return guideScanDirs(config, docsRoot);
}

export function xrefScanDirs(config: MdcpConfig, docsRoot: string): string[] {
  return guideScanDirs(config, docsRoot);
}
