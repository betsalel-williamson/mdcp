#!/usr/bin/env node
/**
 * Fail if any skills/<name>/SKILL.md opens with a broken YAML fence
 * ("---name:" instead of "---" then newline then "name:").
 * That corruption breaks `npx skills add`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const skillsDir = join(process.cwd(), 'skills');
const bad = [];

for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillPath = join(skillsDir, entry.name, 'SKILL.md');
  let content;
  try {
    content = readFileSync(skillPath, 'utf-8');
  } catch {
    continue;
  }
  if (!content.startsWith('---\n')) {
    bad.push(skillPath);
  }
}

if (bad.length > 0) {
  console.error(
    'Broken SKILL.md YAML frontmatter (missing newline after ---):\n' +
      bad.map((p) => `  ${p}`).join('\n') +
      '\n\nExpected opening:\n---\nname: ...\n\nNot:\n---name: ...',
  );
  process.exit(1);
}

console.log('Skill frontmatter fences OK.');
