import { describe, it, expect, beforeAll } from 'vitest';
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
  type CryptoKey,
  type JWTVerifyGetKey,
} from 'jose';
import { verifyGitHubActionsOidc } from '../src/auth.js';
import { ALLOWED_REPOSITORY, OIDC_AUDIENCE } from '../src/config.js';

const GITHUB_OIDC_ISSUER = 'https://token.actions.githubusercontent.com';

describe('verifyGitHubActionsOidc', () => {
  let privateKey: CryptoKey;
  let jwks: JWTVerifyGetKey;

  beforeAll(async () => {
    const { publicKey, privateKey: pk } = await generateKeyPair('RS256');
    privateKey = pk;
    const jwk = await exportJWK(publicKey);
    jwk.alg = 'RS256';
    jwk.kid = 'test-key';
    jwks = createLocalJWKSet({ keys: [jwk] });
  });

  async function signToken(repository: string): Promise<string> {
    return new SignJWT({ repository })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setIssuer(GITHUB_OIDC_ISSUER)
      .setAudience(OIDC_AUDIENCE)
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);
  }

  it('returns 401 when Authorization header is missing', async () => {
    await expect(verifyGitHubActionsOidc(undefined, { jwks })).rejects.toMatchObject({
      status: 401,
    });
    await expect(verifyGitHubActionsOidc(null, { jwks })).rejects.toMatchObject({
      status: 401,
    });
    await expect(verifyGitHubActionsOidc('', { jwks })).rejects.toMatchObject({
      status: 401,
    });
  });

  it('returns 403 when repository claim is not allowlisted', async () => {
    const token = await signToken('evil/other-repo');
    await expect(verifyGitHubActionsOidc(`Bearer ${token}`, { jwks })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('returns payload when token is valid for the allowlisted repository', async () => {
    const token = await signToken(ALLOWED_REPOSITORY);
    const payload = await verifyGitHubActionsOidc(`Bearer ${token}`, { jwks });
    expect(payload.repository).toBe(ALLOWED_REPOSITORY);
  });
});
