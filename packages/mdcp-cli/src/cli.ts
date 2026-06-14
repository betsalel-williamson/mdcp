#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadConfig,
  resolveOutputPath,
  resolveGuidesRoot,
  resolveGuideDir,
  getGuideConfig,
  xrefScanDirs,
  compileGuides,
  writeCompiledGuides,
  writeAllSectionsManifests,
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
  type MdcpConfig,
} from '@bwilliamson/mdcp-core';

interface GlobalOpts {
  config: string;
  cwd: string;
}

function getConfig(opts: GlobalOpts) {
  return loadConfig(opts.config, opts.cwd);
}

function guideEntries(config: MdcpConfig, cwd: string) {
  return config.compileOrder.map((name) => {
    const cfg = getGuideConfig(config, name);
    return {
      name,
      dir: resolveGuideDir(name, config, cwd),
      manifest: cfg?.compile?.manifest,
      sectionsHeading: cfg?.compile?.sectionsHeading,
      scopeRoot: cfg?.compile?.scopeRoot ? resolve(cwd, cfg.compile.scopeRoot) : undefined,
    };
  });
}

function valeMinAlertLevel(config: MdcpConfig, strictFlag?: boolean): string | undefined {
  if (strictFlag) return 'error';
  return config.vale?.strictMinAlertLevel;
}

function compileOptions(config: MdcpConfig, cwd: string) {
  return {
    guidesRoot: resolveGuidesRoot(config, cwd),
    compileOrder: config.compileOrder,
    banner: config.banner,
    guides: config.guides,
    cwd,
    config,
  };
}

function compileToString(config: MdcpConfig, cwd: string): string {
  return compileGuides(compileOptions(config, cwd));
}

function writeCompiled(config: MdcpConfig, cwd: string): string {
  const opts = compileOptions(config, cwd);
  const results = writeCompiledGuides(opts, resolveOutputPath(config, cwd));
  for (const r of results) {
    console.log(`→ ${r.path} (${r.lines} lines)`);
  }
  return compileToString(config, cwd);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8')) as {
  version: string;
};

const program = new Command();

program
  .name('mdcp')
  .description('Markdown Command Line Interface Processor')
  .version(pkg.version)
  .option('-c, --config <path>', 'config file', 'mdcp.config.json')
  .option('--cwd <path>', 'working directory', process.cwd());

program
  .command('compile')
  .description('Compile shards to monolith')
  .action((_, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    writeCompiled(config, opts.cwd);
  });

program
  .command('sections')
  .description('Regenerate sections.txt from index.md')
  .action((_, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const results = writeAllSectionsManifests(guideEntries(config, opts.cwd));
    for (const r of results) {
      console.log(`${r.name}: ${r.count} sections`);
    }
  });

const refs = program.command('refs').description('Heading slug registry (JSON default)');

refs
  .command('gen')
  .description('Generate refs.json from compiled output')
  .action((_, cmd) => {
    const opts = cmd.parent.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const compiled = writeCompiled(config, opts.cwd);
    const refsPath = resolveRefsPath(opts.cwd, config.outputDir, config.refs.registryFile);
    genRefsFromCompiled(compiled, refsPath);
    console.log(`Wrote ${refsPath}`);
  });

