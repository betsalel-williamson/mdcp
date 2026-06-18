import { describe, expect, it } from 'vitest';
import {
  abbreviateProtocolVersion,
  expandProtocolVersion,
  parseLlmsIndexFilename,
  isLlmsIndexDraftFilename,
  protocolVersionToReleaseRef,
} from '../src/export/protocol-version.js';

describe('protocol version helpers', () => {
  it('abbreviates trailing zeros', () => {
    expect(abbreviateProtocolVersion('1.0.0.0')).toBe('1');
    expect(abbreviateProtocolVersion('0.4.0.0')).toBe('0.4');
    expect(abbreviateProtocolVersion('1.2.0.0')).toBe('1.2');
    expect(abbreviateProtocolVersion('1.2.3.4')).toBe('1.2.3.4');
  });

  it('expands to four parts', () => {
    expect(expandProtocolVersion('1')).toBe('1.0.0.0');
    expect(expandProtocolVersion('0.4')).toBe('0.4.0.0');
    expect(expandProtocolVersion('1.2')).toBe('1.2.0.0');
  });

  it('parses llms index filenames', () => {
    expect(parseLlmsIndexFilename('mdcp.v1.llms.txt')).toBe('1.0.0.0');
    expect(parseLlmsIndexFilename('mdcp.v0.4.llms.txt')).toBe('0.4.0.0');
    expect(parseLlmsIndexFilename('mdcp.v1.0.0.0.llms.txt')).toBe('1.0.0.0');
    expect(parseLlmsIndexFilename('mdcp.v1.2.llms.txt')).toBe('1.2.0.0');
    expect(parseLlmsIndexFilename('mdcp.v0.4--draft.llms.txt')).toBe('0.4.0.0');
    expect(parseLlmsIndexFilename('mdcp.v1--draft.llms.txt')).toBe('1.0.0.0');
    expect(parseLlmsIndexFilename('llms.txt')).toBeNull();
  });

  it('detects draft filenames', () => {
    expect(isLlmsIndexDraftFilename('mdcp.v0.4--draft.llms.txt')).toBe(true);
    expect(isLlmsIndexDraftFilename('mdcp.v1--draft.llms.txt')).toBe(true);
    expect(isLlmsIndexDraftFilename('mdcp.v0.4.llms.txt')).toBe(false);
  });

  it('maps protocol version to npm release ref', () => {
    expect(protocolVersionToReleaseRef('0.4.0.0')).toBe('v0.4.0');
    expect(protocolVersionToReleaseRef('1.0.0.0')).toBe('v1.0.0');
  });
});
