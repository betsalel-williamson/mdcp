import { resolve } from 'node:path';
import { LLMS_INDEX_PROTOCOL_VERSION } from './llms-index-artifacts.js';

/** Versioned default mdcp prompts extension 0.4.0.0 (migrated to `.agents/skills/mdcp/agents`). */
export const TASK_PROMPTS_SPEC_DIR = '.agents/skills/mdcp/agents';

/** Default cache under docs root (populated by `mdcp export --llms-index --fetch`). */
export const DEFAULT_TASK_PROMPTS_CACHE_DIR = '.agents/skills/mdcp/agents';

/** Standard meta prompts — general authoring instructions, replaceable by host-specific systems. */
export const STANDARD_TASK_PROMPT_FILES = [
  'getting-started.md',
  'feature-level.md',
  'doc-only.md',
  'design-architecture.md',
  'ux.md',
  'review.md',
] as const;

export type StandardTaskPromptFile = (typeof STANDARD_TASK_PROMPT_FILES)[number];

export interface TaskPromptManifest {
  protocolVersion: string;
  ref: string;
  prompts: StandardTaskPromptFile[];
}

export function resolveTaskPromptsCacheDir(
  docsRoot: string,
  cacheDir = DEFAULT_TASK_PROMPTS_CACHE_DIR,
): string {
  if (cacheDir === '.agents/skills/mdcp/agents') {
    // If it's the new skill path, resolve it relative to the workspace root,
    // assuming docsRoot is typically one level deep (e.g. 'docs/')
    return resolve(docsRoot, '..', cacheDir);
  }
  return resolve(docsRoot, cacheDir);
}

export function resolveTaskPromptSpecPath(filename: StandardTaskPromptFile): string {
  return `${TASK_PROMPTS_SPEC_DIR}/${filename}`;
}

export function defaultTaskPromptManifest(ref: string): TaskPromptManifest {
  return {
    protocolVersion: LLMS_INDEX_PROTOCOL_VERSION,
    ref,
    prompts: [...STANDARD_TASK_PROMPT_FILES],
  };
}
