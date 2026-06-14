import { registerCompileHook } from '../hooks.js';
import { stripExplicitAnchorMarkers } from '../anchors.js';
import { codeEvidenceHook } from './code-evidence.js';
import { inlineDiagramsHook } from './inline-diagrams.js';
import { reviewLinksHook } from './review-links.js';

registerCompileHook('stripAnchors', (ctx) => stripExplicitAnchorMarkers(ctx.body));
registerCompileHook('codeEvidence', codeEvidenceHook);
registerCompileHook('reviewLinks', reviewLinksHook);
registerCompileHook('inlineDiagrams', inlineDiagramsHook);
