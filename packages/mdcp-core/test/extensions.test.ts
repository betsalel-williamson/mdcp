import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, vi } from 'vitest';
import { MdcpConfigSchema } from '../src/config/schema.js';
import { selectCompatibleExtensionVersion, findCatalogEntry } from '../src/extensions/catalog.js';
import { REFERENCE_EXTENSIONS_CATALOG } from '../src/extensions/builtins.js';
import { resolveEnabledExtensionPacks } from '../src/extensions/resolve.js';
import { buildExtensionFileUrl } from '../src/extensions/source-url.js';
import { loadExtensionsCatalog, resolveExtensionFetchRef } from '../src/extensions/version.js';
import {
  cacheEnabledExtensions,
  copyEnabledExtensionsFromLocalSpec,
} from '../src/extensions/cache.js';
import {
  STANDARD_TASK_PROMPT_FILES,
  TASK_PROMPTS_SPEC_DIR,
} from '../src/export/task-prompts-artifacts.js';

const REPO_ROOT = join(import.meta.dirname, '../../..');

describe('extensions config', () => {
  it('parses extensions with enabled packs', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocol: { fetch: { repo: 'org/mdcp', ref: 'v0.4.0' } },
      extensions: {
        packs: [{ id: 'prompts-mdcp-defaults', enabled: true }],
      },
    });
    expect(config.protocol?.fetch?.repo).toBe('org/mdcp');
    expect(config.extensions?.packs?.[0]?.id).toBe('prompts-mdcp-defaults');
  });

  it('merges built-in task-prompts defaults by id', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      extensions: {
        packs: [{ id: 'prompts-mdcp-defaults', enabled: true }],
      },
    });
    const packs = resolveEnabledExtensionPacks(config, { repoRoot: REPO_ROOT });
    expect(packs).toHaveLength(1);
    expect(packs[0]!.path).toBe('spec/extensions/prompts-mdcp-defaults/0.4.0.0');
    expect(packs[0]!.version).toBe('0.4.0.0');
    expect(packs[0]!.cacheDir).toBe('.caches/mdcp/prompts');
    expect(packs[0]!.files).toEqual([...STANDARD_TASK_PROMPT_FILES]);
  });

  it('pins extension version from catalog when protocol matches', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocolVersion: '0.4.0.0',
      protocol: { fetch: { ref: 'main' } },
    });
    const packs = resolveEnabledExtensionPacks(config, { repoRoot: REPO_ROOT });
    expect(packs[0]!.protocolVersion).toBe('0.4.0.0');
    expect(packs[0]!.version).toBe('0.4.0.0');
    expect(packs[0]!.path).toBe('spec/extensions/prompts-mdcp-defaults/0.4.0.0');
    expect(packs[0]!.protocolVersionRange).toBe('0.4.0.0');
  });

  it('defaults to task-prompts when extensions block is omitted', () => {
    const config = MdcpConfigSchema.parse({ compileOrder: ['features'] });
    const packs = resolveEnabledExtensionPacks(config, { repoRoot: REPO_ROOT });
    expect(packs).toHaveLength(1);
    expect(packs[0]!.id).toBe('prompts-mdcp-defaults');
    expect(packs[0]!.version).toBe('0.4.0.0');
  });

  it('derives release ref from protocolVersion when fetch ref is main', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocolVersion: '0.4.0.0',
      protocol: { fetch: { ref: 'main' } },
    });
    expect(resolveExtensionFetchRef(config)).toBe('v0.4.0');
  });

  it('loads catalog from local spec checkout', () => {
    const catalog = loadExtensionsCatalog(REPO_ROOT);
    const entry = findCatalogEntry(catalog, 'prompts-mdcp-defaults');
    expect(entry?.versions[0]?.version).toBe('0.4.0.0');
  });

  it('selects compatible extension version from catalog', () => {
    const entry = findCatalogEntry(REFERENCE_EXTENSIONS_CATALOG, 'prompts-mdcp-defaults')!;
    const selected = selectCompatibleExtensionVersion(entry, '0.4.0.0');
    expect(selected.version).toBe('0.4.0.0');
  });

  it('rejects revoked extension versions', () => {
    const config = MdcpConfigSchema.parse({
      compileOrder: ['features'],
      protocolVersion: '0.4.0.0',
      extensions: {
        packs: [{ id: 'prompts-mdcp-defaults', enabled: true, version: '9.9.9.9' }],
      },
    });
    expect(() => resolveEnabledExtensionPacks(config)).toThrow(/not in the catalog/);
  });

  it('builds custom baseUrl for extension files', () => {
    const url = buildExtensionFileUrl(
      { repo: 'ignored/repo', ref: 'main', baseUrl: 'https://cdn.example.com/ext' },
      'prompts',
      'feature.prompt.md',
    );
    expect(url).toBe('https://cdn.example.com/ext/prompts/feature.prompt.md');
  });

  it('copies enabled packs from local spec checkout', () => {
    const docsRoot = mkdtempSync(join(tmpdir(), 'mdcp-ext-local-'));
    try {
      const config = MdcpConfigSchema.parse({
        compileOrder: ['features'],
        extensions: { packs: [{ id: 'prompts-mdcp-defaults', enabled: true }] },
      });
      const result = copyEnabledExtensionsFromLocalSpec(REPO_ROOT, docsRoot, config);
      expect(result.packs).toHaveLength(1);
      for (const filename of STANDARD_TASK_PROMPT_FILES) {
        expect(existsSync(join(docsRoot, '.caches/mdcp/prompts', filename))).toBe(true);
      }
      const manifest = JSON.parse(
        readFileSync(join(docsRoot, '.caches/mdcp/prompts/manifest.json'), 'utf-8'),
      ) as { id: string; version: string; path: string };
      expect(manifest.id).toBe('prompts-mdcp-defaults');
      expect(manifest.version).toBe('0.4.0.0');
      expect(manifest.path).toBe(TASK_PROMPTS_SPEC_DIR);
    } finally {
      rmSync(docsRoot, { recursive: true, force: true });
    }
  });

  it('fetches custom pack files from baseUrl', async () => {
    const docsRoot = mkdtempSync(join(tmpdir(), 'mdcp-ext-url-'));
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      expect(url).toBe('https://cdn.example.com/team/prompts/onboarding.prompt.md');
      return new Response('# Onboarding\n', { status: 200 });
    });

    try {
      const config = MdcpConfigSchema.parse({
        compileOrder: ['features'],
        extensions: {
          packs: [
            {
              id: 'team-prompts',
              enabled: true,
              path: 'team/prompts',
              cacheDir: '.caches/mdcp/team-prompts',
              files: ['onboarding.prompt.md'],
              source: { baseUrl: 'https://cdn.example.com', ref: 'main' },
            },
          ],
        },
      });
      const result = await cacheEnabledExtensions({
        docsRoot,
        config,
        fetch: fetchMock,
      });
      expect(result.packs).toHaveLength(1);
      expect(
        readFileSync(join(docsRoot, '.caches/mdcp/team-prompts/onboarding.prompt.md'), 'utf-8'),
      ).toContain('# Onboarding');
    } finally {
      rmSync(docsRoot, { recursive: true, force: true });
    }
  });
});
