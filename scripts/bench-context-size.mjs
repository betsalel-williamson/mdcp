#!/usr/bin/env node
/**
 * Measure compiled vs shard context sizes for benefit-claims evidence.
 * Run after: pnpm build && pnpm docs:compile:repo
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DOCS_ROOT = join(REPO_ROOT, 'docs');
const FEATURES_DIR = join(DOCS_ROOT, 'features');
const MONOLITH = join(DOCS_ROOT, '_build/guides.md');
const OUT_CSV = join(DOCS_ROOT, 'features/protocol/context-size-dogfood.csv');

function listFeatureShards(dir, base = '') {
  const paths = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (statSync(p).isDirectory()) {
      if (name === 'protocol') paths.push(...listFeatureShards(p, rel));
      continue;
    }
    if (name.endsWith('.md') && name !== 'index.md') paths.push(join('features', rel));
  }
  return paths;
}

function percentile(sorted, p) {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function charCount(path) {
  return readFileSync(path, 'utf-8').length;
}

function main() {
  const monolithChars = charCount(MONOLITH);
  const shardPaths = listFeatureShards(FEATURES_DIR).map((rel) => join(DOCS_ROOT, rel));
  const shardChars = shardPaths.map((p) => charCount(p)).sort((a, b) => a - b);
  const medianShard = shardChars[Math.floor(shardChars.length / 2)] ?? 0;
  const p90Shard = percentile(shardChars, 90);

  const featuresCompiled = join(DOCS_ROOT, '_build/features.md');
  let rawGuideChars = 0;
  try {
    rawGuideChars = charCount(featuresCompiled);
  } catch {
    /* features.md may not exist when only monolith is built */
  }

  const medianPctOfMonolith =
    monolithChars > 0 ? Math.round((medianShard / monolithChars) * 1000) / 10 : 0;
  const recordedAt = new Date().toISOString().slice(0, 10);

  const rows = [
    ['metric', 'value', 'unit', 'notes', 'recorded_at'],
    [
      'features_monolith_chars',
      String(monolithChars),
      'chars',
      'docs/_build/guides.md',
      recordedAt,
    ],
    ['feature_shard_count', String(shardChars.length), 'count', 'excludes index.md', recordedAt],
    [
      'feature_shard_median_chars',
      String(medianShard),
      'chars',
      'docs/features/**/*.md',
      recordedAt,
    ],
    ['feature_shard_p90_chars', String(p90Shard), 'chars', 'docs/features/**/*.md', recordedAt],
    [
      'median_shard_pct_of_monolith',
      String(medianPctOfMonolith),
      'percent',
      'median shard / monolith character ratio',
      recordedAt,
    ],
    [
      'features_guide_raw_chars',
      String(rawGuideChars),
      'chars',
      'per-guide output if present',
      recordedAt,
    ],
  ];

  const csv = rows.map((r) => r.join(',')).join('\n') + '\n';
  writeFileSync(OUT_CSV, csv);
  console.log(`Wrote ${OUT_CSV}`);
  console.log(
    `Monolith: ${monolithChars} chars; median shard: ${medianShard} (${medianPctOfMonolith}% of monolith)`,
  );
}

main();
