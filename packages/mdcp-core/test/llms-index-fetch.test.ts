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

const SAMPLE_INDEX = `mdcp-llms-index: 0.4.0.0

# Sharded docs agent index (v0.4)

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
    expect(parseLlmsIndexHeader(SAMPLE_INDEX)).toBe('0.4.0.0');
    expect(parseLlmsIndexHeader('# no header\n')).toBeNull();
  });

  it('builds GitHub raw URL', () => {
    expect(buildGithubRawUrl('owner/repo', 'main', 'spec/llms-index/valpha')).toBe(
      'https://raw.githubusercontent.com/owner/repo/main/spec/llms-index/valpha',
    );
  });

  it('resolves default upstream path to vdev profile', () => {
    expect(resolveUpstreamPath({})).toBe(`${LLMS_INDEX_SPEC_DIR}/${LLMS_INDEX_PROFILE_DEV}`);
    expect(resolveUpstreamPath({ profile: 'alpha' })).toBe(`${LLMS_INDEX_SPEC_DIR}/valpha`);
    expect(resolveUpstreamPath({ profile: 'dev' })).toBe(
      `${LLMS_INDEX_SPEC_DIR}/${LLMS_INDEX_PROFILE_DEV}`,
    );
    expect(resolveUpstreamPath({ path: 'custom/bootstrap.txt' })).toBe('custom/bootstrap.txt');
  });

  it('rejects legacy stable fetch profile', () => {
    expect(() => resolveUpstreamPath({ profile: 'stable' as 'dev' })).toThrow(/renamed to "alpha"/);
  });

  it('merges config upstream with CLI overrides', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocol: {
        repo: 'org/mdcp',
        ref: 'v0.4.0',
        profile: 'alpha',
      },
    });
    expect(resolveLlmsIndexFetchOptions(config)).toEqual({
      repo: 'org/mdcp',
      ref: 'v0.4.0',
      path: undefined,
      profile: 'alpha',
      protocolVersion: '0.4.0.0',
    });
    expect(
      resolveLlmsIndexFetchOptions(config, { ref: 'main', repo: 'fork/mdcp', profile: 'dev' }),
    ).toEqual({
      repo: 'fork/mdcp',
      ref: 'main',
      path: undefined,
      profile: 'dev',
      protocolVersion: '0.4.0.0',
    });
  });

  it('fetches from upstream ref via valpha path', async () => {
    const fetchMock = mockFetch(async (url) => {
      if (url.includes('/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'v0.4.0' }), { status: 200 });
      }
      expect(url).toBe(
        'https://raw.githubusercontent.com/betsalel-williamson/mdcp/v0.4.0/spec/llms-index/valpha',
      );
      return new Response(SAMPLE_INDEX, { status: 200 });
    });

    const result = await fetchLlmsIndexFromUpstream({
      ref: 'v0.4.0',
      profile: 'alpha',
      fetch: fetchMock,
    });
    expect(result.protocolVersion).toBe('0.4.0.0');
    expect(result.ref).toBe('v0.4.0');
    expect(result.text).toContain('## What MDCP is');
  });

  it('resolves latest to newest release tag', async () => {
    const fetchMock = mockFetch(async (url) => {
      if (url.includes('/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'v0.4.0' }), { status: 200 });
      }
      return new Response(SAMPLE_INDEX, { status: 200 });
    });

    const result = await fetchLlmsIndexFromUpstream({ ref: 'latest', fetch: fetchMock });
    expect(result.ref).toBe('v0.4.0');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/betsalel-williamson/mdcp/releases/latest',
      expect.any(Object),
    );
  });
});
