import type { VercelRequest, VercelResponse } from '../../src/vercelTypes.js';
import { handleAuthenticatedProxy, SKILL_SLUG_PATTERN } from '../../src/proxyHandler.js';
import { fetchSkillAudit } from '../../src/skillsSh.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const skill = req.query.skill;
  const skillSlug = Array.isArray(skill) ? skill[0] : skill;

  if (!skillSlug || !SKILL_SLUG_PATTERN.test(skillSlug)) {
    res.status(400).json({ error: 'invalid_skill', message: 'Invalid skill slug' });
    return;
  }

  await handleAuthenticatedProxy(req, res, () => fetchSkillAudit(skillSlug));
}
