import { basename } from 'node:path';
import { resolve } from 'node:path';
import type { CompileGuideResult } from '../compile/assemble.js';
import type { MdcpConfig } from '../config/schema.js';
import { getGuideConfig, resolveGuideDir, resolveUnderOutputDir } from '../config/load.js';
import { sectionFiles } from '../compile/section-manifest.js';
import { buildGuideLinkIndex, type GuideLinkIndex } from '../compile/guide-link-index.js';
import { lintCompiledLinks } from './validate-compiled.js';
import { lintShardLinks } from './validate-shards.js';
import type { LinkIssue } from './types.js';

export type { LinkIssue, LinkSeverity } from './types.js';
export { formatLinkIssue } from './types.js';
export { markBrokenLinks, formatBrokenLinkMarker } from './mark-broken.js';
export type { LinkProvenance, MarkBrokenLinksOptions } from './mark-broken.js';
export { extractLinks } from './extract.js';
export { validateCompiledLinkTarget } from './validate.js';
export { lintShardLinks, collectShardProvenance } from './validate-shards.js';
export { lintCompiledLinks } from './validate-compiled.js';

export interface LintLinksOptions {
  config: MdcpConfig;
  docsRoot: string;
  results: CompileGuideResult[];
  /** When set, also lint shard sources. */
  lintShards?: boolean;
  compileOptions?: import('../compile/assemble.js').CompileOptions;
}

function disallowedShardPathsForPublisher(
  config: MdcpConfig,
  docsRoot: string,
  publishingGuideName: string,
  linkIndex: GuideLinkIndex,
): Set<string> {
  const ignoreGuides = new Set(
    getGuideConfig(config, publishingGuideName)?.compile?.crossGuideLinks?.ignoreGuides ?? [],
  );
  const disallowed = new Set<string>();
  const absDocsRoot = resolve(docsRoot);

  for (const name of config.compileOrder) {
    const cfg = getGuideConfig(config, name);
    const compile = cfg?.compile;
    const unpublished = !compile?.outputFile;
    const ignored = ignoreGuides.has(name);
    if (!unpublished && !ignored) continue;

    const guideDir = resolveGuideDir(name, config, absDocsRoot);
    for (const shardPath of linkIndex.keys()) {
      const absShard = resolve(shardPath);
      if (absShard === guideDir || absShard.startsWith(`${guideDir}/`)) {
        disallowed.add(absShard);
      }
    }
  }
  return disallowed;
}

export function lintLinks(options: LintLinksOptions): LinkIssue[] {
  const issues: LinkIssue[] = [];
  const { config, docsRoot, results } = options;
  const outputDir = config.outputDir;

  const knownOutputBasenames = new Set(results.map((r) => basename(r.outputFile)));
  if (config.outputFile !== undefined) {
    knownOutputBasenames.add(basename(config.outputFile));
  }

  const knownSlugs = new Set<string>();
  const absDocsRoot = resolve(docsRoot);
  const allowedPublishPaths = new Set(
    results
      .filter((r) => r.publishOnly)
      .map((r) => resolve(resolveUnderOutputDir(absDocsRoot, outputDir, r.outputFile))),
  );

  let linkIndex: GuideLinkIndex | undefined;
  if (options.compileOptions) {
    linkIndex = buildGuideLinkIndex(options.compileOptions, docsRoot);
    for (const entry of linkIndex.values()) {
      knownSlugs.add(entry.slug);
    }
  }

  if (options.lintShards) {
    for (const name of config.compileOrder) {
      const cfg = getGuideConfig(config, name);
      const guideDir = resolveGuideDir(name, config, docsRoot);
      const compile = cfg?.compile;
      const scopeRoot = compile?.scopeRoot ? resolve(docsRoot, compile.scopeRoot) : undefined;

      let files: string[];
      try {
        files = sectionFiles(guideDir, {
          manifest: compile?.manifest,
          scopeRoot,
          sectionsHeading: compile?.sectionsHeading,
        });
      } catch {
        continue;
      }

      for (const shardFile of files) {
        issues.push(
          ...lintShardLinks({ shardFile, guideDir, scopeRoot }).map((i) => ({
            ...i,
            guideName: name,
          })),
        );
      }
    }
  }

  for (const r of results) {
    const outPath = resolve(resolveUnderOutputDir(absDocsRoot, outputDir, r.outputFile));
    const disallowedShardPaths = linkIndex
      ? disallowedShardPathsForPublisher(config, docsRoot, r.name, linkIndex)
      : undefined;
    issues.push(
      ...lintCompiledLinks({
        markdown: r.text,
        outputFile: outPath,
        guideName: r.name,
        knownOutputBasenames,
        knownSlugs,
        publishOnly: r.publishOnly,
        allowedPublishPaths,
        disallowedShardPaths,
      }),
    );
  }

  return issues;
}
