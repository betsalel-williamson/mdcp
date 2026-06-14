import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { MdcpConfigSchema, type MdcpConfig, type GuideConfig } from './schema.js';
import { resolveUnderOutputDir } from './paths.js';

export function loadConfig(configPath: string, configBase: string): MdcpConfig {
  const abs = resolve(configBase, configPath);
  if (!existsSync(abs)) {
    throw new Error(`Config not found: ${abs}`);
  }
  const raw = JSON.parse(readFileSync(abs, 'utf-8'));
  return MdcpConfigSchema.parse(raw);
}

export function resolveOutputPath(config: MdcpConfig, cwd: string): string {
  return resolveUnderOutputDir(cwd, config.outputDir, config.outputFile);
}

export function resolveRefsPath(cwd: string, outputDir: string, file: string): string {
  return resolveUnderOutputDir(cwd, outputDir, file);
}

export function resolveGuidesRoot(config: MdcpConfig, cwd: string): string {
  return resolve(cwd, config.outputDir);
}

export function resolveGuideDir(name: string, config: MdcpConfig, cwd: string): string {
  const guide = config.guides?.find((g) => g.name === name);
  if (guide?.path) return resolve(cwd, guide.path);
  return join(resolveGuidesRoot(config, cwd), name);
}

/** Absolute path to the rendered document readers open (per-guide output or monolith). */
export function resolveGuideLinkBase(
  config: { outputDir?: string; outputFile?: string },
  cwd: string,
  compile?: { outputFile?: string },
): string {
  if (compile?.outputFile) return resolve(cwd, compile.outputFile);
  const outputDir = config.outputDir ?? '.';
  const outputFile = config.outputFile ?? 'guides.md';
  return resolveUnderOutputDir(cwd, outputDir, outputFile);
}

export function getGuideConfig(config: MdcpConfig, name: string): GuideConfig | undefined {
  return config.guides?.find((g) => g.name === name);
}

export function xrefScanDirs(config: MdcpConfig, cwd: string): string[] {
  const dirs = new Set<string>();
  for (const name of config.compileOrder) {
    const guide = getGuideConfig(config, name);
    if (guide?.path) {
      dirs.add(resolve(cwd, guide.path));
    } else {
      dirs.add(join(resolveGuidesRoot(config, cwd), name));
    }
  }
  return [...dirs];
}
