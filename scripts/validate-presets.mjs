#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const presetsDir = join(__dirname, '../packages/mdcp-presets');

const files = [
  'markdownlint-shards.markdownlint-cli2.jsonc',
  'markdownlint-compiled.markdownlint-cli2.jsonc',
];

function stripJsoncComments(text) {
  return text
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,\s*([}\]])/g, '$1');
}

for (const file of files) {
  const path = join(presetsDir, file);
  try {
    JSON.parse(stripJsoncComments(readFileSync(path, 'utf-8')));
    console.log(`OK ${file}`);
  } catch (err) {
    console.error(`Invalid JSONC in ${file}: ${err.message}`);
    process.exit(1);
  }
}
