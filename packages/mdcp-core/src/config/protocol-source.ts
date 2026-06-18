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

/** Resolve protocol fetch from flat `protocol.profile`, `protocol.ref`, and optional overrides. */
export function resolveProtocolFetch(config: MdcpConfig | undefined): ProtocolFetch {
  const protocol = config?.protocol;

  return {
    repo: protocol?.repo ?? AUTHORITATIVE_PROTOCOL_REPO,
    ref: protocol?.ref ?? DEFAULT_LLMS_INDEX_UPSTREAM_REF,
    profile: protocol?.profile ?? ('dev' as LlmsIndexProfile),
    path: protocol?.path,
  };
}

export function resolveLlmsIndexOutputFilename(config: MdcpConfig | undefined): string | undefined {
  return config?.protocol?.llmsIndex?.outputFile;
}
