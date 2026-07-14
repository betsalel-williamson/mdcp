#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadConfig,
  resolveOutputPath,
  resolveDocsRoot,
  resolveGuideDir,
  getGuideConfig,
  guideScanDirs,
  shardLintPaths,
  xrefScanDirs,
  checkOrphansForGuides,
  genRefsFromCompiled,
  checkRefsRegistry,
  resolveRefsPath,
  lookupHeadings,
  readRefsRegistry,
  lintXrefs,
  stripForLlm,
  getLlmExportOptions,
  findPeerBinary,
  runPeer,
  shardFromMonolith,
  buildSlugRegistry,
  writeOutputFile,
  resolveBackupOptions,
  formatLinkIssue,
  type LinkIssue,
  type LinkSeverity,
  type MdcpConfig,
} from '@bwilliamson/mdcp-core';
import {
  compileWorkspace,
  writeCompiledFromWorkspace,
  runBuiltInLinkLintFromWorkspace,
  resolveLinkSeverity,
} from './compile-workspace.js';

interface GlobalOpts {
  config: string;
  docsRoot?: string;
  backup?: boolean;
  backupDir?: string;
  backupExt?: string;
  warnBrokenLinks?: boolean;
}

function getDocsRoot(opts: GlobalOpts): string {
  return opts.docsRoot ?? process.cwd();
}

function getConfig(opts: GlobalOpts) {
  return loadConfig(opts.config, process.cwd());
}

function valeScanPaths(config: MdcpConfig, docsRoot: string): string[] {
  return (
    config.vale?.scanGlobs?.map((g) => resolve(docsRoot, g)) ?? guideScanDirs(config, docsRoot)
  );
}

function guideEntries(config: MdcpConfig, docsRoot: string) {
  return config.compileOrder.map((name) => {
    const cfg = getGuideConfig(config, name);
    return {
      name,
      dir: resolveGuideDir(name, config, docsRoot),
      manifest: cfg?.compile?.manifest,
      sectionsHeading: cfg?.compile?.sectionsHeading,
      scopeRoot: cfg?.compile?.scopeRoot ? resolve(docsRoot, cfg.compile.scopeRoot) : undefined,
    };
  });
}

function valeMinAlertLevel(config: MdcpConfig, strictFlag?: boolean): string | undefined {
  if (strictFlag) return 'error';
  return config.vale?.strictMinAlertLevel;
}

function resolveLinkTarget(config: MdcpConfig, docsRoot: string): string | undefined {
  if (config.lint?.links?.target) return config.lint.links.target;
  return resolveOutputPath(config, docsRoot);
}

function cliBackupFlags(opts: GlobalOpts) {
  return {
    backup: opts.backup,
    backupDir: opts.backupDir,
    backupExt: opts.backupExt,
  };
}

function backupOptions(config: MdcpConfig, opts: GlobalOpts) {
  return resolveBackupOptions(config, cliBackupFlags(opts));
}

/** Print link diagnostics; returns true when caller should fail (severity error + issues). */
function reportLinkIssues(issues: LinkIssue[], severity: LinkSeverity): boolean {
  for (const issue of issues) {
    console.error(formatLinkIssue(issue, severity));
  }
  return severity === 'error' && issues.length > 0;
}

function runBuiltInLinkLint(
  config: MdcpConfig,
  docsRoot: string,
  globalOpts: GlobalOpts,
  workspace: ReturnType<typeof compileWorkspace>,
): boolean {
  const issues = runBuiltInLinkLintFromWorkspace(config, docsRoot, workspace);
  const severity = resolveLinkSeverity(globalOpts.warnBrokenLinks, config);
  return reportLinkIssues(issues, severity);
}

function compileToString(config: MdcpConfig, docsRoot: string, globalOpts: GlobalOpts): string {
  return compileWorkspace(config, docsRoot, cliBackupFlags(globalOpts)).compiled;
}

function logWritten(results: { path: string; lines: number; backupPath?: string }[]): void {
  for (const r of results) {
    if (r.backupPath) console.log(`backed up → ${r.backupPath}`);
    console.log(`→ ${r.path} (${r.lines} lines)`);
  }
}

function writeCompiled(config: MdcpConfig, docsRoot: string, globalOpts: GlobalOpts): string {
  const workspace = compileWorkspace(config, docsRoot, cliBackupFlags(globalOpts));
  const written = writeCompiledFromWorkspace(config, docsRoot, workspace);
  logWritten(written);
  return workspace.compiled;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8')) as {
  version: string;
};

