# API — Export, shard, and peers

## Export

There is no token-strip LLM export API. Prefer the Agent Skill and one-shard reads.

## Shard (split)

| Export                           | Purpose                                 |
| -------------------------------- | --------------------------------------- |
| `shardFromMonolith`, `runMdTree` | Split a monolith into guide directories |

## Peer tools

| Export                      | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `findPeerBinary`, `runPeer` | Locate and run host-repo linters (`markdownlint-cli2`, `vale`, …) |

Peer linters are not bundled. Detection order: `node_modules/.bin` → PATH → skip with info.
