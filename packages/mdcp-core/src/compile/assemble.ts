import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { demoteHeadings, stripAboutThisGuideHeading, extractGuideH1 } from './headings.js';
import { stripExplicitAnchorMarkers } from './anchors.js';
import { extractFirstHeading, stripFirstHeadingLine, formatCompileTitle } from './compile-title.js';
import { applyCompileHooks, createCompileHookState } from './hooks.js';
import './hooks/builtin.js';
import {
  buildSectionSlugMap,
  rewriteCrossGuideFileLinks,
  rewriteIntraGuideFileLinks,
  rewritePublishRelativeLinks,
} from './publish-links.js';
import { buildGuideLinkIndex, type GuideLinkIndex } from './guide-link-index.js';
import { linkedSectionFiles } from './section-manifest.js';
import type { GuideConfig, GuideConfigInput, MdcpConfigInput } from '../config/schema.js';
import {
  resolveGuideLinkBase,
  resolveUnderOutputDir,
  effectiveGuideOutputFile,
} from '../config/load.js';
import { resolveCompileHooks } from '../config/resolve-compile-hooks.js';
import { writeOutputFile, type WriteOutputBackupOptions } from './write-output.js';
import { collectShardProvenance } from '../links/validate-shards.js';
import { markBrokenLinks } from '../links/mark-broken.js';
import type { LinkProvenance } from '../links/mark-broken.js';

export { sectionFiles, linkedSectionFiles, type SectionFilesOptions } from './section-manifest.js';
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
  /** When set, rewrite shard-relative file links for this publish output path. */
  publishOutputFile?: string;
  config?: MdcpConfigInput;
  linkIndex?: GuideLinkIndex;
  /** Guide names whose cross-guide shard links keep source `.md` paths. */
  ignoreGuides?: string[];
  markBroken?: boolean;
  guideName?: string;
  knownOutputBasenames?: Set<string>;
  knownSlugs?: Set<string>;
}

