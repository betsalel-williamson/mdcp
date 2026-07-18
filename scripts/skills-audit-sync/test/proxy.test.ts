import { describe, it, expect, vi } from 'vitest';
import { getActionsOidcToken, assertProxyAuthorized } from '../src/proxy.js';
import { ProxyAuthError } from '../src/proxy.js';

describe('getActionsOidcToken', () => {
  it('requests token with audience query param', async () => {
    const fetchFn = vi.fn(async (url: string | URL | Request) => {
      expect(String(url)).toContain('audience=mdcp-skills-audit-proxy');
      return new Response(JSON.stringify({ value: 'jwt-token' }), { status: 200 });
    });

    const originalUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
    const originalToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL = 'https://github.example/token';
    process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN = 'req-token';

    try {
      await expect(getActionsOidcToken('mdcp-skills-audit-proxy', fetchFn)).resolves.toBe(
        'jwt-token',
      );
      expect(fetchFn).toHaveBeenCalledOnce();
    } finally {
      process.env.ACTIONS_ID_TOKEN_REQUEST_URL = originalUrl;
      process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN = originalToken;
    }
  });
});

describe('assertProxyAuthorized', () => {
  it('throws on 401/403', () => {
    expect(() => assertProxyAuthorized({ status: 401, body: {}, headers: new Headers() })).toThrow(
      ProxyAuthError,
    );
  });
});
