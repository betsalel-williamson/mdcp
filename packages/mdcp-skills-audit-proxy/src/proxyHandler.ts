import type { VercelRequest, VercelResponse } from './vercelTypes.js';
import { hasAuthStatus, verifyGitHubActionsOidc } from './auth.js';
import type { ProxyPayload } from './skillsSh.js';

export async function handleAuthenticatedProxy(
  req: VercelRequest,
  res: VercelResponse,
  forward: () => Promise<ProxyPayload>,
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed', message: 'Only GET is supported' });
    return;
  }

  const authorization = req.headers.authorization;
  if (Array.isArray(authorization)) {
    res.status(401).json({
      error: 'unauthorized',
      message: 'Missing or invalid Authorization header',
    });
    return;
  }

  try {
    await verifyGitHubActionsOidc(authorization);
  } catch (error) {
    if (hasAuthStatus(error)) {
      res.status(error.status).json({ error: 'unauthorized', message: error.message });
      return;
    }
    throw error;
  }

  const payload = await forward();
  if (payload.headers) {
    for (const [name, value] of Object.entries(payload.headers)) {
      res.setHeader(name, value);
    }
  }
  res.status(payload.status).json(payload.body);
}

export const SKILL_SLUG_PATTERN = /^[a-zA-Z0-9._-]+$/;
