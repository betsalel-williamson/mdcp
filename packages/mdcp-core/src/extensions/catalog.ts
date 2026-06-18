import {
  compareExtensionVersion,
  isSemverRangeSyntax,
  normalizeProtocolVersionRange,
  protocolSatisfiesRange,
} from './protocol-version-range.js';

export const EXTENSIONS_SPEC_DIR = 'spec/extensions';
export const EXTENSIONS_CATALOG_FILE = `${EXTENSIONS_SPEC_DIR}/manifest.json`;

export interface ExtensionVersionEntry {
  version: string;
  /** npm semver range — canonical protocol compatibility (see spec/extensions/FORMAT.md). */
  protocolVersionRange?: string;
  /** @deprecated Use `protocolVersionRange`. Bare version or range when range field omitted. */
  minProtocolVersion?: string;
  /** @deprecated Use `protocolVersionRange`. Upper bound when synthesizing a hyphen range. */
  maxProtocolVersion?: string;
  revoked?: boolean;
  revokedReason?: string;
}

export interface ExtensionCatalogEntry {
  id: string;
  description: string;
  tags: string[];
  versions: ExtensionVersionEntry[];
}

export interface ExtensionsCatalog {
  catalogVersion: string;
  extensions: ExtensionCatalogEntry[];
}

export interface ExtensionPackManifest {
  id: string;
  version: string;
  protocolVersionRange?: string;
  minProtocolVersion?: string;
  maxProtocolVersion?: string;
  revoked?: boolean;
  revokedReason?: string;
  files: string[];
}

export function resolveExtensionPackPath(extensionId: string, version: string): string {
  return `${EXTENSIONS_SPEC_DIR}/${extensionId}/${version}`;
}

export function resolveExtensionPackManifestPath(extensionId: string, version: string): string {
  return `${resolveExtensionPackPath(extensionId, version)}/manifest.json`;
}

/** Resolve effective semver range from catalog or pack manifest fields. */
export function resolveProtocolVersionRange(
  entry: Pick<
    ExtensionVersionEntry,
    'protocolVersionRange' | 'minProtocolVersion' | 'maxProtocolVersion'
  >,
): string {
  if (entry.protocolVersionRange) return entry.protocolVersionRange;

  const min = entry.minProtocolVersion?.trim();
  const max = entry.maxProtocolVersion?.trim();

  if (min && isSemverRangeSyntax(min)) {
    if (max) {
      throw new Error(
        'protocolVersionRange or minProtocolVersion alone is required — do not combine a range min with maxProtocolVersion',
      );
    }
    return min;
  }

  if (min && max) return normalizeProtocolVersionRange(`${min} - ${max}`);
  if (min) {
    return isSemverRangeSyntax(min) || min.includes('>') || min.includes('<')
      ? normalizeProtocolVersionRange(min)
      : normalizeProtocolVersionRange(`>=${min}`);
  }
  if (max) {
    return max.includes('>') || max.includes('<')
      ? normalizeProtocolVersionRange(max)
      : normalizeProtocolVersionRange(`<=${max}`);
  }

  throw new Error('Extension version entry requires protocolVersionRange or minProtocolVersion');
}

export function isProtocolCompatible(
  protocolVersion: string,
  entry: Pick<
    ExtensionVersionEntry | ExtensionPackManifest,
    'protocolVersionRange' | 'minProtocolVersion' | 'maxProtocolVersion'
  >,
): boolean {
  return protocolSatisfiesRange(protocolVersion, resolveProtocolVersionRange(entry));
}

export function parseExtensionsCatalog(raw: unknown): ExtensionsCatalog {
  const data = raw as ExtensionsCatalog;
  if (!data?.extensions?.length) {
    throw new Error('Extensions catalog is missing extensions[]');
  }
  return data;
}

export function parseExtensionPackManifest(raw: unknown): ExtensionPackManifest {
  const data = raw as ExtensionPackManifest;
  if (!data?.id || !data?.version || !data?.files?.length) {
    throw new Error('Extension pack manifest requires id, version, and files[]');
  }
  if (!data.protocolVersionRange && !data.minProtocolVersion) {
    throw new Error(
      'Extension pack manifest requires protocolVersionRange (or legacy minProtocolVersion)',
    );
  }
  resolveProtocolVersionRange(data);
  return data;
}

export function findCatalogEntry(
  catalog: ExtensionsCatalog,
  extensionId: string,
): ExtensionCatalogEntry | undefined {
  return catalog.extensions.find((entry) => entry.id === extensionId);
}

/** Pick the newest compatible, non-revoked version from the catalog entry. */
export function selectCompatibleExtensionVersion(
  entry: ExtensionCatalogEntry,
  protocolVersion: string,
): ExtensionVersionEntry {
  const compatible = entry.versions
    .filter((v) => !v.revoked && isProtocolCompatible(protocolVersion, v))
    .sort((a, b) => compareExtensionVersion(a.version, b.version));

  if (!compatible.length) {
    throw new Error(
      `No compatible non-revoked version of extension "${entry.id}" for protocol ${protocolVersion}`,
    );
  }
  return compatible[0]!;
}

export function assertExtensionNotRevoked(
  manifest: ExtensionVersionEntry | ExtensionPackManifest,
  extensionId: string,
): void {
  if (manifest.revoked) {
    const reason = manifest.revokedReason ? `: ${manifest.revokedReason}` : '';
    throw new Error(`Extension "${extensionId}" version is revoked${reason}`);
  }
}

export function assertProtocolCompatible(
  protocolVersion: string,
  manifest: ExtensionVersionEntry | ExtensionPackManifest,
  extensionId: string,
): void {
  if (!isProtocolCompatible(protocolVersion, manifest)) {
    const range = resolveProtocolVersionRange(manifest);
    throw new Error(
      `Extension "${extensionId}" requires protocol ${range}; config has ${protocolVersion}`,
    );
  }
}
