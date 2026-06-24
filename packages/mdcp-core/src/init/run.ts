import { resolve } from 'node:path';
import type { MdcpConfig } from '../config/schema.js';
import { fetchLlmsIndexFromUpstream } from '../export/llms-index-fetch.js';
import { resolveLlmsIndexFetchOptions } from '../export/llms-index-fetch.js';
import { cacheEnabledExtensions } from '../extensions/cache.js';
import { writeOutputFile } from '../compile/write-output.js';
import { defaultLlmsIndexFilename } from '../export/llms-index-artifacts.js';
import { detectExistingDocs } from './detect.js';
import { buildAugmentConfig, writeAdoptionPlan, writeAugmentConfig } from './augment.js';
import { buildDefaultConfig, parseInitPreset, type InitPreset } from './presets.js';
import { scaffoldDefaultLayout, writeDefaultConfig } from './scaffold.js';

export type InitMode = 'detect' | 'default' | 'augment';

export interface RunInitOptions {
  repoRoot?: string;
  docsRoot: string;
  mode?: InitMode;
  preset?: string;
  dryRun?: boolean;
  fetchProfile?: 'alpha' | 'dev';
  fetchRef?: string;
  fetchLocal?: boolean;
  fetch?: typeof fetch;
}

export interface RunInitResult {
  mode: InitMode;
  preset: InitPreset;
  detection: ReturnType<typeof detectExistingDocs>;
  config?: MdcpConfig;
  configPath?: string;
  llmsIndexPath?: string;
  adoptionPlanPath?: string;
  created: string[];
  skipped: string[];
  message: string;
}

function resolveMode(
  requested: InitMode | undefined,
  detection: ReturnType<typeof detectExistingDocs>,
): InitMode {
  if (requested && requested !== 'detect') return requested;
  if (!detection.hasExistingDocs) return 'default';
  return 'detect';
}

export async function runInit(options: RunInitOptions): Promise<RunInitResult> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const docsRoot = options.docsRoot;
  const docsRootAbs = resolve(repoRoot, docsRoot);
  const preset = parseInitPreset(options.preset);
  const detection = detectExistingDocs(repoRoot, docsRoot);
  const mode = resolveMode(options.mode, detection);
  const dryRun = options.dryRun ?? false;
  const created: string[] = [];
  const skipped: string[] = [];

  if (mode === 'detect') {
    return {
      mode,
      preset,
      detection,
      created,
      skipped,
      message: JSON.stringify(
        {
          hasExistingDocs: detection.hasExistingDocs,
          signals: detection.signals,
          existingGuides: detection.existingGuides,
          askUser: 'Use --mode default or --mode augment',
        },
        null,
        2,
      ),
    };
  }

  let config: MdcpConfig;
  let adoptionPlanPath: string | undefined;

  if (mode === 'default') {
    config = buildDefaultConfig(preset);
    if (!dryRun) {
      const scaffold = scaffoldDefaultLayout(docsRootAbs, preset);
      created.push(...scaffold.created);
      skipped.push(...scaffold.skipped);
      const { path: cfgPath, created: cfgCreated } = writeDefaultConfig(docsRootAbs, config);
      if (cfgCreated) created.push(cfgPath);
      else skipped.push(cfgPath);
    }
  } else {
    config = buildAugmentConfig(detection, preset);
    if (!dryRun) {
      const { path: planPath, created: planCreated } = writeAdoptionPlan(
        docsRootAbs,
        detection,
        preset,
      );
      adoptionPlanPath = planPath;
      if (planCreated) created.push(planPath);
      else skipped.push(planPath);
      const { path: cfgPath, created: cfgCreated } = writeAugmentConfig(docsRootAbs, config, false);
      if (cfgCreated) created.push(cfgPath);
      else skipped.push(cfgPath);
    }
  }

  const configPath = resolve(docsRootAbs, 'mdcp.config.json');
  let llmsIndexPath: string | undefined;

  if (!dryRun) {
    const fetchOptions = resolveLlmsIndexFetchOptions(config, {
      profile: options.fetchProfile ?? 'dev',
      ref: options.fetchRef,
    });
    if (options.fetchLocal) {
      fetchOptions.localRepoRoot = repoRoot;
    }
    const { text, ref } = await fetchLlmsIndexFromUpstream({
      ...fetchOptions,
      fetch: options.fetch,
    });
    await cacheEnabledExtensions({
      docsRoot: docsRootAbs,
      config,
      localRepoRoot: fetchOptions.localRepoRoot,
      resolvedRef: ref === 'local' ? undefined : ref,
      fetch: fetchOptions.fetch,
    });
    llmsIndexPath = resolve(docsRootAbs, defaultLlmsIndexFilename('0.5.0.0'));
    writeOutputFile(llmsIndexPath, text, { docsRoot: docsRootAbs, outputDir: '_build' });
    created.push(llmsIndexPath);
  }

  return {
    mode,
    preset,
    detection,
    config,
    configPath: dryRun ? undefined : configPath,
    llmsIndexPath,
    adoptionPlanPath,
    created,
    skipped,
    message:
      mode === 'default'
        ? `Scaffolded ${preset} preset under ${docsRoot}`
        : `Augment plan written for existing docs under ${docsRoot}`,
  };
}
