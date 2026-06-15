# Phase spec-flow prompts (mdcp)

Short prompts for individual spec-flow phases. Fill in the code block at the top, then send. See [work-item-tracking.md](./work-item-tracking.md) for the replace pattern.

---

## User story (end-user value)

```text
FEATURE=
```

Create a user story in `.work-items/[feature]/user-story.md` using FEATURE above.
Lead with end-user value: who benefits, what problem is solved, and how success is measured.
Keep experience and outcomes here — defer API and implementation details to the design doc.

## Technical design (implementation details)

```text
FEATURE=
```

Create a technical design in `.work-items/[feature]/design.md` using FEATURE above.
Cover requirements, API contracts, data models, and edge cases.
Link to the user story for value context. When design stabilizes, add or update shards under `docs/features/`.

## Task breakdown

```text
FEATURE=
```

Create an implementation task list in `.work-items/[feature]/task.md` using FEATURE above.
Break work into atomic steps with acceptance criteria and validation gates (discover test and doc check commands from this repo's developer docs).
Reference the design doc — do not expand scope beyond what the user story justifies.

## Architecture decision

```text
FEATURE=
DECISION_QUESTION=
```

Evaluate DECISION_QUESTION above. Draft an ADR in `.work-items/[feature]/adr-[short-name].md`.
State context, options considered, decision, and consequences. When accepted, add a summary shard under `docs/features/`.
