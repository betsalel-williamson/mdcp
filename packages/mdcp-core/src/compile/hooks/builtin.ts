import { registerCompileHook } from '../hooks.js';
import { stripExplicitAnchorMarkers } from '../anchors.js';
import { codeEvidenceHook } from './code-evidence.js';
import { inlineInsertsHook } from './inline-inserts.js';
import { reviewLinksHook } from './review-links.js';

registerCompileHook('stripAnchors', (ctx) => stripExplicitAnchorMarkers(ctx.body));
registerCompileHook('codeEvidence', codeEvidenceHook);
registerCompileHook('reviewLinks', reviewLinksHook);
registerCompileHook('inlineInserts', inlineInsertsHook);
