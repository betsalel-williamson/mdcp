#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildLlmsIndex,
  defaultLlmsIndexFilename,
  LLMS_INDEX_SPEC_DIR,
} from '../packages/mdcp-core/dist/index.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const specDir = join(repoRoot, LLMS_INDEX_SPEC_DIR);
mkdirSync(specDir, { recursive: true });

const canonical = buildLlmsIndex();
const stableName = defaultLlmsIndexFilename();
const draftName = defaultLlmsIndexFilename(undefined, { draft: true });

writeFileSync(join(specDir, stableName), canonical);
writeFileSync(join(specDir, draftName), canonical);

console.log(`→ ${join(LLMS_INDEX_SPEC_DIR, stableName)}`);
console.log(`→ ${join(LLMS_INDEX_SPEC_DIR, draftName)}`);
