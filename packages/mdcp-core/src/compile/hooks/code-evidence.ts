import { readFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import type { CompileHook } from '../hooks.js';
import {
  defaultSearchRoots,
  hasSourceExtension,
  resolveRelativeFile,
  sourceExtensionSet,
} from './path-resolve.js';
import { formatLineFragment, lineRangeFromText } from './line-range.js';

export { formatLineFragment, lineRangeFromText } from './line-range.js';

const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;

const IDENT_RE = /^[\w$]+$/;

export function isSourcePath(path: string, extensions?: Set<string>): boolean {
  if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('#')) {
    return false;
  }
  if (path.endsWith('.md')) return false;
  const base = path.split('#')[0].split('?')[0];
  return hasSourceExtension(base, extensions) || !base.includes('.');
}

export function symbolFromLabel(label: string): string | null {
  const stripped = label.replace(/^`+|`+$/g, '').trim();
  if (!stripped || lineRangeFromText(stripped)) return null;
  if (!IDENT_RE.test(stripped)) return null;
  return stripped;
}

function evidenceSearchRoots(scopeRoot?: string): string[] {
  const roots = defaultSearchRoots();
  if (scopeRoot) roots.push(scopeRoot);
  return roots;
}

function lineForSymbol(filePath: string, symbol: string): string | null {
  const text = readFileSync(filePath, 'utf-8');
  const lines = text.split('\n');
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`\\b${escaped}\\b`),
    new RegExp(`\\bfunction\\s+${escaped}\\b`),
    new RegExp(`\\bclass\\s+${escaped}\\b`),
    new RegExp(`\\b(?:const|let|var|export)\\s+${escaped}\\b`),
    new RegExp(`\\b${escaped}\\s*\\(`),
  ];
  for (let i = 0; i < lines.length; i++) {
    if (patterns.some((re) => re.test(lines[i]))) {
      return formatLineFragment(String(i + 1));
    }
  }
  return null;
}

function posixRelative(fromDir: string, toFile: string): string {
  return relative(fromDir, toFile).replace(/\\/g, '/');
}

function outputPathForLink(pathPart: string, resolved: string | null, outputFile?: string): string {
  if (!resolved || !outputFile) return pathPart;
  return posixRelative(dirname(outputFile), resolved);
}

function rewriteEvidenceLink(
  label: string,
  target: string,
  guideDir: string,
  searchRoots: string[],
  outputFile?: string,
  extensions?: Set<string>,
): string {
  const [pathPart, fragment] = target.split('#');
  if (!isSourcePath(pathPart, extensions)) return `[${label}](${target})`;

  const existingLine = fragment?.match(/^L\d+(?:-L\d+)?$/i);
  if (existingLine) {
    const normalized = fragment.replace(/^l/i, 'L');
    const resolved = resolveRelativeFile(pathPart, guideDir, searchRoots);
    const outPath = outputPathForLink(pathPart, resolved, outputFile);
    return `[${label}](${outPath}#${normalized})`;
  }

  const resolved = resolveRelativeFile(pathPart, guideDir, searchRoots);

  let lineFrag = lineRangeFromText(label) ?? lineRangeFromText(pathPart);
  if (!lineFrag && fragment && !fragment.match(/^L\d/i) && resolved) {
    lineFrag = lineForSymbol(resolved, fragment);
  }
  if (!lineFrag && resolved) {
    const symbol = symbolFromLabel(label);
    if (symbol) lineFrag = lineForSymbol(resolved, symbol);
  }

  // No line to cite — a data file, or a symbol the label does not name. The
  // path still has to be rebased, or a link correct in the shard breaks in
  // output published from another directory. `outputPathForLink` leaves an
  // unresolvable path alone.
  if (!lineFrag) {
    return `[${label}](${outputPathForLink(pathPart, resolved, outputFile)})`;
  }

  const outPath = outputPathForLink(pathPart, resolved, outputFile);
  return `[${label}](${outPath}#${lineFrag})`;
}

export const codeEvidenceHook: CompileHook = (ctx) => {
  const guideDir = dirname(ctx.sourceFile);
  const searchRoots = evidenceSearchRoots(ctx.scopeRoot);
  const extensions = sourceExtensionSet(ctx.config.lint?.sourceExtensions ?? []);

  return ctx.body.replace(MD_LINK_RE, (match, label: string, target: string) => {
    if (!isSourcePath(target.split('#')[0], extensions)) return match;
    return rewriteEvidenceLink(label, target, guideDir, searchRoots, ctx.outputFile, extensions);
  });
};