refs
  .command('check')
  .description('Verify refs.json matches compiled output')
  .action((_, cmd) => {
    const opts = cmd.parent.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    const compiled = compileToString(config, opts.cwd);
    const refsPath = resolveRefsPath(opts.cwd, config.outputDir, config.refs.registryFile);
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
    const refsPath = resolveRefsPath(opts.cwd, config.outputDir, config.refs.registryFile);
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
    const compiled = compileToString(config, opts.cwd);
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
  .option('--stdout', 'Write to stdout instead of file')
  .action((exportOpts, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    let text = compileToString(config, opts.cwd);
    if (exportOpts.llm) {
      text = stripForLlm(text, getLlmExportOptions(config));
    }
    if (exportOpts.stdout) {
      process.stdout.write(text);
    } else {
      const outPath = resolveOutputPath(config, opts.cwd).replace(/\.md$/, '.llm.md');
      writeFileSync(outPath, text, 'utf-8');
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
    const tool = findPeerBinary('markdownlint-cli2', opts.cwd);
    const shardsCfg = config.lint?.markdownlint?.shardsConfig;
    const compiledCfg = config.lint?.markdownlint?.compiledConfig;

    if (shardsCfg) {
      const r = runPeer(tool, {
        require: lintOpts.requireLint,
        cwd: opts.cwd,
        args: ['--config', shardsCfg],
      });
      if (r.exitCode !== 0) process.exit(r.exitCode);
    }

    writeCompiled(config, opts.cwd);

    if (compiledCfg) {
      const r = runPeer(tool, {
        require: lintOpts.requireLint,
        cwd: opts.cwd,
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
    const tool = findPeerBinary('vale', opts.cwd);
    const scanPaths = config.vale?.scanGlobs ?? guideEntries(config, opts.cwd).map((g) => g.dir);
    const valeConfig = config.vale?.config ?? '.vale.ini';
    const minLevel = valeMinAlertLevel(config, proseOpts.strict);
    const args = minLevel
      ? ['--config', valeConfig, `--minAlertLevel=${minLevel}`, ...scanPaths]
      : ['--config', valeConfig, ...scanPaths];
    const r = runPeer(tool, { require: proseOpts.requireVale, cwd: opts.cwd, args });
    if (r.exitCode !== 0) process.exit(r.exitCode);
  });

program
  .command('links')
  .description('Run markdown-link-check (peer)')
  .action((_, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const config = getConfig(opts);
    writeCompiled(config, opts.cwd);
    const tool = findPeerBinary('markdown-link-check', opts.cwd);
    const target = config.lint?.links?.target ?? config.outputFile;
    const linkCfg = config.lint?.links?.config;
    const args = linkCfg ? [target, '--config', linkCfg] : [target];
    const r = runPeer(tool, { cwd: opts.cwd, args });
    if (r.exitCode !== 0) process.exit(r.exitCode);
  });

program
  .command('fix')
  .description('Auto-fix with Prettier + markdownlint (peer)')
  .action((_, cmd) => {
    const opts = cmd.parent.opts() as GlobalOpts;
    const prettier = findPeerBinary('prettier', opts.cwd);
    runPeer(prettier, { cwd: opts.cwd, args: ['--write', '.'] });
    const mdlint = findPeerBinary('markdownlint-cli2', opts.cwd);
    runPeer(mdlint, { cwd: opts.cwd, args: ['--fix'] });
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
    const guidesRoot = resolveGuidesRoot(config, opts.cwd);
    const sourceFile = resolve(opts.cwd, config.source);

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

    writeAllSectionsManifests(guideEntries(config, opts.cwd));
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

    const orphans = checkOrphansForGuides(guideEntries(config, opts.cwd));
    for (const o of orphans) {
      console.error(`orphan: ${o.message}`);
      failed = true;
    }
    if (failed) process.exit(1);

    const compiled = writeCompiled(config, opts.cwd);

    const refsPath = resolveRefsPath(opts.cwd, config.outputDir, config.refs.registryFile);
    genRefsFromCompiled(compiled, refsPath);
    const refsResult = checkRefsRegistry(compiled, refsPath);
    console.log(refsResult.message);
    if (!refsResult.ok) process.exit(1);

    if (config.lint?.xrefs?.enabled !== false) {
      const xrefs = lintXrefs(xrefScanDirs(config, opts.cwd));
      for (const x of xrefs) {
        console.error(`xref: ${x}`);
        failed = true;
      }
    }

    const mdlint = findPeerBinary('markdownlint-cli2', opts.cwd);
    const shardsCfg = config.lint?.markdownlint?.shardsConfig;
    const compiledCfg = config.lint?.markdownlint?.compiledConfig;
    if (shardsCfg) {
      const r = runPeer(mdlint, {
        require: checkOpts.requireLint,
        cwd: opts.cwd,
        args: ['--config', shardsCfg],
      });
      if (r.exitCode !== 0) failed = true;
    }
    if (compiledCfg) {
      const r = runPeer(mdlint, {
        require: checkOpts.requireLint,
        cwd: opts.cwd,
        args: ['--config', compiledCfg],
      });
      if (r.exitCode !== 0) failed = true;
    }

    const linkTool = findPeerBinary('markdown-link-check', opts.cwd);
    const linkTarget = config.lint?.links?.target ?? config.outputFile;
    const linkCfg = config.lint?.links?.config;
    if (linkTool.found && linkCfg) {
      const r = runPeer(linkTool, {
        cwd: opts.cwd,
        args: [linkTarget, '--config', linkCfg],
      });
      if (r.exitCode !== 0) failed = true;
    }

    if (!checkOpts.skipVale) {
      const vale = findPeerBinary('vale', opts.cwd);
      const scanPaths = config.vale?.scanGlobs ?? guideEntries(config, opts.cwd).map((g) => g.dir);
      const valeConfig = config.vale?.config ?? '.vale.ini';
      const minLevel = valeMinAlertLevel(config, true) ?? 'error';
      const r = runPeer(vale, {
        require: checkOpts.requireVale,
        cwd: opts.cwd,
        args: ['--config', valeConfig, `--minAlertLevel=${minLevel}`, ...scanPaths],
      });
      if (r.exitCode !== 0) failed = true;
    }

    if (failed) process.exit(1);
    console.log('mdcp check passed');
  });

program.parse();
