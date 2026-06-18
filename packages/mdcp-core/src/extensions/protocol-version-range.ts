import semver from 'semver';
import { expandProtocolVersion } from '../export/protocol-version.js';

/** True when the string uses npm semver range operators (not a bare version). */
export function isSemverRangeSyntax(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === '*' || trimmed === 'x' || trimmed === 'X') return true;
  return /^[\^~><=]/.test(trimmed) || trimmed.includes(' - ') || trimmed.includes('||');
}

/**
 * Map MDCP four-part protocol version to npm semver for range evaluation.
 * The build/revision segment (fourth part) becomes a semver prerelease tag (`M.m.p-b`).
 */
export function protocolVersionToSemver(version: string): string {
  const [major, minor, patch, build] = expandProtocolVersion(version).split('.').map(Number);
  return `${major}.${minor}.${patch}-${build}`;
}

/** Rewrite MDCP version tokens inside a range string to normalized semver operands. */
export function normalizeProtocolVersionRange(range: string): string {
  const trimmed = range.trim();
  if (semver.validRange(trimmed, { includePrerelease: true })) {
    return trimmed;
  }

  return trimmed.replace(/\d+(?:\.\d+){1,3}(?!\.x)/gi, (token) => protocolVersionToSemver(token));
}

/** Whether a consumer protocol version satisfies an npm semver range. */
export function protocolSatisfiesRange(protocolVersion: string, range: string): boolean {
  const trimmed = range.trim();
  const normalizedRange = normalizeProtocolVersionRange(trimmed);
  if (!semver.validRange(normalizedRange, { includePrerelease: true })) {
    throw new Error(`Invalid protocol version range: ${range}`);
  }
  const semverVersion = protocolVersionToSemver(protocolVersion);
  return semver.satisfies(semverVersion, normalizedRange, { includePrerelease: true });
}

/** Compare extension semver versions (newest first when used with sort). */
export function compareExtensionVersion(a: string, b: string): number {
  return semver.rcompare(a, b, true);
}
