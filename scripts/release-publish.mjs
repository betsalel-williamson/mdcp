#!/usr/bin/env node
/**
 * Build, validate skills, and publish public packages via changesets.
 * Used by changesets/action `publish` after the Version Packages PR merges.
 */
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

run('pnpm build');
run('pnpm skill:validate');
run('pnpm exec changeset publish');
