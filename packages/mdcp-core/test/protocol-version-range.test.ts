import { describe, expect, it } from 'vitest';
import {
  isProtocolCompatible,
  resolveProtocolVersionRange,
  selectCompatibleExtensionVersion,
} from '../src/extensions/catalog.js';
import {
  isSemverRangeSyntax,
  normalizeProtocolVersionRange,
  protocolSatisfiesRange,
  protocolVersionToSemver,
} from '../src/extensions/protocol-version-range.js';
import { REFERENCE_EXTENSIONS_CATALOG } from '../src/extensions/builtins.js';

describe('protocol version semver ranges', () => {
  it('normalizes four-part MDCP protocol to semver', () => {
    expect(protocolVersionToSemver('0.4.0.0')).toBe('0.4.0-0');
    expect(protocolVersionToSemver('0.4.0.5')).toBe('0.4.0-5');
    expect(protocolVersionToSemver('0.4.1.0')).toBe('0.4.1-0');
    expect(protocolVersionToSemver('0.4')).toBe('0.4.0-0');
  });

  it('matches exact pin', () => {
    expect(protocolSatisfiesRange('0.4.0.0', '0.4.0.0')).toBe(true);
    expect(protocolSatisfiesRange('0.4.0.1', '0.4.0.0')).toBe(false);
  });

  it('matches caret range across minor and build revisions', () => {
    expect(protocolSatisfiesRange('0.4.0.0', '^0.4.0.0')).toBe(true);
    expect(protocolSatisfiesRange('0.4.0.5', '^0.4.0.0')).toBe(true);
    expect(protocolSatisfiesRange('0.4.1.0', '^0.4.0.0')).toBe(true);
    expect(protocolSatisfiesRange('0.5.0.0', '^0.4.0.0')).toBe(false);
  });

  it('matches wildcard and x-range patterns', () => {
    expect(protocolSatisfiesRange('0.4.0.0', '*')).toBe(true);
    expect(protocolSatisfiesRange('9.9.9.9', '*')).toBe(true);
    expect(protocolSatisfiesRange('0.4.0.0', '0.4.x')).toBe(true);
    expect(protocolSatisfiesRange('0.4.1.0', '0.4.x')).toBe(true);
  });

  it('matches tilde range per npm semver', () => {
    expect(protocolSatisfiesRange('0.4.0.0', '~0.4.0.0')).toBe(true);
    expect(protocolSatisfiesRange('0.4.0.5', '~0.4.0.0')).toBe(true);
    expect(protocolSatisfiesRange('0.4.1.0', '~0.4.0.0')).toBe(true);
  });

  it('bounds all builds of an MDCP patch with hyphen range', () => {
    expect(protocolSatisfiesRange('0.4.0.5', '>=0.4.0.0 <0.4.1.0')).toBe(true);
    expect(protocolSatisfiesRange('0.4.1.0', '>=0.4.0.0 <0.4.1.0')).toBe(false);
  });

  it('matches hyphen bounded range', () => {
    expect(protocolSatisfiesRange('0.4.0.0', '>=0.4.0.0 <0.5.0.0')).toBe(true);
    expect(protocolSatisfiesRange('0.4.9.9', '>=0.4.0.0 <0.5.0.0')).toBe(true);
    expect(protocolSatisfiesRange('0.5.0.0', '>=0.4.0.0 <0.5.0.0')).toBe(false);
  });

  it('normalizes MDCP tokens inside range strings', () => {
    expect(normalizeProtocolVersionRange('^0.4.0.0')).toBe('^0.4.0-0');
    expect(protocolSatisfiesRange('0.4.0.0', '^0.4.0.0')).toBe(true);
  });

  it('detects semver range syntax', () => {
    expect(isSemverRangeSyntax('^0.4.0')).toBe(true);
    expect(isSemverRangeSyntax('*')).toBe(true);
    expect(isSemverRangeSyntax('0.4.0.0')).toBe(false);
  });

  it('requires protocolVersionRange on extension entries', () => {
    expect(() => resolveProtocolVersionRange({ protocolVersionRange: '' })).toThrow(
      /requires protocolVersionRange/,
    );
    expect(resolveProtocolVersionRange({ protocolVersionRange: '^0.4.0.0' })).toBe('^0.4.0-0');
    expect(isProtocolCompatible('0.4.0.5', { protocolVersionRange: '^0.4.0.0' })).toBe(true);
  });

  it('selects extension version by protocol range', () => {
    const entry = {
      id: 'demo',
      description: 'test',
      tags: ['test'],
      versions: [
        { version: '1.0.0', protocolVersionRange: '0.4.0.0', revoked: false },
        { version: '1.1.0', protocolVersionRange: '*', revoked: false },
      ],
    };
    expect(selectCompatibleExtensionVersion(entry, '0.4.0.0').version).toBe('1.1.0');
    expect(selectCompatibleExtensionVersion(entry, '0.5.0.0').version).toBe('1.1.0');
  });

  it('uses reference catalog task-prompts range', () => {
    const entry = REFERENCE_EXTENSIONS_CATALOG.extensions[0]!;
    expect(isProtocolCompatible('0.4.0.0', entry.versions[0]!)).toBe(true);
    expect(isProtocolCompatible('0.5.0.0', entry.versions[0]!)).toBe(false);
  });
});
