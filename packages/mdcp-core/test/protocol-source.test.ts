import { describe, expect, it } from 'vitest';
import { MdcpConfigSchema } from '../src/config/schema.js';
import {
  resolveLlmsIndexOutputFilename,
  resolveProtocolFetch,
} from '../src/config/protocol-source.js';
import { AUTHORITATIVE_PROTOCOL_REPO } from '../src/export/llms-index-fetch.js';
import { resolveLlmsIndexFetchOptions } from '../src/export/llms-index-fetch.js';
import { resolveEnabledExtensionPacks } from '../src/extensions/resolve.js';

describe('protocol fetch config', () => {
  it('uses protocol.profile and optional ref branch override', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocol: { profile: 'alpha', ref: 'feature/my-branch' },
    });
    expect(resolveProtocolFetch(config)).toEqual({
      repo: AUTHORITATIVE_PROTOCOL_REPO,
      ref: 'feature/my-branch',
      profile: 'alpha',
      path: undefined,
    });
  });

  it('defaults profile to dev and ref to main', () => {
    const config = MdcpConfigSchema.parse({ compileOrder: ['features'] });
    expect(resolveProtocolFetch(config).profile).toBe('dev');
    expect(resolveProtocolFetch(config).ref).toBe('main');
  });

  it('reads legacy protocol.fetch', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocol: { fetch: { ref: 'v0.4.0', profile: 'alpha' } },
    });
    expect(resolveProtocolFetch(config).ref).toBe('v0.4.0');
    expect(resolveProtocolFetch(config).profile).toBe('alpha');
  });

  it('prefers flat protocol.profile over legacy fetch', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocol: { profile: 'dev', ref: 'feature/new', fetch: { ref: 'old', profile: 'alpha' } },
    });
    expect(resolveProtocolFetch(config).ref).toBe('feature/new');
    expect(resolveProtocolFetch(config).profile).toBe('dev');
  });

  it('passes profile to llms-index fetch options', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocol: { profile: 'alpha', ref: 'feature/dogfood' },
    });
    expect(resolveLlmsIndexFetchOptions(config)).toMatchObject({
      profile: 'alpha',
      ref: 'feature/dogfood',
    });
  });

  it('uses protocol ref for extension pack default source', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocol: { profile: 'alpha', ref: 'feature/dogfood' },
      extensions: { packs: [{ id: 'prompts-mdcp-defaults', enabled: true }] },
    });
    const packs = resolveEnabledExtensionPacks(config);
    expect(packs[0]!.source.ref).toBe('feature/dogfood');
  });

  it('reads llms-index outputFile from protocol.llmsIndex', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocol: { profile: 'dev', llmsIndex: { outputFile: 'custom.llms.txt' } },
    });
    expect(resolveLlmsIndexOutputFilename(config)).toBe('custom.llms.txt');
  });
});
