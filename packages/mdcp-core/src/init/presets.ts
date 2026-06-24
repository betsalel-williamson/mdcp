import { MdcpConfigSchema } from '../config/schema.js';

export type InitPreset = 'code' | 'docs-site' | 'operations' | 'learning';

export const INIT_PRESETS: InitPreset[] = ['code', 'docs-site', 'operations', 'learning'];

export function parseInitPreset(value: string | undefined): InitPreset {
  const preset = (value ?? 'code') as InitPreset;
  if (!INIT_PRESETS.includes(preset)) {
    throw new Error(`Unknown preset "${value}" — expected ${INIT_PRESETS.join(', ')}`);
  }
  return preset;
}

const PRESET_GUIDES: Record<InitPreset, string[]> = {
  code: ['glossary', 'features', 'client', 'developer'],
  'docs-site': ['glossary', 'features', 'client'],
  operations: ['glossary', 'features', 'procedures'],
  learning: ['glossary', 'features', 'modules'],
};

export function buildDefaultConfig(preset: InitPreset) {
  const compileOrder = PRESET_GUIDES[preset];
  return MdcpConfigSchema.parse({
    protocolVersion: '0.5.0.0',
    protocol: { profile: 'dev' },
    outputDir: '_build',
    outputFile: 'guides.md',
    compileOrder,
    guides: compileOrder.map((name) => ({ name, splitLevel: 2 })),
    extensions: {
      packs: [{ id: 'prompts-mdcp-defaults', enabled: true, version: '0.5.0.0' }],
    },
  });
}

export function guideDirsForPreset(preset: InitPreset): string[] {
  return [...PRESET_GUIDES[preset]];
}