const program = new Command();

program
  .name('mdcp')
  .description('MarkDown Context Protocol')
  .version(pkg.version)
  .option(
    '-c, --config <path>',
    'config file (relative to invocation directory)',
    'mdcp.config.json',
  )
  .option('--docs-root <path>', 'docs root (guide shard directories)')
  .option('--backup', 'Move existing output files to cache before overwrite')
  .option('--backup-dir <path>', 'Backup directory relative to outputDir')
  .option('--backup-ext <ext>', 'Suffix for backup filenames')
  .option('--warn-broken-links', 'Report broken links but exit 0');

program
  .command('compile')
  .description('Compile shards to monolith')
  .action((_, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const docsRoot = getDocsRoot(opts);
    const workspace = compileWorkspace(config, docsRoot, cliBackupFlags(opts));
    const written = writeCompiledFromWorkspace(config, docsRoot, workspace);
    logWritten(written);
    const refsPath = resolveRefsPath(docsRoot, config.outputDir, config.refs.registryFile);
    genRefsFromCompiled(workspace.compiled, refsPath);
    if (runBuiltInLinkLint(config, docsRoot, opts, workspace)) process.exit(1);
  });

const refs = program.command('refs').description('Heading slug registry (JSON default)');

refs
  .command('gen')
  .description('Generate refs.json from compiled output')
  .action((_, cmd) => {
    const opts = cmd.parent.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const compiled = writeCompiled(config, getDocsRoot(opts), opts);
    const refsPath = resolveRefsPath(getDocsRoot(opts), config.outputDir, config.refs.registryFile);
    genRefsFromCompiled(compiled, refsPath);
    console.log(`Wrote ${refsPath}`);
  });

refs
  .command('check')
  .description('Verify refs.json matches compiled output')
  .action((_, cmd) => {
    const opts = cmd.parent.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const compiled = compileToString(config, getDocsRoot(opts), opts);
    const refsPath = resolveRefsPath(getDocsRoot(opts), config.outputDir, config.refs.registryFile);
    const result = checkRefsRegistry(compiled, refsPath);
    console.log(result.message);
    if (!result.ok) process.exit(1);
  });

refs
  .command('list')
  .description('List heading slugs as JSON')
  .option('--format <fmt>', 'json or table', 'json')
  .action((listOpts, cmd) => {
    const opts = cmd.parent.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const refsPath = resolveRefsPath(getDocsRoot(opts), config.outputDir, config.refs.registryFile);
    const registry = readRefsRegistry(refsPath);
    if (listOpts.format === 'table') {
      for (const h of registry.headings) {
        console.log(`${h.slug}\t${h.title}`);
      }
    } else {
      console.log(JSON.stringify(registry.headings, null, 2));
    }
  });

refs
  .command('lookup <query>')
  .description('Fuzzy-find headings (JSON)')
  .option('--format <fmt>', 'json or table', 'json')
  .action((query, lookupOpts, cmd) => {
    const opts = cmd.parent.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const compiled = compileToString(config, getDocsRoot(opts), opts);
    const registry = buildSlugRegistry(compiled);
    const matches = lookupHeadings(registry, query);
    if (lookupOpts.format === 'table') {
      for (const m of matches) {
        console.log(`${m.slug}\t${m.title}`);
      }
    } else {
      console.log(JSON.stringify(matches, null, 2));
    }
  });

program
  .command('export')
  .description('Export compiled document')
  .option('--llm', 'Token-optimized output for LLM context')
  .option('--llms-index', 'Write mdcp.v*.llms.txt agent index for docs root')
  .option('--fetch', 'Fetch mdcp.v*.llms.txt from upstream GitHub (see --fetch-repo, --fetch-ref)')
  .option('--fetch-repo <repo>', 'Upstream owner/repo (default betsalel-williamson/mdcp)')
  .option(
    '--fetch-ref <ref>',
    'Upstream git ref: main, latest (release tag), branch, or tag (e.g. v1.0.0)',
  )
  .option(
    '--fetch-profile <profile>',
    'Spec artifact profile: alpha (valpha) or dev (vdev); default dev',
  )
  .option('--fetch-path <path>', 'Path in upstream repo (default spec/llms-index/vdev or valpha)')
  .option('--fetch-local', 'Read from local spec/llms-index/ in repo root instead of GitHub')
  .option('--stdout', 'Write to stdout instead of file')
  .action(async (exportOpts, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const docsRoot = getDocsRoot(opts);

    const config = getConfig(opts);
    let text = compileToString(config, docsRoot, opts);
    if (exportOpts.llm) {
      text = stripForLlm(text, getLlmExportOptions(config));
    }
    if (exportOpts.stdout) {
      process.stdout.write(text);
    } else {
      const monolithPath = resolveOutputPath(config, docsRoot);
      const base = monolithPath ?? resolve(docsRoot, config.outputDir, 'guide.md');
      const outPath = base.replace(/\.md$/, '.llm.md');
      const { backupPath } = writeOutputFile(outPath, text, {
        docsRoot,
        outputDir: config.outputDir,
        backup: backupOptions(config, opts),
      });
      if (backupPath) console.log(`backed up → ${backupPath}`);
      console.log(`→ ${outPath}`);
    }
  });

