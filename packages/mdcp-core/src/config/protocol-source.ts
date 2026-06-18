import type { MdcpConfig } from './schema.js';
import {
  AUTHORITATIVE_PROTOCOL_REPO,
  DEFAULT_LLMS_INDEX_UPSTREAM_REF,
} from '../export/llms-index-fetch.js';
import type { LlmsIndexProfile } from '../export/llms-index-artifacts.js';

/** Git coordinates for protocol artifact fetch (llms-index + default extension packs). */
export interface ProtocolFetch {
  repo: string;
  ref: string;
  profile: LlmsIndexProfile;
  path?: string;
}

/**
 * Resolve protocol fetch: `protocol.profile` + optional `protocol.ref` (branch override).
 * Legacy `protocol.fetch` / `export.llmsIndex.upstream` still honored.
 */
export function resolveProtocolFetch(config: MdcpConfig | undefined): ProtocolFetch {
  const protocol = config?.protocol;
  const legacy = protocol?.fetch ?? protocol?.source ?? config?.export?.llmsIndex?.upstream;
  const extDefault = config?.extensions?.defaultSource;

  const profile = protocol?.profile ?? legacy?.profile ?? ('dev' as LlmsIndexProfile);

  return {
    repo: protocol?.repo ?? legacy?.repo ?? extDefault?.repo ?? AUTHORITATIVE_PROTOCOL_REPO,
    ref: protocol?.ref ?? legacy?.ref ?? extDefault?.ref ?? DEFAULT_LLMS_INDEX_UPSTREAM_REF,
    profile,
    path: protocol?.path ?? legacy?.path,
  };
}

/** @deprecated Use `resolveProtocolFetch`. */
export const resolveProtocolSource = resolveProtocolFetch;

/** @deprecated Use `ProtocolFetch`. */
export type ProtocolSource = ProtocolFetch;

export function resolveLlmsIndexOutputFilename(config: MdcpConfig | undefined): string | undefined {
  return config?.protocol?.llmsIndex?.outputFile ?? config?.export?.llmsIndex?.outputFile;
}
