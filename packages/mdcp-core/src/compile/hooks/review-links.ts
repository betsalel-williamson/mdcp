import { dirname } from 'node:path';
import type { CompileHook } from '../hooks.js';
import { rewriteCrossGuideFileLinks } from '../publish-links.js';
import { hookSearchRoots } from './path-resolve.js';

export const reviewLinksHook: CompileHook = (ctx) => {
  if (!ctx.linkIndex) return ctx.body;

  const guideDir = dirname(ctx.sourceFile);
  const searchRoots = hookSearchRoots(ctx, 'reviewLinks');
  const guideCfg = ctx.config.guides?.find((g) => g.name === ctx.guideName);
  const targetMonolith = guideCfg?.compile?.hooksConfig?.reviewLinks?.targetMonolith;

  return rewriteCrossGuideFileLinks(ctx.body, {
    sourceFile: ctx.sourceFile,
    guideDir,
    scopeRoot: ctx.scopeRoot,
    currentOutputBasename: ctx.outputBasename,
    linkIndex: ctx.linkIndex,
    targetMonolith,
    searchRoots,
  });
};
