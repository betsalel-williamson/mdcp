import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { MdcpConfig } from '../config/schema.js';
import { guideDirsForPreset, type InitPreset } from './presets.js';

const GUIDE_INDEX_STUB = (name: string) => `# ${name}

- [about-this-guide.md](./about-this-guide.md)
`;

const ABOUT_STUB = `# About this guide

Shard manifest for the **${'{name}'}** guide. Add topic shards below.
`;

const GLOSSARY_INDEX_STUB = `# Glossary

Domain terms — one shard per term.
`;

export interface ScaffoldResult {
  created: string[];
  skipped: string[];
}

export function scaffoldDefaultLayout(docsRootAbs: string, preset: InitPreset): ScaffoldResult {
  const created: string[] = [];
  const skipped: string[] = [];

  mkdirSync(docsRootAbs, { recursive: true });

  for (const guide of guideDirsForPreset(preset)) {
    const guideDir = join(docsRootAbs, guide);
    mkdirSync(guideDir, { recursive: true });

    const indexPath = join(guideDir, 'index.md');
    if (!existsSync(indexPath)) {
      const body = guide === 'glossary' ? GLOSSARY_INDEX_STUB : GUIDE_INDEX_STUB(guide);
      writeFileSync(indexPath, body, 'utf-8');
      created.push(indexPath);
    } else {
      skipped.push(indexPath);
    }

    if (guide !== 'glossary') {
      const aboutPath = join(guideDir, 'about-this-guide.md');
      if (!existsSync(aboutPath)) {
        writeFileSync(aboutPath, ABOUT_STUB.replace('{name}', guide), 'utf-8');
        created.push(aboutPath);
      } else {
        skipped.push(aboutPath);
      }
    }
  }

  const extensionsDir = join(docsRootAbs, 'extensions');
  mkdirSync(extensionsDir, { recursive: true });

  return { created, skipped };
}

export function writeDefaultConfig(
  docsRootAbs: string,
  config: MdcpConfig,
): { path: string; created: boolean } {
  const configPath = join(docsRootAbs, 'mdcp.config.json');
  if (!existsSync(configPath)) {
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
    return { path: configPath, created: true };
  }
  return { path: configPath, created: false };
}
