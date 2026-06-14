import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { sectionFiles } from '../compile/assemble.js';

export function writeSectionsManifest(
  guideDir: string,
  _guideName?: string,
  manifest?: string,
  sectionsHeading?: string,
): number {
  const manifestPath = join(guideDir, 'sections.txt');
  if (existsSync(manifestPath)) {
    unlinkSync(manifestPath);
  }
  const files = sectionFiles(guideDir, { manifest, sectionsHeading });
  const lines = files.map((file) => relative(guideDir, file));
  writeFileSync(manifestPath, lines.join('\n') + '\n', 'utf-8');
  return files.length;
}

export interface SectionsManifestEntry {
  name: string;
  dir: string;
  manifest?: string;
  sectionsHeading?: string;
}

export function writeAllSectionsManifests(
  entries: SectionsManifestEntry[],
): { name: string; count: number }[] {
  return entries.map(({ name, dir, manifest, sectionsHeading }) => {
    const count = writeSectionsManifest(dir, name, manifest, sectionsHeading);
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
