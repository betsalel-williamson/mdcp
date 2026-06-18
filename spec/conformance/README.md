# Conformance vectors

Machine-checkable fixtures for MDCP protocol artifacts. Parent: [GitHub #49](https://github.com/betsalel-williamson/mdcp/issues/49).

## Running

```bash
pnpm test packages/mdcp-core/test/llms-index.test.ts
pnpm test packages/mdcp-core/test/llms-index-fetch.test.ts
pnpm test packages/mdcp-core/test/protocol-version.test.ts
```

## Vectors

| Vector          | Path                                 | Profile                              |
| --------------- | ------------------------------------ | ------------------------------------ |
| llms-index-v0.4 | [llms-index-v0.4/](llms-index-v0.4/) | llms-index export (protocol 0.4.0.0) |

## llms-index artifacts

Canonical files: [spec/llms-index/](../llms-index/).

| File pattern                | Role                                           |
| --------------------------- | ---------------------------------------------- |
| `mdcp.v{n}.llms.txt`        | Adopted stable (immutable after release)       |
| `mdcp.v{n}--draft.llms.txt` | In progress until adopted                      |
| `valpha`                    | Symlink → current open-alpha file              |
| `vdev`                      | Symlink → current draft                        |
| `vstable`                   | Reserved for npm 1.0.0 (not used in 0.4 alpha) |

Filename equivalence (trailing `.0` omitted):

- `mdcp.v0.4.llms.txt`
- `mdcp.v0.4.0.0.llms.txt`

The in-file header always uses the full four-part version: `mdcp-llms-index: 0.4.0.0`.
