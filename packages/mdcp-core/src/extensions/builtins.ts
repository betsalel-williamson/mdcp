import {
  DEFAULT_TASK_PROMPTS_CACHE_DIR,
  STANDARD_TASK_PROMPT_FILES,
} from '../export/task-prompts-artifacts.js';
import type { ExtensionsCatalog } from './catalog.js';

/** Default mdcp prompts extension pack id (reference repository). */
export const DEFAULT_PROMPTS_EXTENSION_ID = 'prompts-mdcp-defaults' as const;

/** Built-in extension pack ids shipped with the reference mdcp repository. */
export const BUILTIN_EXTENSION_PACK_IDS = [DEFAULT_PROMPTS_EXTENSION_ID] as const;

export type BuiltinExtensionPackId = (typeof BUILTIN_EXTENSION_PACK_IDS)[number];

/** Reference catalog bundled with mdcp — mirrors spec/extensions/manifest.json. */
export const REFERENCE_EXTENSIONS_CATALOG: ExtensionsCatalog = {
  catalogVersion: '0.4.0.0',
  extensions: [
    {
      id: DEFAULT_PROMPTS_EXTENSION_ID,
      description: 'Default mdcp meta-level agent task prompts for sharded documentation workflows',
      tags: ['prompts', 'authoring', 'bootstrap', 'defaults'],
      versions: [
        {
          version: '0.4.0.0',
          protocolVersionRange: '^0.4.0.0',
          revoked: false,
        },
      ],
    },
  ],
};

export interface BuiltinExtensionPackDefaults {
  cacheDir: string;
  files: readonly string[];
}

export const BUILTIN_EXTENSION_DEFAULTS: Record<
  BuiltinExtensionPackId,
  BuiltinExtensionPackDefaults
> = {
  [DEFAULT_PROMPTS_EXTENSION_ID]: {
    cacheDir: DEFAULT_TASK_PROMPTS_CACHE_DIR,
    files: STANDARD_TASK_PROMPT_FILES,
  },
};

export function isBuiltinExtensionPackId(id: string): id is BuiltinExtensionPackId {
  return (BUILTIN_EXTENSION_PACK_IDS as readonly string[]).includes(id);
}

export function getBuiltinExtensionDefaults(
  id: BuiltinExtensionPackId,
): BuiltinExtensionPackDefaults {
  return BUILTIN_EXTENSION_DEFAULTS[id];
}
