## Add to #49

Conformance vector landed: [spec/conformance/llms-index-v1/](spec/conformance/llms-index-v1/)

Tests in `packages/mdcp-core/test/protocol-version.test.ts` and `llms-index.test.ts` verify:

- `mdcp.v1.llms.txt` ≡ `1.0.0.0`
- `mdcp.v1.0.0.0.llms.txt` ≡ `1.0.0.0`
- Required header and sections in `buildLlmsIndex` output

Follow-up: dedicated `mdcp conformance` runner subcommand.
