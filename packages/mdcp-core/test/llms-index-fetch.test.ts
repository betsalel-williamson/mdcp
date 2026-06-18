import { describe, expect, it, vi } from 'vitest';
import {
  buildGithubRawUrl,
  fetchLlmsIndexFromUpstream,
  parseLlmsIndexHeader,
  resolveLlmsIndexFetchOptions,
  resolveUpstreamPath,
} from '../src/export/llms-index-fetch.js';
import { MdcpConfigSchema } from '../src/config/schema.js';
import { LLMS_INDEX_PROFILE_DEV, LLMS_INDEX_SPEC_DIR } from '../src/export/llms-index-artifacts.js';

const SAMPLE_INDEX = `mdcp-llms-index: 1.0.0.0

# MDCP agent index (v1)

## What MDCP is
`;

function mockFetch(handler: (url: string) => Promise<Response>): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return handler(url);
  }) as typeof fetch;
}

describe('llms-index fetch', () => {
  it('parses mdcp-llms-index header', () => {
    expect(parseLlmsIndexHeader(SAMPLE_INDEX)).toBe('1.0.0.0');
    expect(parseLlmsIndexHeader('# no header\n')).toBeNull();
  });

  it('builds GitHub raw URL', () => {
    expect(buildGithubRawUrl('owner/repo', 'main', 'spec/llms-index/vstable')).toBe(
      'https://raw.githubusercontent.com/owner/repo/main/spec/llms-index/vstable',
    );
  });

  it('resolves default upstream path to vstable profile', () => {
    expect(resolveUpstreamPath({})).toBe(`${LLMS_INDEX_SPEC_DIR}/vstable`);
    expect(resolveUpstreamPath({ profile: 'dev' })).toBe(
      `${LLMS_INDEX_SPEC_DIR}/${LLMS_INDEX_PROFILE_DEV}`,
    );
    expect(resolveUpstreamPath({ path: 'custom/bootstrap.txt' })).toBe('custom/bootstrap.txt');
  });

  it('merges config upstream with CLI overrides', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      export: {
        llmsIndex: {
          upstream: { repo: 'org/mdcp', ref: 'v1.0.0', profile: 'stable' },
        },
      },
    });
    expect(resolveLlmsIndexFetchOptions(config)).toEqual({
      repo: 'org/mdcp',
      ref: 'v1.0.0',
      path: undefined,
      profile: 'stable',
      protocolVersion: '1.0.0.0',
    });
    expect(
      resolveLlmsIndexFetchOptions(config, { ref: 'main', repo: 'fork/mdcp', profile: 'dev' }),
    ).toEqual({
      repo: 'fork/mdcp',
      ref: 'main',
      path: undefined,
      profile: 'dev',
      protocolVersion: '1.0.0.0',
    });
  });

  it('fetches from upstream ref via vstable path', async () => {
    const fetchMock = mockFetch(async (url) => {
      if (url.includes('/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'v1.0.0' }), { status: 200 });
      }
      expect(url).toBe(
        'https://raw.githubusercontent.com/betsalel-williamson/mdcp/v1.0.0/spec/llms-index/vstable',
      );
      return new Response(SAMPLE_INDEX, { status: 200 });
    });

    const result = await fetchLlmsIndexFromUpstream({
      ref: 'v1.0.0',
      profile: 'stable',
      fetch: fetchMock,
    });
    expect(result.protocolVersion).toBe('1.0.0.0');
    expect(result.ref).toBe('v1.0.0');
    expect(result.text).toContain('## What MDCP is');
  });

  it('resolves latest to newest release tag', async () => {
    const fetchMock = mockFetch(async (url) => {
      if (url.includes('/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'v1.0.0' }), { status: 200 });
      }
      return new Response(SAMPLE_INDEX, { status: 200 });
    });

    const result = await fetchLlmsIndexFromUpstream({ ref: 'latest', fetch: fetchMock });
    expect(result.ref).toBe('v1.0.0');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/betsalel-williamson/mdcp/releases/latest',
      expect.any(Object),
    );
  });
});
