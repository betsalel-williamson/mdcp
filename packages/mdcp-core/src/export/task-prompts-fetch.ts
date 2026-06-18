import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  buildGithubRawUrl,
  DEFAULT_LLMS_INDEX_UPSTREAM_REPO,
  DEFAULT_LLMS_INDEX_UPSTREAM_REF,
  resolveUpstreamRef,
  type LlmsIndexFetchOptions,
} from './llms-index-fetch.js';
import {
  DEFAULT_TASK_PROMPTS_CACHE_DIR,
  STANDARD_TASK_PROMPT_FILES,
  defaultTaskPromptManifest,
  resolveTaskPromptsCacheDir,
  resolveTaskPromptSpecPath,
  type StandardTaskPromptFile,
  type TaskPromptManifest,
} from './task-prompts-artifacts.js';

export interface TaskPromptsFetchOptions extends LlmsIndexFetchOptions {
  docsRoot: string;
  /** Relative to docsRoot (default `.caches/mdcp/prompts`). */
  cacheDir?: string;
  /** Skip ref resolution when caller already resolved (e.g. after llms-index fetch). */
  resolvedRef?: string;
}

export interface TaskPromptsFetchResult {
  cacheDir: string;
  manifest: TaskPromptManifest;
  files: string[];
}

async function fetchRemotePrompt(
  repo: string,
  ref: string,
  filename: StandardTaskPromptFile,
  fetchFn: typeof fetch,
): Promise<string> {
  const path = resolveTaskPromptSpecPath(filename);
  const url = buildGithubRawUrl(repo, ref, path);
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch task prompt ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

function readLocalPrompt(repoRoot: string, filename: StandardTaskPromptFile): string {
  const filePath = join(repoRoot, resolveTaskPromptSpecPath(filename));
  if (!existsSync(filePath)) {
    throw new Error(`Local task prompt not found: ${filePath}`);
  }
  return readFileSync(filePath, 'utf-8');
}

function writeCachedPrompt(
  cacheDir: string,
  filename: StandardTaskPromptFile,
  text: string,
): string {
  const outPath = join(cacheDir, filename);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, text, 'utf-8');
  return outPath;
}

/** Fetch or copy versioned meta task prompts into the docs-root cache. */
export async function fetchTaskPromptsFromUpstream(
  options: TaskPromptsFetchOptions,
): Promise<TaskPromptsFetchResult> {
  const cacheDir = resolveTaskPromptsCacheDir(options.docsRoot, options.cacheDir);
  mkdirSync(cacheDir, { recursive: true });

  const fetchFn = options.fetch ?? fetch;
  const repo = options.repo ?? DEFAULT_LLMS_INDEX_UPSTREAM_REPO;
  const refInput = options.ref ?? DEFAULT_LLMS_INDEX_UPSTREAM_REF;
  const ref =
    options.localRepoRoot !== undefined
      ? 'local'
      : (options.resolvedRef ?? (await resolveUpstreamRef(repo, refInput, fetchFn)));
  const manifest = defaultTaskPromptManifest(ref);
  const pending: { filename: StandardTaskPromptFile; text: string }[] = [];

  for (const filename of STANDARD_TASK_PROMPT_FILES) {
    const text =
      options.localRepoRoot !== undefined
        ? readLocalPrompt(options.localRepoRoot, filename)
        : await fetchRemotePrompt(repo, ref, filename, fetchFn);
    pending.push({ filename, text });
  }

  const written: string[] = [];
  for (const { filename, text } of pending) {
    written.push(writeCachedPrompt(cacheDir, filename, text));
  }

  writeFileSync(join(cacheDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

  return { cacheDir, manifest, files: written };
}

/** Copy prompts from local spec checkout (used by mdcp repo maintainers). */
export function copyTaskPromptsFromLocalSpec(
  repoRoot: string,
  docsRoot: string,
  cacheDir = DEFAULT_TASK_PROMPTS_CACHE_DIR,
): TaskPromptsFetchResult {
  const target = resolveTaskPromptsCacheDir(docsRoot, cacheDir);
  mkdirSync(target, { recursive: true });
  const written: string[] = [];
  for (const filename of STANDARD_TASK_PROMPT_FILES) {
    const src = join(repoRoot, resolveTaskPromptSpecPath(filename));
    const dest = join(target, filename);
    copyFileSync(src, dest);
    written.push(dest);
  }
  const manifest = defaultTaskPromptManifest('local');
  writeFileSync(join(target, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  return { cacheDir: target, manifest, files: written };
}
