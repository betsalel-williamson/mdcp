export const SKILLS_SOURCE = 'betsalel-williamson/mdcp';
export const OIDC_AUDIENCE = 'mdcp-skills-audit-proxy';

export const IN_FLIGHT_TITLE = 'Security audit trail: betsalel-williamson/mdcp skills';
export const IN_FLIGHT_LABELS = ['priority:P1', 'skill-security'] as const;
export const URGENT_LABELS = ['priority:P0', 'skill-security'] as const;

export const BODY_MARKER = '<!-- skill-security-audit: betsalel-williamson/mdcp -->';
export const URGENT_MARKER_PREFIX = '<!-- skill-security-audit-urgent:';

export const DEFAULT_ACCEPTED_LOG_PATH = 'security/skills-audit-accepted.yaml';

export const RELEASE_WINDOW_MIN_MS = 20 * 60 * 60 * 1000;
export const RELEASE_WINDOW_MAX_MS = 28 * 60 * 60 * 1000;

export const SKILLS_SH_PAGE = `https://skills.sh/${SKILLS_SOURCE}`;
