import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { MdcpConfig } from '../config/schema.js';
import { resolveProtocolFetch } from '../config/protocol-source.js';
import { LLMS_INDEX_PROTOCOL_VERSION } from '../export/llms-index-artifacts.js';
import { expandProtocolVersion, protocolVersionToReleaseRef } from '../export/protocol-version.js';
import {
  EXTENSIONS_CATALOG_FILE,
  parseExtensionsCatalog,
  type ExtensionsCatalog,
} from './catalog.js';
import { REFERENCE_EXTENSIONS_CATALOG } from './builtins.js';

/** Effective mdcp protocol version (root `protocolVersion` only). */
export function resolveExtensionProtocolVersion(config: MdcpConfig | undefined): string {
  const raw = config?.protocolVersion;
  return raw ? expandProtocolVersion(raw) : LLMS_INDEX_PROTOCOL_VERSION;
}

/**
 * Git ref for extension fetches when not overridden by llms-index fetch.
 * Uses explicit ref when set; derives release tag from protocol when ref is `main`.
 */
export function resolveExtensionFetchRef(
  config: MdcpConfig | undefined,
  resolvedRef?: string,
): string {
  if (resolvedRef) return resolvedRef;
  const sourceRef = resolveProtocolFetch(config).ref;
  if (sourceRef !== 'main') return sourceRef;
  return protocolVersionToReleaseRef(resolveExtensionProtocolVersion(config));
}

export function loadExtensionsCatalog(repoRoot?: string): ExtensionsCatalog {
  if (repoRoot) {
    const catalogPath = join(repoRoot, EXTENSIONS_CATALOG_FILE);
    if (existsSync(catalogPath)) {
      return parseExtensionsCatalog(JSON.parse(readFileSync(catalogPath, 'utf-8')));
    }
  }
  return REFERENCE_EXTENSIONS_CATALOG;
}
