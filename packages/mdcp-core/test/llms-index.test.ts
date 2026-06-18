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
    expect(text).toContain('## Agent task prompts');
    expect(text).toContain('feature-level-task.prompt.md');
    expect(text).toContain('mdcp refs lookup');
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
    expect(defaultLlmsIndexFilename('1.0.0.0')).toBe('mdcp.v1.llms.txt');
    expect(defaultLlmsIndexFilename('1.2.0.0')).toBe('mdcp.v1.2.llms.txt');
    expect(defaultLlmsIndexFilename('1.0.0.0', { draft: true })).toBe('mdcp.v1--draft.llms.txt');
  });

  it('includes review-task in agent prompt table', () => {
    const text = buildLlmsIndex();
    expect(text).toContain('review-task.prompt.md');
    expect(text).toContain('agent-task-prompts.md');
    expect(text).toContain('docs/extensions/');
    expect(text).toContain('Do not hand-edit');
  });
});
