---
name: mdcp-arch-oss-library
description: >-
  Archetype skill for OSS libraries (npm, PyPI, crates.io). Use this skill when
  the user is building, documenting, or architecting a publishable package where
  the API truth lives in source code, and documentation shards hold intent,
  stability guarantees, and migration notes. Triggers when users mention OSS,
  libraries, packages, API references, or Javadoc-style documentation.
---

# MDCP Archetype: OSS Library

For publishable packages (npm, PyPI, crates.io) where **API truth lives in source** and documentation shards hold intent, stability guarantees, and migration notes.

## Layout

```text
docs/
  extensions/
    api-pointer-conventions.md  # how shards link into src/
  glossary/
  features/                       # design, acceptance criteria, public API promises
  client/                         # install, quick start, examples
  developer/                      # release, CONTRIBUTING, changesets
```

## Pointer shards instead of Javadoc duplication

Prefer **stable shard titles** + links to source paths over pasting signatures:

```markdown
## SessionStore

Public API: `packages/core/src/session/store.ts` — read implementation on demand.

Acceptance: sessions expire after 24h; see [feature shard](../../../features/session-store.md).
```

Agents use `mdcp refs lookup "SessionStore"` for compiled anchors and open the linked file for types and methods.

## When to shard vs when to point

| Content                                     | Location                              |
| ------------------------------------------- | ------------------------------------- |
| Why the API exists, constraints, versioning | `features/` shard                     |
| How to install and call from app code       | `client/` shard                       |
| Signatures, generics, internal helpers      | **Source files** (pointer from shard) |
| Shared terms (`Session`, `Tenant`)          | `glossary/`                           |

## Extension hooks

- Add `docs/extensions/api-pointer-conventions.md` for language-specific path rules.
- Optional formatting pack under `spec/extensions/format-*` for JavaDoc-style cross-links in compiled README output (future).
