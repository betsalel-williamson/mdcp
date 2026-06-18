import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { MdcpConfig } from '../config/schema.js';
import {
  DEFAULT_LLMS_INDEX_UPSTREAM_REPO,
  resolveUpstreamRef,
} from '../export/llms-index-fetch.js';
import {
  assertExtensionNotRevoked,
  assertProtocolCompatible,
  parseExtensionPackManifest,
} from './catalog.js';
import { resolveEnabledExtensionPacks, type ResolvedExtensionPack } from './resolve.js';
import { isBuiltinExtensionPackId } from './builtins.js';
import { buildExtensionFileUrl } from './source-url.js';
import { resolveExtensionFetchRef } from './version.js';
import { scanPackReferences, type PackExternalReference } from './scan-pack-references.js';

export { formatExternalReferenceWarning } from './scan-pack-references.js';

export interface ExtensionCacheOptions {
  docsRoot: string;
  config?: MdcpConfig;
  /** Repo root for --fetch-local copies. */
  localRepoRoot?: string;
  /** Skip ref resolution when caller already resolved (e.g. after llms-index fetch). */
  resolvedRef?: string;
  fetch?: typeof fetch;
}

export interface ExtensionPackCacheResult {
  id: string;
  version: string;
  cacheDir: string;
  files: string[];
  manifestPath: string;
  selfContained: boolean;
  externalReferences: PackExternalReference[];
}

export interface ExtensionCacheResult {
  packs: ExtensionPackCacheResult[];
}

/** Manifest written into each pack cache directory after fetch or local copy. */
export interface CachedExtensionPackManifest {
  id: string;
  version: string;
  protocolVersion: string;
  protocolVersionRange: string;
  revoked: boolean;
  revokedReason?: string;
  ref: string;
  source: { repo: string; ref: string; baseUrl?: string };
  path: string;
  files: string[];
  selfContained: boolean;
  externalReferences: PackExternalReference[];
}

async function resolvePackRef(
  pack: ResolvedExtensionPack,
  options: ExtensionCacheOptions,
): Promise<string> {
  if (options.localRepoRoot !== undefined) return 'local';
  if (pack.source.baseUrl) return pack.source.ref;
  const fetchFn = options.fetch ?? fetch;
  const refInput = resolveExtensionFetchRef(options.config, options.resolvedRef);
  if (refInput === 'latest') {
    return resolveUpstreamRef(
      pack.source.repo ?? DEFAULT_LLMS_INDEX_UPSTREAM_REPO,
      refInput,
      fetchFn,
    );
  }
  return refInput;
}

