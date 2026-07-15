---
'@bwilliamson/mdcp-cli': patch
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-presets': patch
---

Remove the `review` task subagent (`skills/mdcp/agents/review.md`) from the MDCP Agent Skill pack.

Security/architecture review with `REVIEW_NODE` manifests, findings ledgers, and a directed review graph is not core MDCP docs-as-code (compile / check / shards). Findings also need to land in a work tracker (GitHub Issues, Jira, Linear, etc.), and MDCP CLI does not yet model review nodes or programmatic progress tracking. We will revisit a review skill or complementary pack once tracker export and systematic review-graph support exist.
