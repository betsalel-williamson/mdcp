# Atomic commit groups

Numbered plan sections that split multi-concern work into one-concern git commits. Each group lists an id/name, one concern, the exact files, and an intended conventional commit subject. After plan approval, agents implement and `git commit` one group at a time instead of squashing unrelated concerns.

Part of parent `mdcp` [QA Principles](../features/agent-skill.md#quality-assurance-qa-principles). Day-to-day helpers require the section in plan / Step 1 ([Helper Skills](../features/protocol/agent-task-prompts.md)). Plans that include Atomic commit groups also **MUST** name the intended short-lived feature branch and link `WORK_ITEM` before waiting for human review / “go” ([Branch before edit](../features/protocol/agent-task-prompts.md#branch-before-edit-plan--session-obligation)). This repo’s delivery conventions: [Agent work-item tracking](../developer/agent-work-item-tracking.md).
