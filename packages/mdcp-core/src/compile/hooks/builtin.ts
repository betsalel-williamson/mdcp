import { registerCompileHook } from '../hooks.js';
import { stripExplicitAnchorMarkers } from '../anchors.js';

registerCompileHook('stripAnchors', (ctx) => stripExplicitAnchorMarkers(ctx.body));

/** Passthrough placeholder; full port in consumer hook packs. */
registerCompileHook('codeEvidence', (ctx) => ctx.body);

/** Passthrough; intra-guide and publish path link rewriting run at assembly time in assembleGuide. */
registerCompileHook('reviewLinks', (ctx) => ctx.body);

registerCompileHook('inlineDiagrams', (ctx) => ctx.body);
