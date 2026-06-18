import type { ExtensionPack, MdcpConfig } from '../config/schema.js';
import {
  assertExtensionNotRevoked,
  assertProtocolCompatible,
  findCatalogEntry,
  resolveExtensionPackPath,
  selectCompatibleExtensionVersion,
  resolveProtocolVersionRange,
  type ExtensionVersionEntry,
} from './catalog.js';
import {
  DEFAULT_PROMPTS_EXTENSION_ID,
  getBuiltinExtensionDefaults,
  isBuiltinExtensionPackId,
  type BuiltinExtensionPackId,
} from './builtins.js';
import { normalizeExtensionSource, type ResolvedExtensionSource } from './source-url.js';
import { resolveProtocolFetch } from '../config/protocol-source.js';
import { loadExtensionsCatalog, resolveExtensionProtocolVersion } from './version.js';

export interface ResolvedExtensionPack {
  id: string;
  version: string;
  protocolVersion: string;
  protocolVersionRange: string;
  path: string;
  cacheDir: string;
  files: string[];
  source: ResolvedExtensionSource;
}

function defaultSourceFromConfig(config: MdcpConfig | undefined): ResolvedExtensionSource {
  const protocol = resolveProtocolFetch(config);
  return { repo: protocol.repo, ref: protocol.ref };
}

function resolveVersionEntry(
  pack: ExtensionPack,
  protocolVersion: string,
  catalog = loadExtensionsCatalog(),
): { version: string; entry: ExtensionVersionEntry } {
  const catalogEntry = findCatalogEntry(catalog, pack.id);
  if (pack.version) {
    const version = pack.version;
    const fromCatalog = catalogEntry?.versions.find((v) => v.version === version);
    if (fromCatalog) {
      assertExtensionNotRevoked(fromCatalog, pack.id);
      assertProtocolCompatible(protocolVersion, fromCatalog, pack.id);
      return { version, entry: fromCatalog };
    }
    if (!pack.path || !pack.files?.length) {
      throw new Error(
        `Extension "${pack.id}" version ${version} is not in the catalog — declare path and files for custom packs`,
      );
    }
    return {
      version,
      entry: {
        version,
        protocolVersionRange: protocolVersion,
        revoked: false,
      },
    };
  }

  if (!catalogEntry) {
    if (!pack.path || !pack.files?.length) {
      throw new Error(
        `Extension "${pack.id}" is not in the catalog — declare version, path, cacheDir, and files`,
      );
    }
    const version = pack.version ?? '0.0.0';
    return {
      version,
      entry: { version, protocolVersionRange: protocolVersion, revoked: false },
    };
  }
  const entry = selectCompatibleExtensionVersion(catalogEntry, protocolVersion);
  return { version: entry.version, entry };
}

function mergePackWithCatalog(
  pack: ExtensionPack,
  protocolVersion: string,
  catalog = loadExtensionsCatalog(),
): Omit<ResolvedExtensionPack, 'source'> {
  const { version, entry } = resolveVersionEntry(pack, protocolVersion, catalog);
  const path = pack.path ?? resolveExtensionPackPath(pack.id, version);
  const defaults = isBuiltinExtensionPackId(pack.id)
    ? getBuiltinExtensionDefaults(pack.id as BuiltinExtensionPackId)
    : undefined;

  if (!defaults && (!pack.cacheDir || !pack.files?.length) && !pack.path) {
    throw new Error(
      `Extension pack "${pack.id}" is missing cacheDir or files (required for non-built-in packs)`,
    );
  }

  return {
    id: pack.id,
    version,
    protocolVersion,
    protocolVersionRange: resolveProtocolVersionRange(entry),
    path,
    cacheDir: pack.cacheDir ?? defaults!.cacheDir,
    files: pack.files?.length ? pack.files : [...defaults!.files],
  };
}

/** Enabled extension packs from config, resolved against the extensions catalog. */
export function resolveEnabledExtensionPacks(
  config: MdcpConfig | undefined,
  options: { repoRoot?: string } = {},
): ResolvedExtensionPack[] {
  const protocolVersion = resolveExtensionProtocolVersion(config);
  const catalog = loadExtensionsCatalog(options.repoRoot);
  const defaultSource = defaultSourceFromConfig(config);
  const configured = config?.extensions?.packs;

  if (!configured?.length) {
    return [
      {
        ...mergePackWithCatalog(
          { id: DEFAULT_PROMPTS_EXTENSION_ID, enabled: true },
          protocolVersion,
          catalog,
        ),
        source: defaultSource,
      },
    ];
  }

  return configured
    .filter((pack) => pack.enabled)
    .map((pack) => ({
      ...mergePackWithCatalog(pack, protocolVersion, catalog),
      source: normalizeExtensionSource(pack.source, defaultSource),
    }));
}

export function resolveExtensionPackById(
  config: MdcpConfig | undefined,
  id: string,
  options: { repoRoot?: string } = {},
): ResolvedExtensionPack | undefined {
  return resolveEnabledExtensionPacks(config, options).find((pack) => pack.id === id);
}
