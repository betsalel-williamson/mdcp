import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(import.meta.dirname, '../../..');

function readRepo(...segments: string[]): string {
  return readFileSync(join(repoRoot, ...segments), 'utf8');
}

function repoPath(...segments: string[]): string {
  return join(repoRoot, ...segments);
}

type EvalAssertion = { name: string; description: string };
type EvalCase = {
  id: number;
  prompt: string;
  expected_output: string;
  files: string[];
  assertions: EvalAssertion[];
};
type EvalsJson = { skill_name: string; evals: EvalCase[] };

const FEATURE_SHARD = 'docs/features/live-skill-evals.md';
const DESIGN_EVALS = 'tests/skills/mdcp-design-architecture/evals/evals.json';
const DESIGN_FIXTURE = 'tests/skills/mdcp-design-architecture/evals/files/design-fixture';

const REQUIRED_FIXTURE_FILES = [
  'README.md',
  'docs/developer/agent-work-item-tracking.md',
  'docs/features/index.md',
  'docs/features/compile-cache-architecture.md',
  'docs/features/adr/index.md',
  'docs/features/adr/0001-example.md',
  'packages/example-cli/src/index.ts',
] as const;

describe('live skill evals documentation and suite contract (#126)', () => {
  it('ships a dedicated live-skill-evals feature shard linked from catalog indexes', () => {
    expect(existsSync(repoPath(FEATURE_SHARD))).toBe(true);
    const featureShard = readRepo(FEATURE_SHARD);
    expect(featureShard).toMatch(/^# Live skill evals/m);
    expect(featureShard).toContain('tests/skills/');
    expect(featureShard).toContain('mdcp-design-architecture');
    expect(featureShard).toContain('skill-creator');
    expect(featureShard).toContain('Never a CI gate');

    expect(readRepo('docs/features/index.md')).toContain('./live-skill-evals.md');
    expect(readRepo('docs/features/feature-catalog.md')).toContain('./live-skill-evals.md');
  });

  it('keeps developer and glossary live-eval docs as pointers to the feature shard', () => {
    const developer = readRepo('docs/developer/agent-skill.md');
    expect(developer).toContain('../features/live-skill-evals.md');
    expect(developer).not.toContain('tests/skills/mdcp-getting-started/evals/');

    const glossary = readRepo('docs/glossary/live-skill-eval.md');
    expect(glossary).toContain('../features/live-skill-evals.md');
    expect(glossary).not.toContain('tests/skills/mdcp/evals/');
  });

  it('points Agent Skill product docs at live-skill-evals for qualitative checks', () => {
    expect(readRepo('docs/features/agent-skill.md')).toContain('./live-skill-evals.md');
  });

  it('defines the mdcp-design-architecture eval suite with named assertions and fixtures', () => {
    expect(existsSync(repoPath(DESIGN_EVALS))).toBe(true);
    const suite = JSON.parse(readRepo(DESIGN_EVALS)) as EvalsJson;
    expect(suite.skill_name).toBe('mdcp-design-architecture');
    expect(suite.evals.length).toBeGreaterThanOrEqual(3);

    for (const evalCase of suite.evals) {
      expect(evalCase.prompt.length).toBeGreaterThan(20);
      expect(evalCase.expected_output.length).toBeGreaterThan(20);
      expect(Array.isArray(evalCase.files)).toBe(true);
      expect(evalCase.files.length).toBeGreaterThan(0);
      expect(Array.isArray(evalCase.assertions)).toBe(true);
      expect(evalCase.assertions.length).toBeGreaterThan(0);
      for (const assertion of evalCase.assertions) {
        expect(assertion.name).toMatch(/^[a-z][a-z0-9_]*$/);
        expect(assertion.description.length).toBeGreaterThan(10);
      }
    }

    for (const rel of REQUIRED_FIXTURE_FILES) {
      expect(existsSync(repoPath(DESIGN_FIXTURE, rel))).toBe(true);
    }
  });
});
