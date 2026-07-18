import type { VercelRequest, VercelResponse } from '../src/vercelTypes.js';
import { handleAuthenticatedProxy } from '../src/proxyHandler.js';
import { listMdcpSkills } from '../src/skillsSh.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handleAuthenticatedProxy(req, res, () => listMdcpSkills());
}
