import { resolve } from 'node:path';
import { abbreviateProtocolVersion } from './protocol-version.js';

export const LLMS_INDEX_PROTOCOL_VERSION = '0.4.0.0';

/** Immutable protocol llms-index artifacts (published spec versions). */
export const LLMS_INDEX_SPEC_DIR = 'spec/llms-index';

/** Symlink to the current open-alpha artifact (`mdcp.v{n}.llms.txt`). Replaced by `vstable` at npm 1.0. */
export const LLMS_INDEX_PROFILE_ALPHA = 'valpha';

/** Symlink to the current in-progress draft (`mdcp.v{n}--draft.llms.txt`). */
export const LLMS_INDEX_PROFILE_DEV = 'vdev';

export type LlmsIndexProfile = 'alpha' | 'dev';

const LLMS_INDEX_PROFILES = new Set<LlmsIndexProfile>(['alpha', 'dev']);

/** Parse CLI/config profile; rejects legacy `stable` and unknown values. */
export function parseLlmsIndexProfile(value: string | undefined): LlmsIndexProfile {
  if (!value || value === 'dev') return 'dev';
  if (value === 'alpha') return 'alpha';
  if (value === 'stable') {
    throw new Error(
      'fetch profile "stable" was renamed to "alpha" (valpha symlink); use --fetch-profile alpha',
    );
  }
  throw new Error(`Unknown fetch profile "${value}" — expected alpha or dev`);
}

export function isLlmsIndexProfile(value: string): value is LlmsIndexProfile {
  return LLMS_INDEX_PROFILES.has(value as LlmsIndexProfile);
}

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
  const name = profile === 'alpha' ? LLMS_INDEX_PROFILE_ALPHA : LLMS_INDEX_PROFILE_DEV;
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
  if (profileOrPath === 'alpha' || profileOrPath === 'dev') {
    return resolve(repoRoot, resolveLlmsIndexProfilePath(profileOrPath));
  }
  return resolve(repoRoot, profileOrPath.replace(/^\//, ''));
}
