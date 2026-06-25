import { describe, expect, it } from 'vitest';
import { MdcpConfigSchema } from '../src/config/schema.js';
import {
  buildLlmsIndex,
  defaultLlmsIndexFilename,
  LLMS_INDEX_PROTOCOL_VERSION,
} from '../src/export/llms-index.js';

describe('buildLlmsIndex', () => {
  it('includes protocol header and static sections', () => {
    const text = buildLlmsIndex();
    expect(text.startsWith(`mdcp-llms-index: ${LLMS_INDEX_PROTOCOL_VERSION}`)).toBe(true);
    expect(text).toContain('## Task prompts');
    expect(text).toContain('.caches/mdcp/prompts/feature-level-task.prompt.md');
    expect(text).toContain('Bootstrap');
    expect(text).toContain('npx @bwilliamson/mdcp-cli export --llms-index --fetch');
    expect(text).toContain('protocol.profile');
    expect(text).toContain('protocol.ref');
    expect(text).not.toContain('extensions.protocolVersion');
    expect(text).toContain('mdcp refs lookup');
    expect(text).not.toContain('## Normative spec');
    expect(text).not.toContain('agent-task-prompts.md');
    expect(text).not.toContain('examples/prompts');
  });

  it('includes repo-specific compileOrder when config provided', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features', 'glossary'],
      guides: [{ name: 'features' }, { name: 'glossary' }],
    });
    const text = buildLlmsIndex(config, { configPath: 'docs/mdcp.config.json' });
    expect(text).toContain('`features`');
    expect(text).toContain('`glossary`');
    expect(text).toContain('docs/mdcp.config.json');
  });

  it('default filename abbreviates protocol version', () => {
    expect(defaultLlmsIndexFilename('0.4.0.0')).toBe('mdcp.v0.4.llms.txt');
    expect(defaultLlmsIndexFilename('1.0.0.0')).toBe('mdcp.v1.llms.txt');
    expect(defaultLlmsIndexFilename('1.2.0.0')).toBe('mdcp.v1.2.llms.txt');
    expect(defaultLlmsIndexFilename('0.4.0.0', { draft: true })).toBe('mdcp.v0.4--draft.llms.txt');
  });

  it('uses config protocolVersion in header and repo section', () => {
    const config = MdcpConfigSchema.parse({
      protocolVersion: '0.4.0.1',
      compileOrder: ['features'],
      guides: [{ name: 'features' }],
    });
    const text = buildLlmsIndex(config, { configPath: 'docs/mdcp.config.json' });
    expect(text.startsWith('mdcp-llms-index: 0.4.0.1')).toBe(true);
    expect(text).toContain('- **Index version:** 0.4.0.1');
  });

  it('includes review-task in agent prompt table', () => {
    const text = buildLlmsIndex();
    expect(text).toContain('review-task.prompt.md');
    expect(text).toContain('docs/extensions/');
    expect(text).toContain('Do not hand-edit');
  });
});