async function readPackFile(
  pack: ResolvedExtensionPack,
  filename: string,
  ref: string,
  options: ExtensionCacheOptions,
): Promise<string> {
  if (options.localRepoRoot !== undefined) {
    const filePath = join(options.localRepoRoot, pack.path, filename);
    if (!existsSync(filePath)) {
      throw new Error(`Local extension file not found: ${filePath}`);
    }
    return readFileSync(filePath, 'utf-8');
  }

  const url = buildExtensionFileUrl({ ...pack.source, ref }, pack.path, filename);
  const fetchFn = options.fetch ?? fetch;
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch extension file ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

async function validateUpstreamPackManifest(
  pack: ResolvedExtensionPack,
  ref: string,
  options: ExtensionCacheOptions,
): Promise<void> {
  if (!isBuiltinExtensionPackId(pack.id)) return;

  let text: string | undefined;

  if (options.localRepoRoot !== undefined) {
    const localPath = join(options.localRepoRoot, pack.path, 'manifest.json');
    if (!existsSync(localPath)) return;
    text = readFileSync(localPath, 'utf-8');
  } else {
    const url = buildExtensionFileUrl({ ...pack.source, ref }, pack.path, 'manifest.json');
    const fetchFn = options.fetch ?? fetch;
    const res = await fetchFn(url);
    if (!res.ok) return;
    text = await res.text();
  }

  const upstream = parseExtensionPackManifest(JSON.parse(text));
  assertExtensionNotRevoked(upstream, pack.id);
  assertProtocolCompatible(pack.protocolVersion, upstream, pack.id);
}

function writePackManifest(
  cacheDir: string,
  pack: ResolvedExtensionPack,
  ref: string,
  files: string[],
  scan: { selfContained: boolean; externalReferences: PackExternalReference[] },
): string {
  const manifest: CachedExtensionPackManifest = {
    id: pack.id,
    version: pack.version,
    protocolVersion: pack.protocolVersion,
    protocolVersionRange: pack.protocolVersionRange,
    revoked: false,
    ref,
    source: {
      repo: pack.source.repo,
      ref: pack.source.ref,
      ...(pack.source.baseUrl ? { baseUrl: pack.source.baseUrl } : {}),
    },
    path: pack.path,
    files,
    selfContained: scan.selfContained,
    externalReferences: scan.externalReferences,
  };
  const manifestPath = join(cacheDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  return manifestPath;
}

async function cacheExtensionPack(
  pack: ResolvedExtensionPack,
  options: ExtensionCacheOptions,
): Promise<ExtensionPackCacheResult> {
  const cacheDir = resolve(options.docsRoot, pack.cacheDir);
  mkdirSync(cacheDir, { recursive: true });

  const ref = await resolvePackRef(pack, options);
  await validateUpstreamPackManifest(pack, ref, options);

  const pending: { filename: string; text: string }[] = [];
  for (const filename of pack.files) {
    pending.push({ filename, text: await readPackFile(pack, filename, ref, options) });
  }

  const scan = scanPackReferences(pending.map(({ filename, text }) => ({ filename, text })));

  const written: string[] = [];
  for (const { filename, text } of pending) {
    const outPath = join(cacheDir, filename);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, text, 'utf-8');
    written.push(outPath);
  }

  const manifestPath = writePackManifest(cacheDir, pack, ref, pack.files, scan);

  return {
    id: pack.id,
    version: pack.version,
    cacheDir,
    files: written,
    manifestPath,
    selfContained: scan.selfContained,
    externalReferences: scan.externalReferences,
  };
}

/** Fetch or copy all enabled extension packs into docs-root cache directories. */
export async function cacheEnabledExtensions(
  options: ExtensionCacheOptions,
): Promise<ExtensionCacheResult> {
  const packs = resolveEnabledExtensionPacks(options.config, {
    repoRoot: options.localRepoRoot,
  });
  const results: ExtensionPackCacheResult[] = [];
  for (const pack of packs) {
    results.push(await cacheExtensionPack(pack, options));
  }
  return { packs: results };
}

/** Copy one pack from a local spec checkout (maintainer dogfooding). */
export function copyExtensionPackFromLocalSpec(
  pack: ResolvedExtensionPack,
  repoRoot: string,
  docsRoot: string,
): ExtensionPackCacheResult {
  const cacheDir = resolve(docsRoot, pack.cacheDir);
  mkdirSync(cacheDir, { recursive: true });
  const pending: { filename: string; text: string }[] = [];
  const written: string[] = [];
  for (const filename of pack.files) {
    const src = join(repoRoot, pack.path, filename);
    const dest = join(cacheDir, filename);
    const text = readFileSync(src, 'utf-8');
    pending.push({ filename, text });
    copyFileSync(src, dest);
    written.push(dest);
  }
  const scan = scanPackReferences(pending);
  const manifestPath = writePackManifest(cacheDir, pack, 'local', pack.files, scan);
  return {
    id: pack.id,
    version: pack.version,
    cacheDir,
    files: written,
    manifestPath,
    selfContained: scan.selfContained,
    externalReferences: scan.externalReferences,
  };
}

export function copyEnabledExtensionsFromLocalSpec(
  repoRoot: string,
  docsRoot: string,
  config?: MdcpConfig,
): ExtensionCacheResult {
  const packs = resolveEnabledExtensionPacks(config, { repoRoot }).map((pack) =>
    copyExtensionPackFromLocalSpec(pack, repoRoot, docsRoot),
  );
  return { packs };
}
