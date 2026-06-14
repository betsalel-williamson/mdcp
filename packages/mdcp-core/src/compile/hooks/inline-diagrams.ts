import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { CompileHook } from '../hooks.js';

const DIAGRAM_DIRECTIVE_RE = /<!--\s*mdcp:diagram\s+([^\s>]+)\s*-->/g;
const DIAGRAM_LINK_RE = /\[([^\]]*)\]\((\.\/)?([^)]*(?:diagram|diagrams)[^)]*\.md)\)/gi;

function readDiagramFile(guideDir: string, relPath: string): string | null {
  const normalized = relPath.replace(/^\.\//, '');
  const candidates = [resolve(guideDir, normalized), resolve(guideDir, '..', normalized)];
  for (const path of candidates) {
    if (existsSync(path)) {
      return readFileSync(path, 'utf-8').trim();
    }
  }
  return null;
}

function inlineDiagramContent(guideDir: string, relPath: string): string {
  const content = readDiagramFile(guideDir, relPath);
  if (!content) return `<!-- mdcp:diagram missing: ${relPath} -->`;
  return `\n\n${content}\n\n`;
}

export const inlineDiagramsHook: CompileHook = (ctx) => {
  const guideDir = dirname(ctx.sourceFile);

  let out = ctx.body.replace(DIAGRAM_DIRECTIVE_RE, (_match, relPath: string) =>
    inlineDiagramContent(guideDir, relPath.trim()),
  );

  out = out.replace(DIAGRAM_LINK_RE, (match, _label: string, _dot: string, relPath: string) => {
    const content = readDiagramFile(guideDir, relPath);
    if (!content) return match;
    return `\n\n${content}\n\n`;
  });

  return out;
};
