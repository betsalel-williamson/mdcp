import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

export interface PeerTool {
  name: string;
  bin: string;
  found: boolean;
  source: 'local' | 'path' | 'none';
}

export function findPeerBinary(
  name: string,
  cwd: string,
): PeerTool {
  const local = join(cwd, 'node_modules', '.bin', name);
  if (existsSync(local)) {
    return { name, bin: local, found: true, source: 'local' };
  }

  try {
    const which = process.platform === 'win32' ? 'where' : 'which';
    const result = execFileSync(which, [name], { encoding: 'utf-8' }).trim().split('\n')[0];
    if (result) {
      return { name, bin: result, found: true, source: 'path' };
    }
  } catch {
    // not on PATH
  }

  return { name, bin: name, found: false, source: 'none' };
}

export interface RunPeerOptions {
  require?: boolean;
  cwd: string;
  args?: string[];
  stdio?: 'inherit' | 'pipe';
}

export function runPeer(
  tool: PeerTool,
  options: RunPeerOptions,
): { ran: boolean; skipped: boolean; exitCode: number; stdout?: string; stderr?: string } {
  if (!tool.found) {
    const msg = `${tool.name} not found — skipping (install in host repo or PATH)`;
    if (options.require) {
      console.error(`Error: ${msg}`);
      return { ran: false, skipped: false, exitCode: 1 };
    }
    console.info(`→ ${msg}`);
    return { ran: false, skipped: true, exitCode: 0 };
  }

  const result = spawnSync(tool.bin, options.args ?? [], {
    cwd: options.cwd,
    stdio: options.stdio ?? 'inherit',
    encoding: 'utf-8',
  });

  return {
    ran: true,
    skipped: false,
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? undefined,
    stderr: result.stderr ?? undefined,
  };
}
