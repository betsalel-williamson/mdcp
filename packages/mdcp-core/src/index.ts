export {
  MdcpConfigSchema,
  type MdcpConfig,
  type MdcpConfigInput,
  type GuideConfig,
  type GuideConfigInput,
  type ExtensionSource,
  type ExtensionPack,
} from './config/schema.js';
export {
  resolveProtocolFetch,
  resolveLlmsIndexOutputFilename,
  type ProtocolFetch,
} from './config/protocol-source.js';
export {
  loadConfig,
  resolveOutputPath,
  resolveGuideLinkBase,
  resolveRefsPath,
  resolveDocsRoot,
  resolveGuideDir,
  getGuideConfig,
  guideScanDirs,
  shardLintPaths,
  xrefScanDirs,
  defaultGuideOutputFile,
  effectiveGuideOutputFile,
  resolveUnderOutputDir,
} from './config/load.js';
export {
  DEFAULT_COMPILE_HOOKS,
  resolveCompileHooks,
  type DefaultCompileHook,
} from './config/resolve-compile-hooks.js';
export {
  demoteHeadings,
  demoteExceptFirstH1,
  stripAboutThisGuideHeading,
  extractGuideH1,
} from './compile/headings.js';
export { stripExplicitAnchorMarkers } from './compile/anchors.js';
export {
  extractFirstHeading,
  stripFirstHeadingLine,
  formatCompileTitle,
} from './compile/compile-title.js';
export {
  registerCompileHook,
  applyCompileHooks,
  type CompileHook,
  type CompileHookContext,
} from './compile/hooks.js';
export {
  sectionFiles,
  processSection,
  assembleGuide,
  compileGuides,
  compileGuidesFromResults,
  compileGuideResults,
  compileGuideResultsWithContext,
  writeCompiledGuides,
  writeCompiledGuidesFromResults,
  buildGuideLinkIndex,
  type CompileGuideResult,
  type CompileOptions,
  type CompileOptionsInput,
  type GuideLinkIndex,
  type GuideLinkEntry,
  type BuildGuideLinkIndexResult,
  type SectionFilesOptions,
  type CompileGuideResultsContext,
} from './compile/assemble.js';
export {
  type ShardCache,
  type ShardSnapshot,
  createShardCache,
  loadShardSnapshot,
} from './compile/shard-cache.js';
export {
  writeOutputFile,
  resolveBackupPath,
  resolveBackupOptions,
  DEFAULT_BACKUP_DIR,
  type WriteOutputBackupOptions,
  type WriteOutputContext,
  type CliBackupOverrides,
} from './compile/write-output.js';
export {
  rewriteCrossGuideFileLinks,
  rewriteIntraGuideFileLinks,
  slugForSectionFile,
  type CrossGuideLinkRewriteOptions,
} from './compile/publish-links.js';
export {
  githubSlugify,
  headingTextToPlain,
  buildSlugRegistry,
  lookupHeadings,
  type HeadingEntry,
  type RefsRegistry,
} from './refs/slugs.js';
export {
  writeRefsRegistry,
  readRefsRegistry,
  checkRefsRegistry,
  genRefsFromCompiled,
} from './refs/registry.js';
export { lintXrefs } from './xrefs/lint.js';
export {
  lintLinks,
  lintCompiledLinks,
  lintShardLinks,
  markBrokenLinks,
  formatLinkIssue,
  extractLinks,
  validateCompiledLinkTarget,
  collectShardProvenance,
  type LinkIssue,
  type LinkSeverity,
  type LinkProvenance,
  type LintLinksOptions,
} from './links/lint.js';
export { checkOrphansForGuides, type OrphanIssue, type GuideDirEntry } from './validate/orphans.js';
export { stripForLlm, getLlmExportOptions } from './export/llm.js';
export {
  buildLlmsIndex,
  getLlmsIndexOutputFile,
  getLlmsIndexOptions,
  MDCP_CLI_NPX,
  MDCP_CLI_PACKAGE,
  type LlmsIndexOptions,
} from './export/llms-index.js';
export {
  LLMS_INDEX_PROTOCOL_VERSION,
  LLMS_INDEX_SPEC_DIR,
  LLMS_INDEX_PROFILE_ALPHA,
  LLMS_INDEX_PROFILE_DEV,
  defaultLlmsIndexFilename,
  resolveLlmsIndexProfilePath,
  resolveLlmsIndexSpecPath,
  resolveLlmsIndexSpecFile,
  parseLlmsIndexProfile,
  type LlmsIndexProfile,
  type LlmsIndexFilenameOptions,
} from './export/llms-index-artifacts.js';
export {
  AUTHORITATIVE_PROTOCOL_REPO,
  DEFAULT_LLMS_INDEX_UPSTREAM_REPO,
  DEFAULT_LLMS_INDEX_UPSTREAM_REF,
  buildGithubRawUrl,
  parseLlmsIndexHeader,
  parseLlmsIndexSymlinkTarget,
  resolveLlmsIndexSymlinkTargetPath,
  resolveUpstreamPath,
  resolveUpstreamRef,
  fetchLlmsIndexFromUpstream,
  resolveLlmsIndexFetchOptions,
  type LlmsIndexUpstreamOptions,
  type LlmsIndexFetchOptions,
  type LlmsIndexFetchResult,
} from './export/llms-index-fetch.js';
export {
  TASK_PROMPTS_SPEC_DIR,
  DEFAULT_TASK_PROMPTS_CACHE_DIR,
  STANDARD_TASK_PROMPT_FILES,
  defaultTaskPromptManifest,
  resolveTaskPromptsCacheDir,
  resolveTaskPromptSpecPath,
  type StandardTaskPromptFile,
  type TaskPromptManifest,
} from './export/task-prompts-artifacts.js';
export {
  fetchTaskPromptsFromUpstream,
  copyTaskPromptsFromLocalSpec,
  cacheEnabledExtensions,
  copyEnabledExtensionsFromLocalSpec,
  resolveEnabledExtensionPacks,
  resolveExtensionPackById,
  type TaskPromptsFetchOptions,
  type TaskPromptsFetchResult,
  type ExtensionCacheOptions,
  type ExtensionCacheResult,
  type ExtensionPackCacheResult,
  type CachedExtensionPackManifest,
  type ResolvedExtensionPack,
} from './export/task-prompts-fetch.js';
export {
  BUILTIN_EXTENSION_PACK_IDS,
  DEFAULT_PROMPTS_EXTENSION_ID,
  REFERENCE_EXTENSIONS_CATALOG,
  getBuiltinExtensionDefaults,
  isBuiltinExtensionPackId,
  type BuiltinExtensionPackId,
} from './extensions/builtins.js';
export {
  parseExtensionsCatalog,
  parseExtensionPackManifest,
  selectCompatibleExtensionVersion,
  resolveExtensionPackPath,
  resolveProtocolVersionRange,
  isProtocolCompatible,
  EXTENSIONS_CATALOG_FILE,
  EXTENSIONS_SPEC_DIR,
  type ExtensionsCatalog,
  type ExtensionCatalogEntry,
  type ExtensionVersionEntry,
  type ExtensionPackManifest,
} from './extensions/catalog.js';
export {
  protocolSatisfiesRange,
  protocolVersionToSemver,
  normalizeProtocolVersionRange,
  isSemverRangeSyntax,
  compareExtensionVersion,
} from './extensions/protocol-version-range.js';
export {
  resolveExtensionProtocolVersion,
  resolveExtensionFetchRef,
  loadExtensionsCatalog,
} from './extensions/version.js';
export { buildExtensionFileUrl } from './extensions/source-url.js';
export {
  scanPackFileReferences,
  scanPackReferences,
  formatExternalReferenceWarning,
  type PackExternalReference,
  type ExternalReferenceKind,
} from './extensions/scan-pack-references.js';
export {
  abbreviateProtocolVersion,
  expandProtocolVersion,
  parseLlmsIndexFilename,
  isLlmsIndexDraftFilename,
  protocolVersionToReleaseRef,
} from './export/protocol-version.js';
export { findPeerBinary, runPeer, type PeerTool } from './peers/resolve.js';
export { shardFromMonolith, runMdTree, type ShardGuideMapping } from './shard/orchestrator.js';
export {
  detectExistingDocs,
  runInit,
  buildDefaultConfig,
  parseInitPreset,
  INIT_PRESETS,
  type DocsDetectionResult,
  type RunInitOptions,
  type RunInitResult,
  type InitMode,
  type InitPreset,
} from './init/index.js';
