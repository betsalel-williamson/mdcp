import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, vi } from 'vitest';
import {
  fetchTaskPromptsFromUpstream,
  copyTaskPromptsFromLocalSpec,
} from '../src/export/task-prompts-fetch.js';
import {
  DEFAULT_TASK_PROMPTS_CACHE_DIR,
  STANDARD_TASK_PROMPT_FILES,
  TASK_PROMPTS_SPEC_DIR,
} from '../src/export/task-prompts-artifacts.js';

const REPO_ROOT = join(import.meta.dirname, '../../..');

describe('task-prompts fetch', () => {
  it('copies all standard prompts from local spec', () => {
    const docsRoot = mkdtempSync(join(tmpdir(), 'mdcp-prompts-'));
    try {
      const result = copyTaskPromptsFromLocalSpec(REPO_ROOT, docsRoot);
      expect(result.files).toHaveLength(STANDARD_TASK_PROMPT_FILES.length);
      for (const filename of STANDARD_TASK_PROMPT_FILES) {
        const cached = join(docsRoot, DEFAULT_TASK_PROMPTS_CACHE_DIR, filename);
        expect(existsSync(cached)).toBe(true);
        const upstream = join(REPO_ROOT, TASK_PROMPTS_SPEC_DIR, filename);
        expect(readFileSync(cached, 'utf-8')).toBe(readFileSync(upstream, 'utf-8'));
      }
      const manifest = JSON.parse(
        readFileSync(join(result.cacheDir, 'manifest.json'), 'utf-8'),
      ) as { protocolVersion: string; prompts: string[] };
      expect(manifest.protocolVersion).toBe('0.4.0.0');
      expect(manifest.prompts).toEqual([...STANDARD_TASK_PROMPT_FILES]);
    } finally {
      rmSync(docsRoot, { recursive: true, force: true });
    }
  });

  it('fetches prompts from GitHub raw using resolved ref', async () => {
    const docsRoot = mkdtempSync(join(tmpdir(), 'mdcp-prompts-remote-'));
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      expect(url).toContain('/owner/mdcp/v0.4.0/spec/task-prompts/');
      return new Response(`# ${url}\n`, { status: 200 });
    });

    try {
      const result = await fetchTaskPromptsFromUpstream({
        docsRoot,
        repo: 'owner/mdcp',
        resolvedRef: 'v0.4.0',
        fetch: fetchMock,
      });
      expect(result.files).toHaveLength(STANDARD_TASK_PROMPT_FILES.length);
      expect(fetchMock).toHaveBeenCalledTimes(STANDARD_TASK_PROMPT_FILES.length);
    } finally {
      rmSync(docsRoot, { recursive: true, force: true });
    }
  });
});
