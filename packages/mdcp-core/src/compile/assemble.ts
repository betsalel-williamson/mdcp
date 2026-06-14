import { mkdirSync, writeFileSync } from 'node:fs';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { demoteHeadings, stripAboutThisGuideHeading, extractGuideH1 } from './headings.js';
import { stripExplicitAnchorMarkers } from './anchors.js';
import { extractFirstHeading, stripFirstHeadingLine, formatCompileTitle } from './compile-title.js';
import { applyCompileHooks, createCompileHookState } from './hooks.js';
import './hooks/builtin.js';
import {
  buildSectionSlugMap,
  rewriteCrossGuideFileLinks,
  rewriteIntraGuideFileLinks,
  rewritePublishPathLinks,
} from './publish-links.js';
import { buildGuideLinkIndex, type GuideLinkIndex } from './guide-link-index.js';
import { sectionFiles } from './section-manifest.js';
import type { GuideConfig, GuideConfigInput, MdcpConfigInput } from '../config/schema.js';
import { resolveGuideLinkBase } from '../config/load.js';
import type { PublishPathRewriteOptions } from './publish-links.js';

export { sectionFiles, type SectionFilesOptions } from './section-manifest.js';
export {
  buildGuideLinkIndex,
  type GuideLinkIndex,
  type GuideLinkEntry,
} from './guide-link-index.js';

export function processSection(
  guideName: string,
  filename: string,
  content: string,
  preambleSection = 'about-this-guide.md',
): string {
  if (filename === preambleSection) {
    const body = stripAboutThisGuideHeading(content);
    return body.trim() ? demoteHeadings(body, 1) : body;
  }

  return demoteHeadings(content, 1);
}

export interface AssembleGuideOptions {
  manifest?: string;
  scopeRoot?: string;
  sectionsHeading?: string;
  preambleSection?: string;
  title?: string;
  hooks?: string[];
  stripAnchors?: boolean;
  outputBasename?: string;
  /** Absolute path to the rendered document (per-guide output or monolith). */
  outputFile?: string;
  publishPathRewrite?: PublishPathRewriteOptions;
  config?: MdcpConfigInput;
  linkIndex?: GuideLinkIndex;
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
    sectionsHeading: options.sectionsHeading,
  });

  if (useTitle) {
    parts.push(`${formatCompileTitle(useTitle)}\n\n`);
  } else {
    const h1 = extractGuideH1(indexText);
    if (h1) parts.push(h1);
  }

  const hookState = createCompileHookState();

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

    let body = processSection(guideName, name, raw, options.preambleSection).trimEnd();

    body = applyCompileHooks(
      body,
      {
        guideName,
        filename: name,
        config: options.config ?? ({} as MdcpConfigInput),
        outputBasename: options.outputBasename,
        outputFile: options.outputFile,
        scopeRoot: options.scopeRoot,
        sourceFile: filePath,
        hookState,
        linkIndex: options.linkIndex,
      },
      options.hooks,
    );

    if (options.linkIndex) {
      body = rewriteCrossGuideFileLinks(body, {
        sourceFile: filePath,
        guideDir,
        scopeRoot: options.scopeRoot,
        currentOutputBasename: options.outputBasename,
        linkIndex: options.linkIndex,
      });
    }

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

  const slugByBasename = buildSectionSlugMap(files);
  compiled = rewriteIntraGuideFileLinks(compiled, slugByBasename);

  if (options.publishPathRewrite) {
    compiled = rewritePublishPathLinks(compiled, options.publishPathRewrite);
  }

  return compiled;
}

export interface CompileGuideResult {
  name: string;
  text: string;
  outputFile?: string;
  includeBanner: boolean;
}

export interface CompileOptions {
  guidesRoot: string;
  compileOrder: string[];
  banner?: string;
  guides?: GuideConfigInput[];
  cwd?: string;
  config?: MdcpConfigInput;
}

/** Alias for partial compile options in tests and callers that omit Zod defaults. */
export type CompileOptionsInput = CompileOptions;

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
  const linkIndex = buildGuideLinkIndex(options, cwd);

  return options.compileOrder.map((name) => {
    const cfg = guideConfigMap.get(name) as GuideConfig | undefined;
    const guideDir = resolveGuideDir(name, options.guidesRoot, cfg, cwd);
    const compile = cfg?.compile;
    const outputBasename = compile?.outputFile ? basename(compile.outputFile) : undefined;

    const linkBase = resolveGuideLinkBase(options.config ?? {}, cwd, compile);

    const text = assembleGuide(guideDir, {
      manifest: compile?.manifest,
      scopeRoot: compile?.scopeRoot ? resolve(cwd, compile.scopeRoot) : undefined,
      sectionsHeading: compile?.sectionsHeading,
      preambleSection: compile?.preambleSection,
      title: compile?.title,
      hooks: compile?.hooks,
      stripAnchors: compile?.stripAnchors,
      outputBasename,
      outputFile: linkBase,
      publishPathRewrite: compile?.publishPathRewrite,
      config: options.config,
      linkIndex,
    });

    const outputFile = compile?.outputFile;
    const includeBanner = compile?.includeBanner ?? (outputFile === undefined ? true : false);

    return {
      name,
      text,
      outputFile,
      includeBanner,
    };
  });
}

function monolithResults(results: CompileGuideResult[]): CompileGuideResult[] {
  return results.filter((r) => !r.outputFile);
}

function buildMonolithBody(results: CompileGuideResult[]): string {
  const monolith = monolithResults(results);
  if (monolith.length === 0) return '';

  const parts: string[] = [];
  for (let i = 0; i < monolith.length; i++) {
    const text = i === 0 ? monolith[i].text : demoteHeadings(monolith[i].text, 1);
    parts.push(text, '\n');
  }
  return parts.join('');
}

function applyMonolithBanner(options: CompileOptions, results: CompileGuideResult[]): string {
  const body = buildMonolithBody(results);
  if (!body) return '';

  const monolith = monolithResults(results);
  const bannerGuide = monolith.find((r) => r.includeBanner);
  if (options.banner && bannerGuide) {
    return options.banner + body;
  }
  return body;
}

export function compileGuides(options: CompileOptions): string {
  const results = compileGuideResults(options);
  const hasPublishOutputs = results.some((r) => r.outputFile);
  const monolith = monolithResults(results);

  if (!hasPublishOutputs) {
    const body = buildMonolithBody(results);
    return options.banner ? options.banner + body : body;
  }

  if (monolith.length === 0) {
    return '';
  }

  return applyMonolithBanner(options, results);
}

export function writeCompiledGuides(
  options: CompileOptions,
  defaultOutputPath: string,
): { path: string; lines: number }[] {
  const results = compileGuideResults(options);
  const cwd = options.cwd ?? process.cwd();
  const written: { path: string; lines: number }[] = [];

  for (const r of results) {
    if (!r.outputFile) continue;
    const outPath = resolve(cwd, r.outputFile);
    let text = r.text;
    if (options.banner && r.includeBanner) text = options.banner + text;
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, text, 'utf-8');
    written.push({ path: outPath, lines: text.split('\n').length });
  }

  const monolith = monolithResults(results);
  if (monolith.length > 0) {
    const combined = applyMonolithBanner(options, results);
    mkdirSync(dirname(defaultOutputPath), { recursive: true });
    writeFileSync(defaultOutputPath, combined, 'utf-8');
    written.push({
      path: defaultOutputPath,
      lines: combined.split('\n').length,
    });
  }

  return written;
}
