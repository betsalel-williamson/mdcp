# Extension fetch security

Extension packs — especially **prompts** — are loaded into agent context. Fetching from untrusted repos or URLs is a **prompt-injection vector**: malicious pack content can steer agents away from your shards, exfiltrate secrets, or bypass review gates.

## Authoritative default

Open alpha defaults fetch from a single authoritative upstream:

| Field   | Default                                                         |
| ------- | --------------------------------------------------------------- |
| Repo    | `betsalel-williamson/mdcp`                                      |
| Profile | `dev` (draft) or `alpha` (open-alpha symlink)                   |
| Ref     | Release tag (e.g. `v0.4.0`) or maintainer branch during dogfood |

Configure once in `mdcp.config.json`:

```json
{
  "protocol": {
    "profile": "alpha",
    "ref": "v0.4.0"
  },
  "extensions": {
    "packs": [{ "id": "prompts-mdcp-defaults", "enabled": true, "version": "0.4.0.0" }]
  }
}
```

`protocol.profile` selects the llms-index symlink (`alpha` → `valpha`, `dev` → `vdev`). `protocol.ref` is the git branch or tag when the symlink is not on `main` yet (dogfood). Omit `ref` for `main` or release tags. Protocol version is validated from the fetched llms-index header — no separate pin needed unless you override the root default.

## Per-pack overrides

Individual packs **MAY** set their own `extensions.packs[].source` (`repo`, `ref`, or `baseUrl`). Use this only for:

- Forks you control and have reviewed
- Internal mirrors of a vetted pack version

**Do not** point default prompt packs at unknown third-party repos without review.

## In-pack external references

Even when fetch source is trusted, **links inside pack files** can pull **secondary content** into agent context that the pack publisher did not ship or review:

- **External URLs** (`https://…`) — agents may fetch or summarize remote pages with instructions outside your review gate.
- **Escaping relative links** (`../docs/…`, `../../spec/…`) — resolve to paths that do not exist in consumer caches, or to monorepo-only files consumers never fetched.
- **Upstream path prose** — references like `spec/extensions/…` or "in the mdcp repo" assume a layout consumer repos do not have.

**Goal:** self-contained, safe prompts that reduce **prompt-poisoning** risk. A publisher vouches for the bytes in `manifest.files[]` only — not for linked or implied secondary content.

| Mitigation          | Behavior                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Self-containment    | Default packs (e.g. `prompts-mdcp-defaults`) ship with zero external references.                                                               |
| Fetch-time flagging | `mdcp export --llms-index --fetch` scans pack files; cached `manifest.json` records `selfContained` and `externalReferences[]`.                |
| CLI warning         | When `externalReferences` is non-empty, mdcp prints a stderr warning so maintainers know unreviewed secondary content may enter agent context. |
| Revocation          | Compromised pack content → `revoked: true` on catalog and per-version manifest (see [Revocation](#revocation)).                                |

Normative layout rules: [FORMAT.md — Self-containment](./FORMAT.md#self-containment).

## Threat model

| Risk                                     | Mitigation (today)                                                                                                         | Planned                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Prompt injection in fetched `.prompt.md` | Catalog `revoked` flag; pin pack `version`; review before enabling custom `source`; fetch-time external-reference warnings | Automated content scanning                              |
| Arbitrary repo / URL fetch               | Documented warning; defaults to authoritative repo                                                                         | **Allowlist** in config (`extensions.trustedSources[]`) |
| Typosquat extension ids                  | Catalog in `spec/extensions/manifest.json`                                                                                 | Signature verification                                  |
| Compromised upstream branch              | Pin `ref` to release tags in production; branch pins for dogfood only                                                      | Immutable release attestations                          |

## Future: trusted-source allowlist

Planned config shape (not implemented in 0.4 alpha):

```json
{
  "extensions": {
    "trustedSources": [
      { "repo": "betsalel-williamson/mdcp" },
      { "repo": "my-org/mdcp-fork", "ref": "v0.4.0" }
    ]
  }
}
```

Fetch **SHOULD** reject pack `source` values outside the allowlist unless the user explicitly opts in (e.g. `--allow-untrusted-extensions`). Default installs ship with only `betsalel-williamson/mdcp` trusted.

Fork workflows: mirror or fork the pack, review content, add your fork to `trustedSources`, then reference it in per-pack `source`.

## Revocation

When prompt injection or other compromise is discovered:

1. Set `revoked: true` and `revokedReason` on the catalog entry and per-version manifest.
2. Publish a fixed pack version.
3. Consumers re-fetch with a pinned non-revoked `version`.

See [FORMAT.md](./FORMAT.md#revocation).

## Related

- [Extension pack format](./FORMAT.md)
- [Extensions and archetypes](../../docs/features/protocol/extensions-and-archetypes.md)
