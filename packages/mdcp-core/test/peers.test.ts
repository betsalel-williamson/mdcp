import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { findPeerBinary } from '../src/peers/resolve.js';

describe('findPeerBinary', () => {
  const root = join(tmpdir(), `mdcp-peers-${Date.now()}`);
  const nested = join(root, 'examples', 'sample-guides');

  it('finds hoisted binaries in an ancestor node_modules', () => {
    mkdirSync(join(root, 'node_modules', '.bin'), { recursive: true });
    mkdirSync(nested, { recursive: true });
    const binPath = join(root, 'node_modules', '.bin', 'markdownlint-cli2');
    writeFileSync(binPath, '#!/usr/bin/env node\n', 'utf-8');

    const tool = findPeerBinary('markdownlint-cli2', nested);
    expect(tool.found).toBe(true);
    expect(tool.bin).toBe(binPath);
    expect(tool.source).toBe('local');

    rmSync(root, { recursive: true, force: true });
  });

  it('returns not found when binary is absent', () => {
    const work = join(tmpdir(), `mdcp-peers-missing-${Date.now()}`);
    mkdirSync(work, { recursive: true });
    const tool = findPeerBinary('nonexistent-mdcp-tool', work);
    expect(tool.found).toBe(false);
    expect(tool.source).toBe('none');
    rmSync(work, { recursive: true, force: true });
  });
});
