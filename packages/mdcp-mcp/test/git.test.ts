import { describe, it, expect } from 'vitest';
import { assertBranchRef, assertGitSha, assertRepoRelativePath } from '../src/github/git.js';

describe('git argument validation', () => {
  it('accepts valid SHAs', () => {
    expect(assertGitSha('abc1234', 'sha')).toBe('abc1234');
    expect(assertGitSha('0123456789abcdef0123456789abcdef01234567', 'sha')).toHaveLength(40);
  });

  it('rejects invalid SHAs', () => {
    expect(() => assertGitSha('main; rm -rf /', 'sha')).toThrow(/Invalid git SHA/);
    expect(() => assertGitSha('short', 'sha')).toThrow(/Invalid git SHA/);
  });

  it('accepts safe branch refs', () => {
    expect(assertBranchRef('main', 'baseRef')).toBe('main');
    expect(assertBranchRef('feature/foo-bar_1', 'baseRef')).toBe('feature/foo-bar_1');
  });

  it('rejects unsafe branch refs', () => {
    expect(() => assertBranchRef('main; echo pwned', 'baseRef')).toThrow(/Invalid git ref/);
    expect(() => assertBranchRef('../escape', 'baseRef')).toThrow(/Invalid git ref/);
  });

  it('accepts safe repository paths', () => {
    expect(assertRepoRelativePath('packages/mdcp-mcp/src/cli.ts')).toBe(
      'packages/mdcp-mcp/src/cli.ts',
    );
  });

  it('rejects unsafe repository paths', () => {
    expect(() => assertRepoRelativePath('../secrets')).toThrow(/Invalid repository path/);
    expect(() => assertRepoRelativePath('/etc/passwd')).toThrow(/Invalid repository path/);
  });
});
