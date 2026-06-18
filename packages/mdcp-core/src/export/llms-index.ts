import { resolve } from 'node:path';
import type { MdcpConfig } from '../config/schema.js';
import { abbreviateProtocolVersion } from './protocol-version.js';

export const LLMS_INDEX_PROTOCOL_VERSION = '1.0.0.0';

export interface LlmsIndexOptions {
  /** Path to mdcp.config.json relative to repo root or invocation dir. */
  configPath?: string;
  /** npm scripts block (name → command) to list when present. */
  scripts?: Record<string, string>;
}

const STATIC_SECTIONS = `## What MDCP is

**MarkDown Context Protocol** — a protocol for repository documentation context. Shards are the **source of truth**; compiled monoliths and publish outputs are **generated**. Documentation carries context and the high-level plan; code carries implementation detail.

## Adoption path

1. **Copy this file** into your docs root (or generate with \`mdcp export --llms-index\` after config exists).
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
    index.md
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
4. **Regenerate this index** after config changes:
   \`\`\`bash
   mdcp export --llms-index --config <config> --docs-root <docs-root>
   \`\`\`

## Glossary

Maintain \`docs/glossary/\` for acronyms and domain vocabulary. When the same term means different things in legacy systems, add a disambiguation entry and link from feature shards on first use.

## Validation

Run \`mdcp check\` before trusting compiled output. Shards and manifest are authoritative — do not hand-edit generated compile output.

## Agent task prompts

Task-type prompts in \`examples/prompts/\` are part of MDCP 1.0 authoring. Each **MUST** set \`WORK_ITEM\` and \`WORK_ITEM_LOOKUP\` before sending.

| Task | Prompt |
| ---- | ------ |
| Bootstrap pipeline | \`getting-started-with-mdcp.prompt.md\` |
| Feature (docs + code) | \`feature-level-task.prompt.md\` |
| Documentation only | \`doc-only-task.prompt.md\` |
| Architecture / ADR | \`design-architecture-task.prompt.md\` |
| End-user UX | \`ux-task.prompt.md\` |
| Architecture / security review | \`review-task.prompt.md\` |

Workflow: read this index → load \`WORK_ITEM\` via lookup shard → edit \`features/\`, \`client/\`, \`developer/\`, or \`review/\` shards → \`mdcp check\`.

## Integration with other doc systems

MDCP shards are **GFM**. You do not need to abandon Pandoc, MkDocs, Docusaurus, or other publish stacks:

- Compile to GFM monolith or per-guide outputs; feed downstream pipelines from compiled files.
- Keep separate guides for agent-only context vs public site content when scopes differ.

## Filename versioning

- Protocol version \`1.0.0.0\` may appear as \`mdcp.v1.llms.txt\` or \`mdcp.v1.0.0.0.llms.txt\` (trailing \`.0\` segments omitted in filename).
- In-file \`mdcp-llms-index\` header always uses the full four-part version.

## Normative spec

MDCP 1.0 specification and artifact schemas are tracked in the mdcp repository protocol formalization program (GitHub issue #44).
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

export function defaultLlmsIndexFilename(protocolVersion = LLMS_INDEX_PROTOCOL_VERSION): string {
  return `mdcp.v${abbreviateProtocolVersion(protocolVersion)}.llms.txt`;
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
