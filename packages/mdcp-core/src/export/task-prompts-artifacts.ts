import { resolve } from 'node:path';
import { LLMS_INDEX_PROTOCOL_VERSION } from './llms-index-artifacts.js';

/** Versioned default mdcp prompts extension 0.4.0.0 (`spec/extensions/prompts-mdcp-defaults/0.4.0.0`). */
export const TASK_PROMPTS_SPEC_DIR = 'spec/extensions/prompts-mdcp-defaults/0.4.0.0';

/** Default cache under docs root (populated by `mdcp export --llms-index --fetch`). */
export const DEFAULT_TASK_PROMPTS_CACHE_DIR = '.caches/mdcp/prompts';

/** Standard meta prompts — general authoring instructions, replaceable by host-specific systems. */
export const STANDARD_TASK_PROMPT_FILES = [
  'getting-started-with-mdcp.prompt.md',
  'feature-level-task.prompt.md',
  'doc-only-task.prompt.md',
  'design-architecture-task.prompt.md',
  'ux-task.prompt.md',
  'review-task.prompt.md',
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
