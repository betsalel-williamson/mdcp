import {
  cacheEnabledExtensions,
  copyEnabledExtensionsFromLocalSpec,
  copyExtensionPackFromLocalSpec,
  type ExtensionCacheOptions,
  type ExtensionCacheResult,
  type ExtensionPackCacheResult,
  type CachedExtensionPackManifest,
} from '../extensions/cache.js';
import {
  resolveEnabledExtensionPacks,
  resolveExtensionPackById,
  type ResolvedExtensionPack,
} from '../extensions/resolve.js';
import {
  DEFAULT_TASK_PROMPTS_CACHE_DIR,
  STANDARD_TASK_PROMPT_FILES,
  defaultTaskPromptManifest,
  type TaskPromptManifest,
} from './task-prompts-artifacts.js';
import { DEFAULT_PROMPTS_EXTENSION_ID } from '../extensions/builtins.js';
import type { LlmsIndexFetchOptions } from './llms-index-fetch.js';
import type { MdcpConfig } from '../config/schema.js';

export interface TaskPromptsFetchOptions extends LlmsIndexFetchOptions {
  docsRoot: string;
  config?: MdcpConfig;
  cacheDir?: string;
  resolvedRef?: string;
}

export interface TaskPromptsFetchResult {
  cacheDir: string;
  manifest: TaskPromptManifest;
  files: string[];
}

function toTaskPromptResult(pack: ExtensionPackCacheResult): TaskPromptsFetchResult {
  return {
    cacheDir: pack.cacheDir,
    manifest: defaultTaskPromptManifest('cached'),
    files: pack.files,
  };
}

function configFromFetchOptions(options: TaskPromptsFetchOptions): MdcpConfig {
  if (options.config) return options.config;
  const config = taskPromptsOnlyConfig(options.cacheDir);
  if (options.repo || options.ref) {
    const pack = config.extensions!.packs![0]!;
    pack.source = {
      repo: options.repo ?? pack.source!.repo,
      ref: options.ref ?? pack.source!.ref,
    };
  }
  return config;
}

/** Fetch or copy versioned meta task prompts into the docs-root cache. */
export async function fetchTaskPromptsFromUpstream(
  options: TaskPromptsFetchOptions,
): Promise<TaskPromptsFetchResult> {
  const cacheOptions: ExtensionCacheOptions = {
    docsRoot: options.docsRoot,
    config: configFromFetchOptions(options),
    localRepoRoot: options.localRepoRoot,
    resolvedRef: options.resolvedRef,
    fetch: options.fetch,
  };
  const { packs } = await cacheEnabledExtensions(cacheOptions);
  const taskPrompts = packs.find((pack) => pack.id === DEFAULT_PROMPTS_EXTENSION_ID);
  if (!taskPrompts) {
    throw new Error(`No enabled ${DEFAULT_PROMPTS_EXTENSION_ID} extension pack in config`);
  }
  return toTaskPromptResult(taskPrompts);
}

/** Copy prompts from local spec checkout (used by mdcp repo maintainers). */
export function copyTaskPromptsFromLocalSpec(
  repoRoot: string,
  docsRoot: string,
  cacheDir = DEFAULT_TASK_PROMPTS_CACHE_DIR,
  config?: MdcpConfig,
): TaskPromptsFetchResult {
  const pack = resolveExtensionPackById(
    config ?? taskPromptsOnlyConfig(cacheDir),
    DEFAULT_PROMPTS_EXTENSION_ID,
    {
      repoRoot,
    },
  );
  if (!pack) {
    throw new Error(`No enabled ${DEFAULT_PROMPTS_EXTENSION_ID} extension pack in config`);
  }
  return toTaskPromptResult(copyExtensionPackFromLocalSpec(pack, repoRoot, docsRoot));
}

function taskPromptsOnlyConfig(cacheDir?: string): MdcpConfig {
  return {
    protocolVersion: '0.4.0.0',
    outputDir: '_build',
    compileOrder: ['features'],
    backup: { enabled: false, dir: '.caches/backups', ext: '' },
    refs: { registryFile: '.caches/refs.json', slugAlgorithm: 'github' },
    extensions: {
      packs: [
        {
          id: DEFAULT_PROMPTS_EXTENSION_ID,
          enabled: true,
          cacheDir: cacheDir ?? DEFAULT_TASK_PROMPTS_CACHE_DIR,
          files: [...STANDARD_TASK_PROMPT_FILES],
          source: { repo: 'betsalel-williamson/mdcp', ref: 'main' },
        },
      ],
    },
  };
}

export {
  cacheEnabledExtensions,
  copyEnabledExtensionsFromLocalSpec,
  resolveEnabledExtensionPacks,
  resolveExtensionPackById,
  type ExtensionCacheOptions,
  type ExtensionCacheResult,
  type ExtensionPackCacheResult,
  type CachedExtensionPackManifest,
  type ResolvedExtensionPack,
};
