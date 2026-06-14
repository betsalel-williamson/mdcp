#!/usr/bin/env node
import { execSync } from 'node:child_process';

function stagedFiles() {
  return execSync('git diff --cached --name-only', { encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean);
}

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function matches(files, prefix) {
  return files.some((f) => f.startsWith(prefix));
}

const files = stagedFiles();
if (files.length === 0) process.exit(0);

const rootConfigChanged = files.some(
  (f) =>
    f === 'package.json' ||
    f === 'pnpm-lock.yaml' ||
    f === 'eslint.config.mjs' ||
    (f.startsWith('tsconfig') && f.endsWith('.json')),
);

let coreBuilt = false;

function ensureCoreBuild() {
  if (!coreBuilt) {
    run('pnpm --filter @bwilliamson/mdcp-core run build');
    coreBuilt = true;
  }
}

if (matches(files, 'packages/mdcp-core/')) {
  run('pnpm --filter @bwilliamson/mdcp-core run typecheck');
  run('pnpm --filter @bwilliamson/mdcp-core run build');
  const corePaths = files
    .filter((f) => f.startsWith('packages/mdcp-core/'))
    .map((f) => f.slice('packages/mdcp-core/'.length));
  if (corePaths.length > 0) {
    run(
      `pnpm --filter @bwilliamson/mdcp-core exec vitest related --run ${corePaths.map((p) => `"${p}"`).join(' ')}`,
    );
  }
  coreBuilt = true;
}

if (matches(files, 'packages/mdcp-cli/')) {
  ensureCoreBuild();
  run('pnpm --filter @bwilliamson/mdcp-cli run typecheck');
  run('pnpm --filter @bwilliamson/mdcp-cli run build');
  run('pnpm --filter @bwilliamson/mdcp-cli run test');
}

if (matches(files, 'packages/mdcp-presets/')) {
  run('node scripts/validate-presets.mjs');
}

const docsChanged =
  matches(files, 'docs/') ||
  files.includes('DEVELOPERS.md') ||
  files.some((f) => /^packages\/[^/]+\/README\.md$/.test(f));

if (docsChanged) {
  ensureCoreBuild();
  run('pnpm --filter @bwilliamson/mdcp-cli run build');
  run('pnpm run docs:compile:repo');
  run('pnpm run docs:check:repo');
}

if (rootConfigChanged) {
  run('pnpm run typecheck');
  run('pnpm run format:check');
}
