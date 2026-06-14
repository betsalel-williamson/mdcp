import { mkdirSync, writeFileSync } from 'node:fs';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import {
  demoteHeadings,
  demoteExceptFirstH1,
  stripAboutThisGuideHeading,
  extractGuideH1,
} from './headings.js';
import { stripExplicitAnchorMarkers } from './anchors.js';
import { extractFirstHeading, stripFirstHeadingLine, formatCompileTitle } from './compile-title.js';
import { applyCompileHooks } from './hooks.js';
import './hooks/builtin.js';
import type { GuideConfig, MdcpConfig } from '../config/schema.js';

const FILE_LINK_RE = /\[[^\]]*\]\(([^)]+\.md)(?:#[^)]*)?\)/g;
const SLUG_LINK_RE = /\]\(#([^)]+)\)/g;

export interface SectionFilesOptions {
  manifest?: string;
  scopeRoot?: string;
}

function resolveManifestPaths(
  guideDir: string,
  text: string,
  options: SectionFilesOptions,
): string[] {
  const scope = options.scopeRoot ? resolve(options.scopeRoot) : null;
  const files: string[] = [];

  for (const match of text.matchAll(FILE_LINK_RE)) {
    const rel = match[1].split('#')[0];
    const resolved = resolve(guideDir, rel);
    if (scope && !resolved.startsWith(scope + '/') && resolved !== scope) {
      continue;
    }
    if (!files.includes(resolved)) files.push(resolved);
  }

  for (const match of text.matchAll(SLUG_LINK_RE)) {
    const slug = match[1];
    if (slug === 'table-of-contents') continue;
    const name = `${slug}.md`;
    const local = join(guideDir, name);
    if (existsSync(local) && !files.includes(local)) {
      files.push(local);
    }
  }

  return files;
}

export function sectionFiles(guideDir: string, options: SectionFilesOptions = {}): string[] {
  const manifestName = options.manifest ?? 'index.md';
  const indexPath = join(guideDir, manifestName);
  if (!existsSync(indexPath)) {
    throw new Error(`No ${manifestName} in ${guideDir}`);
  }

  const text = readFileSync(indexPath, 'utf-8');
  const manifestPath = join(guideDir, 'sections.txt');

  if (existsSync(manifestPath)) {
    return readFileSync(manifestPath, 'utf-8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) =>
        l.startsWith('/') || l.includes('/') ? resolve(guideDir, l) : join(guideDir, l),
      );
  }

  const resolved = resolveManifestPaths(guideDir, text, options);
  if (resolved.length > 0) return resolved;

  return readdirSync(guideDir)
    .filter((n) => n.endsWith('.md') && n !== manifestName && n !== 'shards.md')
    .sort()
    .map((n) => join(guideDir, n));
}

export function processSection(
  guideName: string,
  filename: string,
  content: string,
  keepSecondH1?: string[],
): string {
  if (filename === 'about-this-guide.md') {
    const body = stripAboutThisGuideHeading(content);
    return body.trim() ? demoteHeadings(body, 1) : body;
  }

  if (guideName === 'overview' && keepSecondH1?.some((s) => filename.includes(s))) {
    return demoteExceptFirstH1(content);
  }

  if (guideName === 'overview' && filename.includes('coverage-and-where-to-look')) {
    return demoteExceptFirstH1(content);
  }

  return demoteHeadings(content, 1);
}

export interface AssembleGuideOptions {
  keepSecondH1?: string[];
  manifest?: string;
  scopeRoot?: string;
  title?: string;
  hooks?: string[];
  stripAnchors?: boolean;
  outputBasename?: string;
  config?: MdcpConfig;
}

export function assembleGuide(guideDir: string, options: AssembleGuideOptions = {}): string {
  const guideName = basename(guideDir);
  const manifestName = options.manifest ?? 'index.md';
  const indexPath = join(guideDir, manifestName);
  const indexText = readFileSync(indexPath, 'utf-8');
  const parts: string[] = [];

  const useTitle = options.title;
  const files = sectionFiles(guideDir, {
    manifest: manifestName,
    scopeRoot: options.scopeRoot,
  });

  if (useTitle) {
    parts.push(formatCompileTitle(useTitle), '');
  } else {
    const h1 = extractGuideH1(indexText);
    if (h1) parts.push(h1);
  }

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const name = basename(filePath);
    if (!existsSync(filePath)) {
      throw new Error(`Missing section file: ${filePath}`);
    }
    let raw = readFileSync(filePath, 'utf-8').trim();

    if (i === 0 && useTitle) {
      const firstHeading = extractFirstHeading(raw);
      if (firstHeading.text === useTitle) {
        raw = stripFirstHeadingLine(raw);
      }
    }

    let body = processSection(guideName, name, raw, options.keepSecondH1).trimEnd();

    body = applyCompileHooks(
      body,
      {
        guideName,
        filename: name,
        config: options.config ?? ({} as MdcpConfig),
        outputBasename: options.outputBasename,
        sourceFile: filePath,
      },
      options.hooks,
    );

    parts.push(body + '\n\n');
  }

  let compiled =
    parts
      .join('')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n';

  if (options.stripAnchors !== false) {
    compiled = stripExplicitAnchorMarkers(compiled);
  }

  return compiled;
}

