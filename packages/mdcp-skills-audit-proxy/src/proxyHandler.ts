import type { VercelRequest, VercelResponse } from '@vercel/node';
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

  try {
    await verifyGitHubActionsOidc(req.headers.authorization);
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
