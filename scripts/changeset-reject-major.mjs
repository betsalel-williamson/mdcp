#!/usr/bin/env node
/**
 * Fail if any pending changeset requests a major bump.
 * Pre-1.0 policy: use minor for breaking changes until maintainers open majors.
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findMajorBumps } from './lib/changeset-bumps.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const majors = findMajorBumps(join(root, '.changeset'));

if (majors.length > 0) {
  console.error(
    'Major bumps are disabled until maintainers explicitly open 1.0 / major releases.\n' +
      'Use minor (breaking-within-0.x) or patch instead.\n\n' +
      majors.map((m) => `  ${m.file}: ${m.package}`).join('\n'),
  );
  process.exit(1);
}

console.log('changeset-reject-major: ok (no major bumps)');
