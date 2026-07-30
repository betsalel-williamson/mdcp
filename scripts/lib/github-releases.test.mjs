import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { packagesMissingGithubReleases, releaseTag } from './github-releases.mjs';

describe('github-releases', () => {
  it('builds name@version tags', () => {
    assert.equal(releaseTag('@bwilliamson/skill-mdcp', '0.7.2'), '@bwilliamson/skill-mdcp@0.7.2');
  });

  it('lists packages whose current version has no GitHub Release', () => {
    const packages = [
      { name: '@bwilliamson/mdcp-cli', version: '0.7.1', dir: 'mdcp-cli', private: false },
      { name: '@bwilliamson/skill-mdcp', version: '0.7.2', dir: 'skill-mdcp', private: true },
      { name: '@bwilliamson/mdcp-presets', version: '0.7.0', dir: 'mdcp-presets', private: false },
    ];
    const existing = new Set(['@bwilliamson/mdcp-cli@0.7.1']);
    const missing = packagesMissingGithubReleases(packages, existing);
    assert.deepEqual(
      missing.map((p) => releaseTag(p.name, p.version)),
      ['@bwilliamson/mdcp-presets@0.7.0', '@bwilliamson/skill-mdcp@0.7.2'],
    );
  });

  it('returns empty when every current version already has a release', () => {
    const packages = [
      { name: '@bwilliamson/mdcp-cli', version: '0.7.1', dir: 'mdcp-cli', private: false },
    ];
    const existing = new Set(['@bwilliamson/mdcp-cli@0.7.1']);
    assert.deepEqual(packagesMissingGithubReleases(packages, existing), []);
  });
});
