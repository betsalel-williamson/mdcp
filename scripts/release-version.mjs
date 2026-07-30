#!/usr/bin/env node
/**
 * Apply pending changesets (independent package + skill versions), sync skill
 * frontmatter, then validate skill packs. Used by changesets/action `version`.
 */
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findMajorBumps } from './lib/changeset-bumps.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

const majors = findMajorBumps(join(root, '.changeset'));
if (majors.length > 0) {
  console.error(
    'Refusing to version: major bumps are disabled.\n' +
      majors.map((m) => `  ${m.file}: ${m.package}`).join('\n'),
  );
  process.exit(1);
}

run('pnpm exec changeset version');
run('node scripts/sync-skill-versions.mjs');
run('pnpm skill:validate');
