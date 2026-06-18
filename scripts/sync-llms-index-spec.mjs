#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildLlmsIndex,
  defaultLlmsIndexFilename,
  LLMS_INDEX_SPEC_DIR,
  LLMS_INDEX_PROFILE_ALPHA,
  LLMS_INDEX_PROFILE_DEV,
} from '../packages/mdcp-core/dist/index.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const specDir = join(repoRoot, LLMS_INDEX_SPEC_DIR);
mkdirSync(specDir, { recursive: true });

const canonical = buildLlmsIndex();
const stableName = defaultLlmsIndexFilename();
const draftName = defaultLlmsIndexFilename(undefined, { draft: true });

// Named files (versioned artifacts)
writeFileSync(join(specDir, stableName), canonical);
writeFileSync(join(specDir, draftName), canonical);

// Profile pointers — written as real files (not symlinks) so that
// raw.githubusercontent.com serves the content directly when other repos
// fetch via the profile path (e.g. spec/llms-index/valpha).
writeFileSync(join(specDir, LLMS_INDEX_PROFILE_ALPHA), canonical);
writeFileSync(join(specDir, LLMS_INDEX_PROFILE_DEV), canonical);

console.log(`→ ${join(LLMS_INDEX_SPEC_DIR, stableName)}`);
console.log(`→ ${join(LLMS_INDEX_SPEC_DIR, draftName)}`);
console.log(`→ ${join(LLMS_INDEX_SPEC_DIR, LLMS_INDEX_PROFILE_ALPHA)}`);
console.log(`→ ${join(LLMS_INDEX_SPEC_DIR, LLMS_INDEX_PROFILE_DEV)}`);
