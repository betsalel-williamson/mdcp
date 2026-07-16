#!/usr/bin/env node
/**
 * SKILL.md content lint for the MDCP parent Agent Skill.
 * Static analysis only: frontmatter, required/forbidden phrases, line budget.
 * Not a skill-creator live eval — no model/API; does not run agents or measure triggers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillPath = path.join(root, 'skills/mdcp/SKILL.md');
const fixturesDir = path.join(root, 'scripts/mdcp-skill-content-lint');
const descriptionKeywordsPath = path.join(fixturesDir, 'description-keywords.json');
const requiredPhrasesPath = path.join(fixturesDir, 'required-phrases.json');

const results = [];

function pass(id, detail = '') {
  results.push({ id, ok: true, detail });
}

function fail(id, detail) {
  results.push({ id, ok: false, detail });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) {
    throw new Error('SKILL.md must start with YAML frontmatter');
  }
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new Error('SKILL.md frontmatter closing --- not found');
  }
  const yaml = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const data = {};
  let currentKey = null;
  let folded = null;
  let nestKey = null;
  for (const line of yaml.split('\n')) {
    if (folded !== null) {
      if (/^\s+\S/.test(line)) {
        folded += (folded ? ' ' : '') + line.trim();
        continue;
      }
      data[currentKey] = folded;
      folded = null;
      currentKey = null;
    }
    const nested = line.match(/^ {2}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (nestKey && nested) {
      if (typeof data[nestKey] !== 'object' || data[nestKey] === null) {
        data[nestKey] = {};
      }
      data[nestKey][nested[1]] = nested[2].replace(/^['"]|['"]$/g, '');
      continue;
    }
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    nestKey = null;
    const [, key, value] = m;
    if (value === '>' || value === '>-' || value === '|' || value === '|-') {
      currentKey = key;
      folded = '';
      continue;
    }
    if (value === '') {
      nestKey = key;
      data[key] = {};
      continue;
    }
    data[key] = value.replace(/^['"]|['"]$/g, '');
  }
  if (folded !== null && currentKey) {
    data[currentKey] = folded;
  }
  return { data, body };
}

function includesAny(haystack, needles) {
  const lower = haystack.toLowerCase();
  return needles.some((n) => lower.includes(String(n).toLowerCase()));
}

function includesAll(haystack, needles) {
  const lower = haystack.toLowerCase();
  return needles.every((n) => lower.includes(String(n).toLowerCase()));
}

function main() {
  if (!fs.existsSync(skillPath)) {
    fail('skill-exists', `missing ${skillPath}`);
  } else {
    pass('skill-exists');
  }

  const raw = fs.existsSync(skillPath) ? fs.readFileSync(skillPath, 'utf8') : '';
  let data = {};
  let body = '';
  try {
    ({ data, body } = parseFrontmatter(raw));
    pass('frontmatter-parse');
  } catch (error) {
    fail('frontmatter-parse', error instanceof Error ? error.message : String(error));
  }

  if (data.name === 'mdcp') pass('name-mdcp');
  else fail('name-mdcp', `expected name mdcp, got ${JSON.stringify(data.name)}`);

  const description = String(data.description || '');
  if (description.length > 0 && description.length <= 1024) pass('description-length');
  else fail('description-length', `description length ${description.length}`);

  // agentskills.io optional fields — required for MDCP publishable skills
  if (
    String(data.license || '')
      .toLowerCase()
      .includes('mit')
  )
    pass('frontmatter-license');
  else fail('frontmatter-license', `expected license MIT, got ${JSON.stringify(data.license)}`);

  const compatibility = String(data.compatibility || '');
  const compatOk = /node\.?js?\s*18/i.test(compatibility) && /mdcp-cli|cli/i.test(compatibility);
  if (compatOk) pass('frontmatter-compatibility');
  else {
    fail(
      'frontmatter-compatibility',
      'compatibility must mention Node.js 18+ and the CLI (mdcp-cli)',
    );
  }

  const metadata = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};
  const version = String(metadata.version || '');
  if (/^\d+\.\d+\.\d+/.test(version)) pass('frontmatter-metadata-version');
  else {
    fail(
      'frontmatter-metadata-version',
      `expected metadata.version semver, got ${JSON.stringify(metadata.version)}`,
    );
  }

  const keywords = readJson(descriptionKeywordsPath);
  const phrases = readJson(requiredPhrasesPath);

  for (const token of keywords.descriptionMustInclude) {
    if (description.toLowerCase().includes(token.toLowerCase())) {
      pass(`description-has:${token}`);
    } else {
      fail(`description-has:${token}`, `description missing ${token}`);
    }
  }

  for (const item of keywords.keywordCoverage) {
    if (includesAny(description + '\n' + item.query, item.mustMatchAny)) {
      // Sample queries should share keywords with the description for discoverability.
      if (includesAny(description, item.mustMatchAny)) {
        pass(`keyword-coverage:${item.id}`);
      } else {
        fail(
          `keyword-coverage:${item.id}`,
          `description does not share keywords with query (${item.mustMatchAny.join(', ')})`,
        );
      }
    } else {
      fail(`keyword-coverage:${item.id}`, 'invalid fixture needles');
    }
  }

  for (const item of keywords.nonMdcpFramedQueries) {
    // Fixture sanity: unrelated sample queries must not be phrased as MDCP docs tasks.
    if (!includesAll(item.query, item.mustNotRequireAll)) {
      pass(`fixture-sanity:${item.id}`);
    } else {
      fail(
        `fixture-sanity:${item.id}`,
        'non-MDCP sample query unexpectedly contains all MDCP needles',
      );
    }
  }

  for (const needle of phrases.skillBodyMustInclude) {
    if (body.toLowerCase().includes(needle.toLowerCase())) pass(`body-has:${needle}`);
    else fail(`body-has:${needle}`, `SKILL.md body missing ${needle}`);
  }

  for (const needle of phrases.skillBodyMustNotInclude) {
    if (!body.includes(needle)) pass(`body-avoids:${needle}`);
    else fail(`body-avoids:${needle}`, `SKILL.md must not require ${needle}`);
  }

  for (const rule of phrases.hardRulesMustMention) {
    if (includesAny(body, rule.patterns)) pass(`hard-rule:${rule.id}`);
    else fail(`hard-rule:${rule.id}`, `missing patterns ${rule.patterns.join(', ')}`);
  }

  for (const item of phrases.phraseScenarios) {
    if (includesAll(body, item.mustMention)) pass(`phrase-scenario:${item.id}`);
    else {
      fail(
        `phrase-scenario:${item.id}`,
        `body missing one of ${item.mustMention.join(', ')} for: ${item.prompt}`,
      );
    }
  }

  const lineCount = raw.split('\n').length;
  if (lineCount <= 500) pass('line-budget');
  else fail('line-budget', `SKILL.md has ${lineCount} lines (max 500)`);

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(
    `mdcp skill:lint — ${passed} passed, ${failed.length} failed (${results.length} total)`,
  );
  for (const r of results) {
    const mark = r.ok ? 'PASS' : 'FAIL';
    console.log(`${mark}  ${r.id}${r.detail ? ` — ${r.detail}` : ''}`);
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main();
