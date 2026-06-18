import { resolve } from 'node:path';
import type { MdcpConfig } from '../config/schema.js';
import { abbreviateProtocolVersion } from './protocol-version.js';
import {
  defaultLlmsIndexFilename,
  LLMS_INDEX_PROFILE_DEV,
  LLMS_INDEX_PROFILE_STABLE,
  LLMS_INDEX_PROTOCOL_VERSION,
  LLMS_INDEX_SPEC_DIR,
} from './llms-index-artifacts.js';

export { defaultLlmsIndexFilename, LLMS_INDEX_PROTOCOL_VERSION } from './llms-index-artifacts.js';

export interface LlmsIndexOptions {
  /** Path to mdcp.config.json relative to repo root or invocation dir. */
  configPath?: string;
  /** npm scripts block (name → command) to list when present. */
  scripts?: Record<string, string>;
}

const STATIC_SECTIONS = `## What MDCP is

**MarkDown Context Protocol** — a protocol for repository documentation context. Shards are the **source of truth**; compiled monoliths and publish outputs are **generated**. Documentation carries context and the high-level plan; code carries implementation detail.

## Adoption path

1. **Copy this file** into your docs root, fetch the canonical spec artifact (\`mdcp export --llms-index --fetch\`), or generate with \`mdcp export --llms-index\` after config exists. **Do not hand-edit** the fetched \`mdcp.v*.llms.txt\` for repo-specific content — use \`docs/extensions/\` and your shards instead.
2. **Start a glossary** under \`docs/glossary/\` — define domain terms and disambiguate legacy names before feature shards.
3. **Shard your docs** — one topic per \`.md\` file; list shards in each guide's \`index.md\` or \`shards.md\`.
4. **Add \`mdcp.config.json\`** — set \`compileOrder\`, per-guide \`compile.outputFile\` when publishing READMEs.
5. **Compile and validate** — \`mdcp compile\` then \`mdcp check\`.
6. **Query on demand** — use the commands below; do not dump entire guides into agent context.

Bootstrap without tooling: split an existing monolith manually or with \`mdcp shard\` when a \`source\` monolith is configured.

## Repo layout (template)

\`\`\`text
docs/
  mdcp.v1.llms.txt          # this file (agent entrypoint)
  mdcp.config.json          # wiring (after adoption)
  glossary/                 # shared terms (start here)
    index.md                # master index
    index-*.md              # optional sub-indexes (group N terms each)
    *.md                    # one term per shard
  features/                 # capabilities, design, acceptance criteria
    index.md
    *.md                      # shards
  client/                   # end-user value (optional)
  developer/                # repo workflow (optional)
\`\`\`

## Query instructions (prefer smallest context)

When \`mdcp\` is installed and configured:

1. **Section lookup** (smallest useful unit):
   \`\`\`bash
   mdcp refs lookup "<topic>" --format json --config <config> --docs-root <docs-root>
   \`\`\`
2. **Read one shard** — open the \`.md\` path from lookup or manifest; do not read whole monoliths.
3. **Broader context** (last resort):
   \`\`\`bash
   mdcp export --llm --stdout --config <config> --docs-root <docs-root>
   \`\`\`
4. **Regenerate or refresh this index** after config changes:
   \`\`\`bash
   mdcp export --llms-index --config <config> --docs-root <docs-root>
   \`\`\`
   Pin immutable protocol bootstrap from the mdcp spec directory (day zero, no config required):
   \`\`\`bash
   mdcp export --llms-index --fetch --fetch-profile stable --docs-root <docs-root>
   mdcp export --llms-index --fetch --fetch-profile dev --docs-root <docs-root>
   mdcp export --llms-index --fetch --fetch-ref v1.0.0 --fetch-profile stable --docs-root <docs-root>
   \`\`\`
   Override upstream repo during protocol development:
   \`\`\`bash
   mdcp export --llms-index --fetch --fetch-repo owner/fork --fetch-ref my-branch --fetch-profile dev --docs-root <docs-root>
   \`\`\`
   Canonical artifacts live in the mdcp repository at \`${LLMS_INDEX_SPEC_DIR}/\` — adopted \`mdcp.v{n}.llms.txt\`, in-progress \`mdcp.v{n}--draft.llms.txt\`, symlinks \`${LLMS_INDEX_PROFILE_STABLE}\` (stable) and \`${LLMS_INDEX_PROFILE_DEV}\` (draft).

## Glossary

Maintain \`docs/glossary/\` for acronyms and domain vocabulary — one term per \`.md\` shard, grouped by \`index.md\` and optional sub-indexes (\`index-protocol.md\`, \`index-format.md\`, etc.). Link \`../glossary/index.md\` from each guide manifest; transitive manifest links pull term shards into compile output. When the same term means different things in legacy systems, add a disambiguation entry and link from feature shards on first use.

## Validation

Run \`mdcp check\` before trusting compiled output. Shards and manifest are authoritative — do not hand-edit generated compile output.

## Agent task prompts

Task-type prompts in \`examples/prompts/\` are part of the MDCP 1.0 authoring profile (normative table in \`docs/features/protocol/agent-task-prompts.md\`). Each **MUST** set \`WORK_ITEM\` and \`WORK_ITEM_LOOKUP\` before sending. Review work **MUST** use \`review-task.prompt.md\` and **MAY** set \`REVIEW_NODE=\` in the Replace block.

| Task | Prompt |
| ---- | ------ |
| Bootstrap pipeline | \`getting-started-with-mdcp.prompt.md\` |
| Feature (docs + code) | \`feature-level-task.prompt.md\` |
| Documentation only | \`doc-only-task.prompt.md\` |
| Architecture / ADR | \`design-architecture-task.prompt.md\` |
| End-user UX | \`ux-task.prompt.md\` |
| Architecture / security review | \`review-task.prompt.md\` |

Workflow: read this index → load \`WORK_ITEM\` via lookup shard → edit \`features/\`, \`client/\`, \`developer/\`, \`review/\`, or \`docs/extensions/\` shards → \`mdcp check\`.

## Extensions and archetypes

The protocol core stays versioned and broadly applicable. Project-specific rules (doc framework formatting, pointer-shard conventions, proprietary review gates) belong in \`docs/extensions/\` or published packs under \`spec/extensions/\` — fork, use locally, or contribute back (no obligation under MIT).

| Layer | Location |
| ----- | -------- |
| Protocol index | \`spec/llms-index/\` — do not patch locally; refetch or PR upstream |
| Local extension | \`docs/extensions/\` in your repo |
| Shared archetypes | \`spec/extensions/archetypes/\` (OSS library, product docs site, …) |

Read \`docs/features/protocol/extensions-and-archetypes.md\` for SOLID principles and governance vision.

## Integration with other doc systems

MDCP shards are **GFM**. You do not need to abandon Pandoc, MkDocs, Docusaurus, or other publish stacks:

- Compile to GFM monolith or per-guide outputs; feed downstream pipelines from compiled files.
- Keep separate guides for agent-only context vs public site content when scopes differ.

## Filename versioning

- Protocol version \`1.0.0.0\` may appear as \`mdcp.v1.llms.txt\` or \`mdcp.v1.0.0.0.llms.txt\` (trailing \`.0\` segments omitted in filename).
- In-progress spec work uses \`mdcp.v{n}--draft.llms.txt\` until adopted; then publish immutable \`mdcp.v{n}.llms.txt\` under \`${LLMS_INDEX_SPEC_DIR}/\`.
- In-file \`mdcp-llms-index\` header always uses the full four-part version.

## Normative spec

Immutable llms-index artifacts: \`${LLMS_INDEX_SPEC_DIR}/\` (symlinks \`${LLMS_INDEX_PROFILE_STABLE}\`, \`${LLMS_INDEX_PROFILE_DEV}\`). Extensions: \`spec/extensions/\`. Authoring profile: \`docs/features/protocol/agent-task-prompts.md\`. Full specification: \`docs/features/protocol/mdcp-1.0-spec.md\`.
`;