program
  .command('lint')
  .description('Run markdownlint-cli2 (peer)')
  .option('--require-lint', 'Fail if markdownlint not installed')
  .action((lintOpts, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const tool = findPeerBinary('markdownlint-cli2', getDocsRoot(opts));
    const shardsCfg = config.lint?.markdownlint?.shardsConfig;
    const compiledCfg = config.lint?.markdownlint?.compiledConfig;

    if (shardsCfg) {
      const shardPaths = shardLintPaths(config, getDocsRoot(opts));
      const r = runPeer(tool, {
        require: lintOpts.requireLint,
        cwd: getDocsRoot(opts),
        args: ['--config', shardsCfg, ...shardPaths],
      });
      if (r.exitCode !== 0) process.exit(r.exitCode);
    }

    writeCompiled(config, getDocsRoot(opts), opts);

    if (compiledCfg) {
      const r = runPeer(tool, {
        require: lintOpts.requireLint,
        cwd: getDocsRoot(opts),
        args: ['--config', compiledCfg],
      });
      if (r.exitCode !== 0) process.exit(r.exitCode);
    }
  });

program
  .command('prose')
  .description('Run Vale prose lint (peer)')
  .option('--strict', 'Errors only')
  .option('--require-vale', 'Fail if Vale not installed')
  .action((proseOpts, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const tool = findPeerBinary('vale', getDocsRoot(opts));
    const scanPaths = valeScanPaths(config, getDocsRoot(opts));
    const valeConfig = config.vale?.config ?? '.vale.ini';
    const minLevel = valeMinAlertLevel(config, proseOpts.strict);
    const args = minLevel
      ? ['--config', valeConfig, `--minAlertLevel=${minLevel}`, ...scanPaths]
      : ['--config', valeConfig, ...scanPaths];
    const r = runPeer(tool, { require: proseOpts.requireVale, cwd: getDocsRoot(opts), args });
    if (r.exitCode !== 0) process.exit(r.exitCode);
  });

program
  .command('links')
  .description('Run markdown-link-check (peer)')
  .action((_, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    writeCompiled(config, getDocsRoot(opts), opts);
    const tool = findPeerBinary('markdown-link-check', getDocsRoot(opts));
    const target = resolveLinkTarget(config, getDocsRoot(opts));
    const linkCfg = config.lint?.links?.config;
    if (!target) {
      console.error('mdcp links: set lint.links.target or outputFile in config');
      process.exit(1);
    }
    const args = linkCfg ? [target, '--config', linkCfg] : [target];
    const r = runPeer(tool, { cwd: getDocsRoot(opts), args });
    if (r.exitCode !== 0) process.exit(r.exitCode);
  });

program
  .command('fix')
  .description('Auto-fix with Prettier + markdownlint (peer)')
  .action((_, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const prettier = findPeerBinary('prettier', getDocsRoot(opts));
    runPeer(prettier, { cwd: getDocsRoot(opts), args: ['--write', '.'] });
    const mdlint = findPeerBinary('markdownlint-cli2', getDocsRoot(opts));
    runPeer(mdlint, { cwd: getDocsRoot(opts), args: ['--fix'] });
  });

