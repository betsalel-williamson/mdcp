import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { githubSlugify } from '../../refs/slugs.js';
import type { CompileHook, CompileHookState, InlineInsertsHookState } from '../hooks.js';
import { hookSearchRoots, resolveRelativeFile } from './path-resolve.js';

/** Paths under shared insert libraries: diagrams/, tables/, figures/, media/, inserts/, etc. */
const INSERT_LIBRARY_DIR = '(?:diagrams?|tables?|figures?|media|inserts?)';

const INSERT_LINK_RE = new RegExp(
  `\\[([^\\]]*)\\]\\((?!https?:)((?:(?:\\.\\./)+|\\./)?${INSERT_LIBRARY_DIR}/[^)#\\s][^)]*\\.md(?:#[^)]+)?)\\)`,
  'gi',
);

const INSERT_KINDS = new Set(['diagram', 'table', 'figure', 'media', 'insert']);

/** Heading level for first inlined insert (GFM anchor target for back-links). */
const INSERT_HEADING_PREFIX = '####';

type InsertLinkRef = { start: number; end: number; label: string; relPath: string };

function createInlineInsertsState(): InlineInsertsHookState {
  return { firstAnchorByPath: new Map(), nextNumberByKind: new Map() };
}

function ensureInlineInsertsState(hookState?: CompileHookState): InlineInsertsHookState {
  if (!hookState) {
    return createInlineInsertsState();
  }
  if (!hookState.inlineInserts) {
    hookState.inlineInserts = createInlineInsertsState();
  }
  return hookState.inlineInserts;
}

export function isInsertLibraryPath(relPath: string): boolean {
  if (/^https?:\/\//i.test(relPath) || !/\.md$/i.test(relPath)) return false;
  INSERT_LINK_RE.lastIndex = 0;
  const matches = INSERT_LINK_RE.test(`[x](${relPath})`);
  INSERT_LINK_RE.lastIndex = 0;
  return matches;
}

function humanizeBasename(resolvedPath: string): string {
  return basename(resolvedPath, '.md')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function insertKind(resolvedPath: string): string | null {
  const parent = basename(dirname(resolvedPath)).toLowerCase();
  const kind = parent.endsWith('s') ? parent.slice(0, -1) : parent;
  return INSERT_KINDS.has(kind) ? kind : null;
}

function kindTitle(kind: string): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function baseTitle(resolvedPath: string, label: string): string {
  return label.trim() || humanizeBasename(resolvedPath);
}

function stripLeadingKind(title: string, kind: string): string {
  const prefix = kindTitle(kind);
  if (new RegExp(`^${prefix}\\b`, 'i').test(title)) {
    return title
      .slice(prefix.length)
      .trim()
      .replace(/^[.:]\s*/, '');
  }
  return title;
}

/** Caption title without kind prefix or serial number. */
export function insertCaptionTitle(resolvedPath: string, label = ''): string {
  const kind = insertKind(resolvedPath);
  const title = baseTitle(resolvedPath, label);
  if (!kind) return title;
  return stripLeadingKind(title, kind) || humanizeBasename(resolvedPath);
}

/** GFM heading for a first inline — e.g. `Table 1. Status codes`. */
export function numberedInsertHeading(resolvedPath: string, label: string, number: number): string {
  const kind = insertKind(resolvedPath);
  if (!kind) return baseTitle(resolvedPath, label);
  const caption = insertCaptionTitle(resolvedPath, label);
  return `${kindTitle(kind)} ${number}. ${caption}`;
}

export function insertAnchorSlug(resolvedPath: string, label = '', number = 1): string {
  return githubSlugify(numberedInsertHeading(resolvedPath, label, number));
}

function nextInsertNumber(state: InlineInsertsHookState, kind: string): number {
  const number = state.nextNumberByKind.get(kind) ?? 1;
  state.nextNumberByKind.set(kind, number + 1);
  return number;
}

function readInsertAt(resolvedPath: string): string | null {
  try {
    return readFileSync(resolvedPath, 'utf-8').trim();
  } catch {
    return null;
  }
}

function formatFirstInline(
  resolvedPath: string,
  content: string,
  label: string,
  state: InlineInsertsHookState,
): string {
  const kind = insertKind(resolvedPath);
  const heading = kind
    ? numberedInsertHeading(resolvedPath, label, nextInsertNumber(state, kind))
    : baseTitle(resolvedPath, label);
  const anchor = githubSlugify(heading);
  state.firstAnchorByPath.set(resolvedPath, anchor);
  return `\n\n${INSERT_HEADING_PREFIX} ${heading}\n\n${content}\n\n`;
}

function formatBackLink(label: string, anchor: string): string {
  const text = label.trim() || 'See insert';
  return `[${text}](#${anchor})`;
}

function resolveInsert(
  relPath: string,
  guideDir: string,
  searchRoots: string[],
): { resolvedPath: string; content: string } | null {
  const resolvedPath = resolveRelativeFile(relPath, guideDir, searchRoots);
  if (!resolvedPath) return null;
  const content = readInsertAt(resolvedPath);
  if (!content) return null;
  return { resolvedPath, content };
}

function findInsertLinks(body: string): InsertLinkRef[] {
  INSERT_LINK_RE.lastIndex = 0;
  const refs: InsertLinkRef[] = [];
  for (const match of body.matchAll(INSERT_LINK_RE)) {
    const raw = match[0];
    const index = match.index;
    if (raw === undefined || index === undefined) continue;
    refs.push({
      start: index,
      end: index + raw.length,
      label: match[1],
      relPath: match[2],
    });
  }
  return refs;
}

function replacementForLink(
  ref: InsertLinkRef,
  guideDir: string,
  searchRoots: string[],
  state: InlineInsertsHookState,
  original: string,
): string {
  const insert = resolveInsert(ref.relPath, guideDir, searchRoots);
  if (!insert) return original;

  const existing = state.firstAnchorByPath.get(insert.resolvedPath);
  if (existing) {
    return formatBackLink(ref.label, existing);
  }

  return formatFirstInline(insert.resolvedPath, insert.content, ref.label, state);
}

export const inlineInsertsHook: CompileHook = (ctx) => {
  const guideDir = dirname(ctx.sourceFile);
  const searchRoots = hookSearchRoots(ctx, 'inlineInserts');
  const state = ensureInlineInsertsState(ctx.hookState);
  const refs = findInsertLinks(ctx.body);

  if (!refs.length) return ctx.body;

  const replacements = refs.map((ref) => ({
    start: ref.start,
    end: ref.end,
    text: replacementForLink(ref, guideDir, searchRoots, state, ctx.body.slice(ref.start, ref.end)),
  }));

  let out = ctx.body;
  for (const rep of [...replacements].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, rep.start) + rep.text + out.slice(rep.end);
  }

  return out;
};
