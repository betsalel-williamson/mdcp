# ADR 0004: Public-first skills.sh audit sync (MVP A)

- **Status:** Accepted
- **Date:** 2026-07-18
- **Tracking:** [#153](https://github.com/betsalel-williamson/mdcp/issues/153)

## Context

MDCP publishes Agent Skills to [skills.sh](https://www.skills.sh/betsalel-williamson/mdcp). Partners (Gen Agent Trust Hub, Socket, Snyk, and others) publish security audits on each skill. Those findings are visible on skills.sh pages but have no durable trail in this repository for fix-or-accept-risk decisions.

Public skills.sh audits are the source of truth for install-time reputation and trust. Reducing those published risks improves product value: lower risk, easier install confidence, and higher-quality skills with fewer wasted agent tokens.

Alternatives considered:

1. **MVP A — public-first sync** — pull published partner audits into GitHub Issues; treat skills.sh as the trust source of truth.
2. **Vercel-owned sync** — cron and issue writes entirely on Vercel (requires long-lived GitHub credentials on the proxy host).
3. **Native CI scanners only** — rely on in-repo scanners (for example `snyk-agent-scan`) without syncing public audits.

Approach 2 adds secrets and ops on the Hobby proxy beyond an auth gate. Approach 3 is a useful pre-publish lead indicator but does not match what the public sees on skills.sh.

## Decision

Adopt **MVP A**: sync published skills.sh audit results into this repository as the first delivery track.

- Source of truth for reputation: the public skills.sh audit API and pages.
- Delivery tracker: in-flight GitHub Issue + committed accepted-risks log + high-urgency Issues (see [ADR 0006](./0006-project-skill-security-audit-issue.md)).
- Access path: thin monorepo Vercel proxy with zero-trust OIDC (see [ADR 0005](./0005-skills-audit-oidc-proxy.md)).
- Skill set: only skills published under source `betsalel-williamson/mdcp` on skills.sh (discover via owner search through the proxy), not every on-disk `skills/` folder.

Explicit non-goals for this MVP:

- Native CI skill scanners as a substitute for public audits
- Blocking GitHub Release / npm publish until skills.sh audits are ready
- Scraping partner HTML detail pages for fine-grained finding IDs
- Trackers other than GitHub Issues
- Paid Vercel or paid skills.sh API tiers

## Consequences

- Maintainers triage public audit findings via an in-flight Issue and a committed accepted-risks log, rather than only from skills.sh UI.
- Native CI scanners remain a later dual-track option (`source:ci` vs `source:skills.sh`), not a prerequisite to ship the sync.
- Audit latency after first publish or install (minutes to about a day) is handled with retries and a post-release sync window, not a release gate.
- Implementation work is tracked on [#153](https://github.com/betsalel-williamson/mdcp/issues/153); as-built feature and developer shards land when the sync ships.