export function assembleGuide(guideDir: string, options: AssembleGuideOptions = {}): string {
  const guideName = basename(guideDir);
  const manifestName = options.manifest ?? 'index.md';
  const indexPath = join(guideDir, manifestName);
  const indexText = readFileSync(indexPath, 'utf-8');
  const parts: string[] = [];

  const useTitle = options.title;
  const files = linkedSectionFiles(guideDir, {
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
  const provenance: LinkProvenance[] = [];

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const name = basename(filePath);
    if (!existsSync(filePath)) {
      throw new Error(`Missing section file: ${filePath}`);
    }
    provenance.push(...collectShardProvenance(filePath));
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
        currentGuideName: options.guideName ?? guideName,
        currentOutputBasename: options.outputBasename,
        currentOutputFile: options.outputFile,
        linkIndex: options.linkIndex,
        ignoreGuides: options.ignoreGuides,
      });
    }

    if (options.publishOutputFile) {
      body = rewritePublishRelativeLinks(body, {
        sourceFile: filePath,
        guideDir,
        scopeRoot: options.scopeRoot,
        currentGuideName: options.guideName ?? guideName,
        currentOutputFile: options.publishOutputFile,
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

  const intraSlugs = new Set(slugByBasename.values());
  const assemblingGuide = options.guideName ?? guideName;
  if (options.linkIndex && assemblingGuide) {
    for (const entry of options.linkIndex.values()) {
      if (entry.guideName === assemblingGuide) {
        intraSlugs.add(entry.slug);
      }
    }
  }
  const marked = markBrokenLinks(compiled, {
    outputFile: options.outputFile,
    provenance,
    enabled: options.markBroken !== false,
    guideName: options.guideName ?? guideName,
    compiledOutputPath: options.outputFile,
    knownOutputBasenames: options.knownOutputBasenames,
    knownSlugs: intraSlugs,
  });
  compiled = marked.markdown;

  return compiled;
}

export interface CompileGuideResult {
  name: string;
  text: string;
  outputFile: string;
  /** True when `compile.outputFile` was set explicitly (excluded from optional monolith). */
  publishOnly: boolean;
  includeBanner: boolean;
}

export interface CompileOptions {
  guidesRoot: string;
  compileOrder: string[];
  banner?: string;
  guides?: GuideConfigInput[];
  docsRoot?: string;
  config?: MdcpConfigInput;
  backup?: WriteOutputBackupOptions;
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
  const docsRoot = resolve(options.docsRoot ?? process.cwd());
  const orderLen = options.compileOrder.length;
  const linkIndex = buildGuideLinkIndex(options, docsRoot);
  const knownOutputBasenames = new Set(
    options.compileOrder.map((name) => {
      const cfg = guideConfigMap.get(name) as GuideConfig | undefined;
      const compile = cfg?.compile;
      const outputFile = effectiveGuideOutputFile(name, compile, orderLen);
      return basename(outputFile);
    }),
  );
  if (options.config?.outputFile !== undefined) {
    knownOutputBasenames.add(basename(options.config.outputFile));
  }

  return options.compileOrder.map((name) => {
    const cfg = guideConfigMap.get(name) as GuideConfig | undefined;
    const guideDir = resolveGuideDir(name, options.guidesRoot, cfg, docsRoot);
    const compile = cfg?.compile;
    const outputFile = effectiveGuideOutputFile(name, compile, orderLen);
    const publishOnly = Boolean(compile?.outputFile);
    const outputBasename = basename(outputFile);

    const linkBase = resolve(
      resolveGuideLinkBase(options.config ?? {}, docsRoot, name, orderLen, compile),
    );

    const text = assembleGuide(guideDir, {
      manifest: compile?.manifest,
      scopeRoot: compile?.scopeRoot ? resolve(docsRoot, compile.scopeRoot) : undefined,
      sectionsHeading: compile?.sectionsHeading,
      preambleSection: compile?.preambleSection,
      title: compile?.title,
      hooks: resolveCompileHooks(compile),
      stripAnchors: compile?.stripAnchors,
      outputBasename,
      outputFile: linkBase,
      publishOutputFile: publishOnly ? linkBase : undefined,
      config: options.config,
      linkIndex,
      ignoreGuides: compile?.crossGuideLinks?.ignoreGuides,
      markBroken: compile?.links?.markBroken,
      guideName: name,
      knownOutputBasenames,
    });

    const includeBanner = compile?.includeBanner ?? false;

    return {
      name,
      text,
      outputFile,
      publishOnly,
      includeBanner,
    };
  });
}

function monolithResults(results: CompileGuideResult[]): CompileGuideResult[] {
  return results.filter((r) => !r.publishOnly);
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
  if (options.banner) {
    return options.banner + body;
  }
  return body;
}

export function compileGuides(options: CompileOptions): string {
  const results = compileGuideResults(options);
  if (options.config?.outputFile !== undefined) {
    return applyMonolithBanner(options, results);
  }
  return results.map((r) => r.text).join('\n');
}

export function writeCompiledGuides(
  options: CompileOptions,
  monolithOutputPath?: string,
): { path: string; lines: number; backupPath?: string }[] {
  const results = compileGuideResults(options);
  const docsRoot = options.docsRoot ?? process.cwd();
  const outputDir = options.config?.outputDir ?? '_build';
  const writeCtx = { docsRoot, outputDir, backup: options.backup };
  const written: { path: string; lines: number; backupPath?: string }[] = [];

  for (const r of results) {
    const outPath = resolveUnderOutputDir(docsRoot, outputDir, r.outputFile);
    let text = r.text;
    if (options.banner && r.includeBanner) text = options.banner + text;
    const { backupPath } = writeOutputFile(outPath, text, writeCtx);
    written.push({ path: outPath, lines: text.split('\n').length, backupPath });
  }

  const monolith = monolithResults(results);
  if (monolithOutputPath && monolith.length > 0) {
    const combined = applyMonolithBanner(options, results);
    const { backupPath } = writeOutputFile(monolithOutputPath, combined, writeCtx);
    written.push({
      path: monolithOutputPath,
      lines: combined.split('\n').length,
      backupPath,
    });
  }

  return written;
}
