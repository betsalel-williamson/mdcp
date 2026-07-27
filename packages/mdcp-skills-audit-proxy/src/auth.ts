import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey, type JWTPayload } from 'jose';
import { ALLOWED_REPOSITORY, OIDC_AUDIENCE } from './config.js';

const GITHUB_OIDC_ISSUER = 'https://token.actions.githubusercontent.com';
const GITHUB_OIDC_JWKS_URL = new URL(`${GITHUB_OIDC_ISSUER}/.well-known/jwks`);

/**
 * Process-scoped JWKS (jose caches keys on this instance). Reuse avoids per-request
 * RemoteJWKSet churn; see https://github.com/panva/jose/security (Remote JWKS / app lifecycle).
 */
const GITHUB_OIDC_JWKS = createRemoteJWKSet(GITHUB_OIDC_JWKS_URL);

/** GitHub Actions OIDC JWTs are typically ~1–2 KiB; cap before jwtVerify (jose leaves size limits to apps). */
export const MAX_GITHUB_OIDC_TOKEN_CHARS = 8192;

export type AuthError = Error & { status: 401 | 403 };

export type VerifyGitHubActionsOidcOptions = {
  jwks?: JWTVerifyGetKey;
};

function authError(message: string, status: 401 | 403): AuthError {
  const error = new Error(message) as AuthError;
  error.status = status;
  return error;
}

function hasAuthStatus(error: unknown): error is AuthError {
  return (
    error instanceof Error && 'status' in error && (error.status === 401 || error.status === 403)
  );
}

export async function verifyGitHubActionsOidc(
  authorizationHeader: string | undefined | null,
  options?: VerifyGitHubActionsOidcOptions,
): Promise<JWTPayload> {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw authError('Missing or invalid Authorization header', 401);
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw authError('Missing or invalid Authorization header', 401);
  }
  if (token.length > MAX_GITHUB_OIDC_TOKEN_CHARS) {
    throw authError('Authorization token too large', 401);
  }

  const jwks = options?.jwks ?? GITHUB_OIDC_JWKS;

  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, jwks, {
      issuer: GITHUB_OIDC_ISSUER,
      audience: OIDC_AUDIENCE,
    }));
  } catch {
    throw authError('Invalid or expired GitHub Actions OIDC token', 401);
  }

  const repository = payload.repository;
  if (typeof repository !== 'string' || repository !== ALLOWED_REPOSITORY) {
    throw authError(`Repository not allowed: ${String(repository ?? 'missing')}`, 403);
  }

  return payload;
}

export { hasAuthStatus };
