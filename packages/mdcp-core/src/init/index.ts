export { detectExistingDocs, type DocsDetectionResult } from './detect.js';
export {
  buildDefaultConfig,
  parseInitPreset,
  INIT_PRESETS,
  guideDirsForPreset,
  type InitPreset,
} from './presets.js';
export { scaffoldDefaultLayout, writeDefaultConfig } from './scaffold.js';
export { buildAugmentConfig, writeAdoptionPlan, writeAugmentConfig } from './augment.js';
export { runInit, type RunInitOptions, type RunInitResult, type InitMode } from './run.js';
