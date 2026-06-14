import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sectionFiles } from '../compile/assemble.js';

export function writeSectionsManifest(
  guideDir: string,
  guideName?: string,
  manifest?: string,
): number {
  const files = sectionFiles(guideDir, { manifest });
  writeFileSync(join(guideDir, 'sections.txt'), files.join('\n') + '\n', 'utf-8');
  const name = guideName ?? guideDir.split(/[/\\]/).pop() ?? guideDir;
  return files.length;
}

export interface SectionsManifestEntry {
  name: string;
  dir: string;
  manifest?: string;
}

export function writeAllSectionsManifests(
  entries: SectionsManifestEntry[],
): { name: string; count: number }[] {
  return entries.map(({ name, dir, manifest }) => {
    const count = writeSectionsManifest(dir, name, manifest);
    return { name, count };
  });
}

/** @deprecated Pass explicit guide dir entries. */
export function writeAllSectionsManifestsLegacy(
  guidesRoot: string,
  guideNames: string[],
): { name: string; count: number }[] {
  return writeAllSectionsManifests(
    guideNames.map((name) => ({ name, dir: join(guidesRoot, name) })),
  );
}
