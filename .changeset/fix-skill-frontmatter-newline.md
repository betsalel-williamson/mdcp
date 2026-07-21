---
'@bwilliamson/mdcp-cli': patch
---

Fix Agent Skill YAML frontmatter corrupted by release version sync (`---name:`), which broke `npx skills add`. Require `pnpm skill:validate` after version sync in `release:tag` and again in the release workflow before npm publish.