export interface CompileGuideResult {
  name: string;
  text: string;
  outputFile?: string;
}

export interface CompileOptions {
  guidesRoot: string;
  compileOrder: string[];
  banner?: string;
  guides?: GuideConfig[];
  cwd?: string;
  config?: MdcpConfig;
}

function resolveGuideDir(
  name: string,
  guidesRoot: string,
  guideCfg: GuideConfig | undefined,
  cwd: string,
): string {
  if (guideCfg?.path) return resolve(cwd, guideCfg.path);
  return join(guidesRoot, name);
}

export function compileGuideResults(options: CompileOptions): CompileGuideResult[] {
  const guideConfigMap = new Map((options.guides ?? []).map((g) => [g.name, g]));
  const cwd = options.cwd ?? process.cwd();

  return options.compileOrder.map((name) => {
    const cfg = guideConfigMap.get(name);
    const guideDir = resolveGuideDir(name, options.guidesRoot, cfg, cwd);
    const compile = cfg?.compile;
    const outputBasename = compile?.outputFile ? basename(compile.outputFile) : undefined;

    const text = assembleGuide(guideDir, {
      keepSecondH1: compile?.keepSecondH1,
      manifest: compile?.manifest,
      scopeRoot: compile?.scopeRoot ? resolve(cwd, compile.scopeRoot) : undefined,
      title: compile?.title,
      hooks: compile?.hooks,
      stripAnchors: compile?.stripAnchors,
      outputBasename,
      config: options.config,
    });

    return {
      name,
      text,
      outputFile: compile?.outputFile,
    };
  });
}

export function compileGuides(options: CompileOptions): string {
  const results = compileGuideResults(options);
  const separateOutputs = results.some((r) => r.outputFile);

  if (separateOutputs) {
    return results.map((r) => r.text).join('\n');
  }

  const parts: string[] = [];
  for (const r of results) {
    parts.push(r.text, '\n');
  }

  const body = parts.join('');
  return options.banner ? options.banner + body : body;
}

export function writeCompiledGuides(
  options: CompileOptions,
  defaultOutputPath: string,
): { path: string; lines: number }[] {
  const results = compileGuideResults(options);
  const separateOutputs = results.some((r) => r.outputFile);
  const cwd = options.cwd ?? process.cwd();
  const written: { path: string; lines: number }[] = [];

  if (separateOutputs) {
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (!r.outputFile) continue;
      const outPath = resolve(cwd, r.outputFile);
      let text = r.text;
      if (options.banner && i === 0) text = options.banner + text;
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, text, 'utf-8');
      written.push({ path: outPath, lines: text.split('\n').length });
    }
    return written;
  }

  const combined = compileGuides(options);
  mkdirSync(dirname(defaultOutputPath), { recursive: true });
  writeFileSync(defaultOutputPath, combined, 'utf-8');
  written.push({
    path: defaultOutputPath,
    lines: combined.split('\n').length,
  });
  return written;
}