program
  .command('shard')
  .description('Split monolith into shards (md-tree)')
  .action((_, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    if (!config.source) {
      console.error('Config requires "source" for shard command');
      process.exit(1);
    }
    const guidesRoot = resolveDocsRoot(config, getDocsRoot(opts));
    const sourceFile = resolve(getDocsRoot(opts), config.source);

    const mappings = (config.guides ?? []).map((g) => {
      if (g.source?.type === 'directory') {
        return { name: g.name, directoryPath: g.source.path, splitLevel: g.splitLevel };
      }
      if (g.source?.type === 'merge') {
        return {
          name: g.name,
          mergeH1Indices: g.source.parts.map((p) => p.fromH1Extract),
          demoteFirstH1InMerge: g.source.parts.map((p) => p.demoteFirstH1 ?? false),
          splitLevel: g.splitLevel,
        };
      }
      if (g.source?.type === 'h1Extract') {
        return { name: g.name, h1Index: g.source.index, splitLevel: g.splitLevel };
      }
      throw new Error(`Guide ${g.name} needs h1Extract, merge, or directory source for shard`);
    });

    const firstSource = config.guides?.[0]?.source;
    const preambleHeading =
      firstSource && firstSource.type !== 'directory'
        ? firstSource.preamble?.promoteToH2
        : undefined;

    shardFromMonolith({
      sourceFile,
      guidesRoot,
      mappings,
      compileOrder: config.compileOrder,
      preambleHeading,
    });

    console.log('Done. Edit shards and run: mdcp compile');
  });

program
  .command('check')
  .description('Full validation gate')
  .option('--require-lint', 'Require markdownlint-cli2')
  .option('--require-vale', 'Require Vale')
  .option('--skip-vale', 'Skip Vale')
  .action((checkOpts, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    let failed = false;

    const orphans = checkOrphansForGuides(guideEntries(config, getDocsRoot(opts)));
    for (const o of orphans) {
      console.error(`orphan: ${o.message}`);
      failed = true;
    }
    if (failed) process.exit(1);

    const docsRoot = getDocsRoot(opts);
    const workspace = compileWorkspace(config, docsRoot, cliBackupFlags(opts));
    const written = writeCompiledFromWorkspace(config, docsRoot, workspace);
    logWritten(written);

    const refsPath = resolveRefsPath(docsRoot, config.outputDir, config.refs.registryFile);
    genRefsFromCompiled(workspace.compiled, refsPath);
    const refsResult = checkRefsRegistry(workspace.compiled, refsPath);
    console.log(refsResult.message);
    if (!refsResult.ok) process.exit(1);

    if (runBuiltInLinkLint(config, docsRoot, opts, workspace)) failed = true;

    if (config.lint?.xrefs?.enabled !== false) {
      const xrefs = lintXrefs(xrefScanDirs(config, getDocsRoot(opts)));
      for (const x of xrefs) {
        console.error(`xref: ${x}`);
        failed = true;
      }
    }

    const mdlint = findPeerBinary('markdownlint-cli2', getDocsRoot(opts));
    const shardsCfg = config.lint?.markdownlint?.shardsConfig;
    const compiledCfg = config.lint?.markdownlint?.compiledConfig;
    if (shardsCfg) {
      const shardPaths = shardLintPaths(config, getDocsRoot(opts));
      const r = runPeer(mdlint, {
        require: checkOpts.requireLint,
        cwd: getDocsRoot(opts),
        args: ['--config', shardsCfg, ...shardPaths],
      });
      if (r.exitCode !== 0) failed = true;
    }
    if (compiledCfg) {
      const r = runPeer(mdlint, {
        require: checkOpts.requireLint,
        cwd: getDocsRoot(opts),
        args: ['--config', compiledCfg],
      });
      if (r.exitCode !== 0) failed = true;
    }

    const linkTool = findPeerBinary('markdown-link-check', getDocsRoot(opts));
    const linkTarget = resolveLinkTarget(config, getDocsRoot(opts));
    const linkCfg = config.lint?.links?.config;
    if (linkTool.found && linkCfg && linkTarget) {
      const r = runPeer(linkTool, {
        cwd: getDocsRoot(opts),
        args: [linkTarget, '--config', linkCfg],
      });
      if (r.exitCode !== 0) failed = true;
    }

    if (!checkOpts.skipVale) {
      const vale = findPeerBinary('vale', getDocsRoot(opts));
      const scanPaths = valeScanPaths(config, getDocsRoot(opts));
      const valeConfig = config.vale?.config ?? '.vale.ini';
      const minLevel = valeMinAlertLevel(config, true) ?? 'error';
      const r = runPeer(vale, {
        require: checkOpts.requireVale,
        cwd: getDocsRoot(opts),
        args: ['--config', valeConfig, `--minAlertLevel=${minLevel}`, ...scanPaths],
      });
      if (r.exitCode !== 0) failed = true;
    }

    if (failed) process.exit(1);
    console.log('mdcp check passed');
  });

program.parse();