function formatRepoSection(config: MdcpConfig, options: LlmsIndexOptions): string {
  const lines: string[] = ['## This repository', ''];

  lines.push(`- **Protocol version:** ${LLMS_INDEX_PROTOCOL_VERSION}`);
  if (options.configPath) {
    lines.push(`- **Config:** \`${options.configPath}\``);
  }
  lines.push(
    `- **Docs root guides (\`compileOrder\`):** ${config.compileOrder.map((g) => `\`${g}\``).join(', ')}`,
  );

  if (config.compileOrder.includes('glossary')) {
    lines.push('- **Glossary:** `glossary/`');
  } else {
    const hasGlossary = config.compileOrder.some((g) => g.toLowerCase().includes('glossary'));
    if (!hasGlossary) {
      lines.push('- **Glossary:** add `glossary/` to `compileOrder` when domain terms exist');
    }
  }

  const scriptKeys = ['docs:context', 'docs:check', 'docs:compile', 'docs:refs', 'docs:check:mdcp'];
  const found = scriptKeys.filter((k) => options.scripts?.[k]);
  if (found.length > 0) {
    lines.push('');
    lines.push('### npm scripts');
    lines.push('');
    for (const key of found) {
      lines.push(`- \`${key}\` — \`${options.scripts![key]}\``);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/** Build llms-index document (bootstrap template + optional repo-specific section). */
export function buildLlmsIndex(config?: MdcpConfig, options: LlmsIndexOptions = {}): string {
  const abbrev = abbreviateProtocolVersion(LLMS_INDEX_PROTOCOL_VERSION);
  const header = `mdcp-llms-index: ${LLMS_INDEX_PROTOCOL_VERSION}`;

  const parts = [header, '', `# MDCP agent index (v${abbrev})`, ''];

  if (config) {
    parts.push(formatRepoSection(config, options));
  }

  parts.push(STATIC_SECTIONS.trim());

  return parts.join('\n').trimEnd() + '\n';
}

export function getLlmsIndexOutputFile(config: MdcpConfig, docsRoot: string): string {
  const file =
    config.export?.llmsIndex?.outputFile ??
    defaultLlmsIndexFilename(config.protocolVersion ?? '1.0.0.0');
  if (file.startsWith('/')) return file;
  return resolve(docsRoot, file);
}

export function getLlmsIndexOptions(config: MdcpConfig) {
  return config.export?.llmsIndex ?? {};
}
