import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  packagesMissingGithubReleases,
  packagesNeedingReleaseHeal,
  parseGitLsRemoteTags,
  releaseTag,
} from './github-releases.mjs';

describe('github-releases', () => {
  it('builds name@version tags', () => {
    assert.equal(releaseTag('@bwilliamson/skill-mdcp', '0.7.2'), '@bwilliamson/skill-mdcp@0.7.2');
  });

  it('parses git ls-remote --tags output', () => {
    const tags = parseGitLsRemoteTags(`
abc\trefs/tags/@bwilliamson/mdcp-cli@0.7.1
def\trefs/tags/@bwilliamson/mdcp-cli@0.7.1^{}
ghi refs/tags/v0.7.0
`);
    assert.deepEqual([...tags].sort(), ['@bwilliamson/mdcp-cli@0.7.1', 'v0.7.0']);
  });

  it('lists packages missing a GitHub Release and/or git tag', () => {
    const packages = [
      { name: '@bwilliamson/mdcp-cli', version: '0.7.1', dir: 'mdcp-cli', private: false },
      { name: '@bwilliamson/skill-mdcp', version: '0.7.2', dir: 'skill-mdcp', private: true },
      { name: '@bwilliamson/mdcp-presets', version: '0.7.0', dir: 'mdcp-presets', private: false },
    ];
    const releases = new Set(['@bwilliamson/mdcp-cli@0.7.1']);
    const gitTags = new Set(['@bwilliamson/mdcp-cli@0.7.1', '@bwilliamson/mdcp-presets@0.7.0']);
    const needing = packagesNeedingReleaseHeal(packages, releases, gitTags);
    assert.deepEqual(
      needing.map((row) => ({
        tag: releaseTag(row.pkg.name, row.pkg.version),
        missingRelease: row.missingRelease,
        missingTag: row.missingTag,
      })),
      [
        {
          tag: '@bwilliamson/mdcp-presets@0.7.0',
          missingRelease: true,
          missingTag: false,
        },
        {
          tag: '@bwilliamson/skill-mdcp@0.7.2',
          missingRelease: true,
          missingTag: true,
        },
      ],
    );
  });

  it('packagesMissingGithubReleases stays release-only', () => {
    const packages = [
      { name: '@bwilliamson/mdcp-cli', version: '0.7.1', dir: 'mdcp-cli', private: false },
    ];
    const existing = new Set(['@bwilliamson/mdcp-cli@0.7.1']);
    assert.deepEqual(packagesMissingGithubReleases(packages, existing), []);
  });
});
