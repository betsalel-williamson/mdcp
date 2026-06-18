import { resolve } from 'node:path';
import { abbreviateProtocolVersion } from './protocol-version.js';

export const LLMS_INDEX_PROTOCOL_VERSION = '1.0.0.0';

/** Immutable protocol llms-index artifacts (published spec versions). */
export const LLMS_INDEX_SPEC_DIR = 'spec/llms-index';

/** Symlink to the current adopted stable artifact (`mdcp.v{n}.llms.txt`). */
export const LLMS_INDEX_PROFILE_STABLE = 'vstable';

/** Symlink to the current in-progress draft (`mdcp.v{n}--draft.llms.txt`). */
export const LLMS_INDEX_PROFILE_DEV = 'vdev';

export type LlmsIndexProfile = 'stable' | 'dev';

export interface LlmsIndexFilenameOptions {
  draft?: boolean;
}

export function defaultLlmsIndexFilename(
  protocolVersion = LLMS_INDEX_PROTOCOL_VERSION,
  options: LlmsIndexFilenameOptions = {},
): string {
  const abbrev = abbreviateProtocolVersion(protocolVersion);
  const draft = options.draft ? '--draft' : '';
  return `mdcp.v${abbrev}${draft}.llms.txt`;
}

export function resolveLlmsIndexProfilePath(profile: LlmsIndexProfile): string {
  const name = profile === 'stable' ? LLMS_INDEX_PROFILE_STABLE : LLMS_INDEX_PROFILE_DEV;
  return `${LLMS_INDEX_SPEC_DIR}/${name}`;
}

export function resolveLlmsIndexSpecPath(
  protocolVersion = LLMS_INDEX_PROTOCOL_VERSION,
  options: LlmsIndexFilenameOptions = {},
): string {
  return `${LLMS_INDEX_SPEC_DIR}/${defaultLlmsIndexFilename(protocolVersion, options)}`;
}

export function resolveLlmsIndexSpecFile(
  repoRoot: string,
  profileOrPath: LlmsIndexProfile | string,
): string {
  if (profileOrPath === 'stable' || profileOrPath === 'dev') {
    return resolve(repoRoot, resolveLlmsIndexProfilePath(profileOrPath));
  }
  return resolve(repoRoot, profileOrPath.replace(/^\//, ''));
}
