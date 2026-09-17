import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CompileHookContext } from '../hooks.js';

export function defaultSearchRoots(): string[] {
  return [process.cwd(), resolve(process.cwd(), '..')];
}

export function hookSearchRoots(
  ctx: Pick<CompileHookContext, 'guideName' | 'config' | 'scopeRoot'>,
  configKey: 'inlineInserts',
): string[] {
  const roots = defaultSearchRoots();
  if (ctx.scopeRoot) roots.push(ctx.scopeRoot);
  const guideCfg = ctx.config.guides?.find((g) => g.name === ctx.guideName);
  const hooksConfig = guideCfg?.compile?.hooksConfig;
  const extraRoots = hooksConfig?.[configKey]?.searchRoots ?? [];
  for (const root of extraRoots) {
    roots.push(resolve(process.cwd(), root));
  }
  return roots;
}

export function resolveRelativeFile(
  relPath: string,
  guideDir: string,
  searchRoots: string[] = [],
): string | null {
  const normalized = relPath.replace(/^\.\//, '');
  const filePart = normalized.split('#')[0];
  const candidates = [
    resolve(guideDir, filePart),
    ...searchRoots.map((root) => resolve(root, filePart)),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export function readTextFileAt(
  relPath: string,
  guideDir: string,
  searchRoots: string[] = [],
): string | null {
  const resolved = resolveRelativeFile(relPath, guideDir, searchRoots);
  if (!resolved) return null;
  return readFileSync(resolved, 'utf-8').trim();
}

/**
 * Extensions treated as source files for link resolution. A link whose target
 * carries one of these names a file in the repository, so an unresolved target
 * is a defect rather than prose.
 *
 * No list of this kind is complete — a repository can be written in a language
 * or configured with a format that is not here — so it is a default rather than
 * a fixed set. `lint.sourceExtensions` adds to it, which is what a project
 * building on an unlisted stack needs.
 */
export const DEFAULT_SOURCE_EXTENSIONS: readonly string[] = [
  // JavaScript and TypeScript
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'mts',
  'cts',
  // JVM, .NET and other compiled languages
  'java',
  'kt',
  'kts',
  'scala',
  'groovy',
  'cs',
  'fs',
  'vb',
  'go',
  'rs',
  'swift',
  'm',
  'mm',
  'c',
  'h',
  'cc',
  'cpp',
  'cxx',
  'hpp',
  'hh',
  'hxx',
  'zig',
  'dart',
  'ex',
  'exs',
  'erl',
  'hrl',
  'hs',
  'ml',
  'mli',
  'clj',
  'cljs',
  'cljc',
  'nim',
  'cr',
  'jl',
  'lua',
  'pl',
  'pm',
  'r',
  'scm',
  'rkt',
  'v',
  'sv',
  'vhd',
  'vhdl',
  // Scripting and dynamic languages
  'py',
  'pyi',
  'rb',
  'rake',
  'php',
  'sh',
  'bash',
  'zsh',
  'fish',
  'ps1',
  'bat',
  'cmd',
  // Markup, templates and component formats
  'vue',
  'svelte',
  'astro',
  'html',
  'htm',
  'css',
  'scss',
  'sass',
  'less',
  'styl',
  'jinja',
  'j2',
  'hbs',
  'ejs',
  'erb',
  'liquid',
  'mustache',
  'twig',
  'razor',
  'cshtml',
  // Data, schema and interface definitions
  'json',
  'jsonc',
  'json5',
  'yaml',
  'yml',
  'toml',
  'ini',
  'cfg',
  'conf',
  'properties',
  'env',
  'xml',
  'xsd',
  'csv',
  'tsv',
  'sql',
  'graphql',
  'gql',
  'proto',
  'thrift',
  'avsc',
  'cue',
  'jsonnet',
  'libsonnet',
  // Build, infrastructure and policy
  'gradle',
  'bzl',
  'bazel',
  'cmake',
  'mk',
  'make',
  'nix',
  'tf',
  'tfvars',
  'hcl',
  'dockerfile',
  'containerfile',
  'rules',
  'rego',
  'star',
  // Notebooks and misc
  'ipynb',
  'sol',
  'gd',
  'tres',
  'tscn',
];

function extensionOf(path: string): string | null {
  const bare = path.split('#')[0].split('?')[0];
  const base = bare.slice(bare.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  if (dot <= 0 || dot === base.length - 1) return null;
  return base.slice(dot + 1).toLowerCase();
}

/**
 * Build the effective extension set: the defaults plus whatever a repository
 * adds. A leading dot on a configured entry is accepted, since that is how
 * people write extensions.
 */
export function sourceExtensionSet(extra: readonly string[] = []): Set<string> {
  const set = new Set(DEFAULT_SOURCE_EXTENSIONS);
  for (const entry of extra) {
    const normalized = entry.trim().replace(/^\./, '').toLowerCase();
    if (normalized) set.add(normalized);
  }
  return set;
}

/**
 * True when `path` ends in a source-file extension.
 *
 * `extensions` is either the set from `sourceExtensionSet` — build it once when
 * checking many paths — or the raw `lint.sourceExtensions` array. Membership is
 * a set lookup rather than a generated regex, so a configured value cannot
 * change how matching behaves.
 */
export function hasSourceExtension(
  path: string,
  extensions?: Set<string> | readonly string[],
): boolean {
  const ext = extensionOf(path);
  if (!ext) return false;
  const set = extensions instanceof Set ? extensions : sourceExtensionSet(extensions ?? []);
  return set.has(ext);
}
