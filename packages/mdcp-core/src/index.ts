export {
  MdcpConfigSchema,
  type MdcpConfig,
  type MdcpConfigInput,
  type GuideConfig,
  type GuideConfigInput,
} from './config/schema.js';
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
  compileGuideResults,
  writeCompiledGuides,
  buildGuideLinkIndex,
  type CompileOptionsInput,
  type GuideLinkIndex,
  type GuideLinkEntry,
  type SectionFilesOptions,
} from './compile/assemble.js';
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
export {
  checkOrphans,
  checkOrphansForGuides,
  type OrphanIssue,
  type GuideDirEntry,
} from './validate/orphans.js';
export { stripForLlm, getLlmExportOptions } from './export/llm.js';
export {
  buildLlmsIndex,
  defaultLlmsIndexFilename,
  getLlmsIndexOutputFile,
  getLlmsIndexOptions,
  LLMS_INDEX_PROTOCOL_VERSION,
  type LlmsIndexOptions,
} from './export/llms-index.js';
export {
  abbreviateProtocolVersion,
  expandProtocolVersion,
  parseLlmsIndexFilename,
} from './export/protocol-version.js';
export { findPeerBinary, runPeer, type PeerTool } from './peers/resolve.js';
export { shardFromMonolith, runMdTree, type ShardGuideMapping } from './shard/orchestrator.js';
