import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey, type JWTPayload } from 'jose';
import { ALLOWED_REPOSITORY, OIDC_AUDIENCE } from './config.js';

const GITHUB_OIDC_ISSUER = 'https://token.actions.githubusercontent.com';
const GITHUB_OIDC_JWKS_URL = new URL(`${GITHUB_OIDC_ISSUER}/.well-known/jwks`);

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

  const jwks = options?.jwks ?? createRemoteJWKSet(GITHUB_OIDC_JWKS_URL);

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
