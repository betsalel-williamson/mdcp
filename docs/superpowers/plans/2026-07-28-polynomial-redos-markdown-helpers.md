# Clear CodeQL polynomial-ReDoS via shared markdown helpers (Phase A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear CodeQL `js/polynomial-redos` alerts #1–#6 by proving the ReDoS class with a red duration-budget demo, then shipping shared imperative markdown helpers and migrating all ATX-heading / `{#anchor}` call sites onto them.

**Architecture:** Add `packages/mdcp-core/src/markdown/` with linear parsers (`parseAtxHeading`, `stripPandocAnchors`, `headingTitlePlain`). Existing public wrappers (`stripExplicitAnchorMarkers`, `headingTextToPlain`, …) keep their signatures and delegate to the helpers. Domain regexes outside heading/anchor parsing stay for Phase B (#201).

**Tech Stack:** TypeScript, Vitest, `@bwilliamson/mdcp-core`, Changesets, CodeQL `js/polynomial-redos`.

**Spec:** `docs/superpowers/specs/2026-07-27-polynomial-redos-markdown-helpers-design.md`  
**Issue:** [#200](https://github.com/betsalel-williamson/mdcp/issues/200) (v0.7 gate) · Follow-up [#201](https://github.com/betsalel-williamson/mdcp/issues/201)

## Global Constraints

- Work only in worktree `/Users/saul/Repos/mdcp/.worktrees/polynomial-redos` on branch `security/polynomial-redos`.
- TDD: red ReDoS demo lands and fails (or exceeds budget) **before** helpers land; keep demo tests after the fix.
- Public API parity: do not change export names or heading/slug semantics beyond matching today’s golden tests.
- Phase B (xrefs chapter lint, code-evidence, etc.) is out of scope except migrating the single `^#{1,6}\s+` heading skip in `xrefs/lint.ts`.
- After `pnpm build`, run `pnpm --filter @bwilliamson/mdcp-core test` to verify.
- Each **Atomic commit** below is one `git commit` with the given subject (conventional commits).

## File structure

| Path | Responsibility |
| --- | --- |
| `packages/mdcp-core/src/markdown/atx-heading.ts` | Imperative ATX line parse |
| `packages/mdcp-core/src/markdown/anchors.ts` | Strip Pandoc `{#id}` markers |
| `packages/mdcp-core/src/markdown/heading-plain.ts` | Plain title for slugger |
| `packages/mdcp-core/src/markdown/index.ts` | Barrel re-exports |
| `packages/mdcp-core/test/redos-budget.test.ts` | Adversarial duration-budget demos (kept forever) |
| `packages/mdcp-core/test/markdown-helpers.test.ts` | Unit tests for helpers |
| Existing compile/refs/links/xrefs modules | Thin wrappers / call-site migration |

---

### Task 1: Red — adversarial ReDoS budget demos

**Atomic commit:** `test: add failing ReDoS budget demos for heading/anchor paths`

**Files:**
- Create: `packages/mdcp-core/test/redos-budget.test.ts`
- Create: `packages/mdcp-core/test/helpers/redos-pumps.ts` (pump builders + timer helper)

**Interfaces:**
- Consumes: current public APIs `stripExplicitAnchorMarkers`, `headingTextToPlain`, and heading match via `demoteHeadings` / a thin exported test seam if needed
- Produces: failing Vitest suite documenting CodeQL alert classes #1–#6

**Why a separate pump helper:** keep pump sizes tunable in one place if CI machines are faster/slower than the budget.

- [ ] **Step 1: Add pump + timer helpers**

```typescript
// packages/mdcp-core/test/helpers/redos-pumps.ts
export function manySpaces(n: number): string {
  return ' '.repeat(n);
}

/** CodeQL pump class for \{#.*?\} — many '{{#' without closing brace. */
export function nestedOpenAnchors(n: number): string {
  return '{{#'.repeat(n);
}

export function timeMs(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}
```

- [ ] **Step 2: Write red budget tests against today’s public APIs**

Use pumps large enough that the **current** regex implementations exceed `BUDGET_MS` on a typical dev machine. Start with the values below; if the suite accidentally passes before the fix (V8 too fast), increase `N` until red, then lock it.

```typescript
// packages/mdcp-core/test/redos-budget.test.ts
import { describe, it, expect } from 'vitest';
import { stripExplicitAnchorMarkers } from '../src/compile/anchors.js';
import { headingTextToPlain } from '../src/refs/slugs.js';
import { demoteHeadings } from '../src/compile/headings.js';
import { manySpaces, nestedOpenAnchors, timeMs } from './helpers/redos-pumps.js';

/** Tight budget: safe linear parsers finish well under this; polynomial paths blow it. */
const BUDGET_MS = 50;
const SPACE_N = 40_000;
const ANCHOR_N = 25_000;

describe('ReDoS budget demos (CodeQL js/polynomial-redos)', () => {
  it('stripExplicitAnchorMarkers stays under budget on long leading spaces + incomplete {#', () => {
    // Alert #1 class: \\s* before {#…}
    const input = manySpaces(SPACE_N) + '{#';
    const ms = timeMs(() => {
      stripExplicitAnchorMarkers(input);
    });
    expect(ms).toBeLessThan(BUDGET_MS);
  });

  it('headingTextToPlain stays under budget on nested {{# pumps', () => {
    // Alerts #4/#6 class: \\{#.*?\\}
    const input = nestedOpenAnchors(ANCHOR_N);
    const ms = timeMs(() => {
      headingTextToPlain(input);
    });
    expect(ms).toBeLessThan(BUDGET_MS);
  });

  it('demoteHeadings stays under budget on long whitespace after hashes', () => {
    // Alerts #2/#3/#5 class: heading \\s+ + rest
    const input = '#' + manySpaces(SPACE_N) + 'Title';
    const ms = timeMs(() => {
      demoteHeadings(input);
    });
    expect(ms).toBeLessThan(BUDGET_MS);
  });
});
```

- [ ] **Step 3: Run tests and confirm red**

Run:

```bash
cd /Users/saul/Repos/mdcp/.worktrees/polynomial-redos
pnpm --filter @bwilliamson/mdcp-core exec vitest run test/redos-budget.test.ts
```

Expected: **FAIL** — at least one `expect(ms).toBeLessThan(BUDGET_MS)` fails (duration ≫ 50ms). If all pass, bump `SPACE_N` / `ANCHOR_N` (e.g. ×2) and re-run until red. Do **not** implement helpers yet.

Optional stronger red (if public APIs short-circuit before the bad regex): add a companion `describe` that runs the **exact** current regex literals copied from source with a comment `// mirror of anchors.ts / slugs.ts at commit …` and assert those exceed budget — then Task 2/3 delete the mirrors when production is fixed. Prefer public-API demos first.

- [ ] **Step 4: Atomic commit**

```bash
git add packages/mdcp-core/test/redos-budget.test.ts packages/mdcp-core/test/helpers/redos-pumps.ts
git commit -m "$(cat <<'EOF'
test: add failing ReDoS budget demos for heading/anchor paths

Demonstrate CodeQL js/polynomial-redos classes (#200) with duration
budgets before introducing linear markdown helpers.

EOF
)"
```

---

### Task 2: Green helpers — `src/markdown/` + unit tests

**Atomic commit:** `feat: add linear markdown helpers for ATX headings and anchors`

**Files:**
- Create: `packages/mdcp-core/src/markdown/atx-heading.ts`
- Create: `packages/mdcp-core/src/markdown/anchors.ts`
- Create: `packages/mdcp-core/src/markdown/heading-plain.ts`
- Create: `packages/mdcp-core/src/markdown/index.ts`
- Create: `packages/mdcp-core/test/markdown-helpers.test.ts`

**Interfaces:**
- Consumes: nothing from Task 1 except shared pumps optional for unit cases
- Produces:
  - `export interface AtxHeading { level: number; marker: string; whitespace: string; title: string }`
  - `export function parseAtxHeading(line: string): AtxHeading | null`
  - `export function isAtxHeading(line: string): boolean`
  - `export function stripPandocAnchors(text: string, options?: { trimPrecedingWhitespace?: boolean }): string`
  - `export function headingTitlePlain(text: string): string`

- [ ] **Step 1: Write failing unit tests for helpers**

```typescript
// packages/mdcp-core/test/markdown-helpers.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseAtxHeading,
  isAtxHeading,
  stripPandocAnchors,
  headingTitlePlain,
} from '../src/markdown/index.js';

describe('parseAtxHeading', () => {
  it('parses levels 1–6 with preserved whitespace', () => {
    expect(parseAtxHeading('##  Hello')).toEqual({
      level: 2,
      marker: '##',
      whitespace: '  ',
      title: 'Hello',
    });
  });

  it('returns null for non-headings and fence-like lines', () => {
    expect(parseAtxHeading('not a heading')).toBeNull();
    expect(parseAtxHeading('#nofence')).toBeNull();
    expect(isAtxHeading('### Title')).toBe(true);
  });
});

describe('stripPandocAnchors', () => {
  it('removes {#id} and optional preceding whitespace', () => {
    expect(stripPandocAnchors('## Review {#review-index}', { trimPrecedingWhitespace: true })).toBe(
      '## Review',
    );
  });

  it('is linear on incomplete pumps', () => {
    const input = '{#'.repeat(20_000);
    const start = performance.now();
    stripPandocAnchors(input);
    expect(performance.now() - start).toBeLessThan(50);
  });
});

describe('headingTitlePlain', () => {
  it('matches prior headingTextToPlain semantics', () => {
    expect(headingTitlePlain('**Bold** `{#custom-id}`')).toBe('Bold');
  });
});
```

- [ ] **Step 2: Run helper tests — expect FAIL (module missing)**

```bash
pnpm --filter @bwilliamson/mdcp-core exec vitest run test/markdown-helpers.test.ts
```

Expected: FAIL — cannot resolve `../src/markdown/index.js`.

- [ ] **Step 3: Implement helpers (no production call-site migration yet)**

`parseAtxHeading` — scan leading `#` (1–6), require following space/tab, capture whitespace run, remainder is `title`. No `\s+` / `.*` regex.

```typescript
// packages/mdcp-core/src/markdown/atx-heading.ts
export interface AtxHeading {
  level: number;
  marker: string;
  whitespace: string;
  title: string;
}

export function parseAtxHeading(line: string): AtxHeading | null {
  let i = 0;
  while (i < line.length && line[i] === '#' && i < 6) i++;
  if (i === 0) return null;
  const level = i;
  if (i >= line.length || (line[i] !== ' ' && line[i] !== '\t')) return null;
  const wsStart = i;
  while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++;
  return {
    level,
    marker: line.slice(0, level),
    whitespace: line.slice(wsStart, i),
    title: line.slice(i),
  };
}

export function isAtxHeading(line: string): boolean {
  return parseAtxHeading(line) !== null;
}
```

`stripPandocAnchors` — scan for `{#`, then consume `[a-zA-Z0-9-]+` or until `}` for slugger strip mode; for compiled-output mode with `trimPrecedingWhitespace: true`, also drop ASCII whitespace immediately before the marker (parity with `/\s*\{#[a-z0-9-]+\}/gi`). Prefer a single forward scan / `String.prototype` loops — **no** `\s*` and **no** `.*?`.

`headingTitlePlain` — `trim`, `stripPandocAnchors` (no preceding-ws trim needed inside titles), strip `` `*_ `` characters like today’s `headingTextToPlain`, `trim` again.

```typescript
// packages/mdcp-core/src/markdown/index.ts
export {
  parseAtxHeading,
  isAtxHeading,
  type AtxHeading,
} from './atx-heading.js';
export { stripPandocAnchors } from './anchors.js';
export { headingTitlePlain } from './heading-plain.js';
```

- [ ] **Step 4: Run helper tests — expect PASS**

```bash
pnpm --filter @bwilliamson/mdcp-core exec vitest run test/markdown-helpers.test.ts
```

Expected: PASS.  
Note: `redos-budget.test.ts` should still be **FAIL** (call sites not migrated).

- [ ] **Step 5: Atomic commit**

```bash
git add packages/mdcp-core/src/markdown packages/mdcp-core/test/markdown-helpers.test.ts
git commit -m "$(cat <<'EOF'
feat: add linear markdown helpers for ATX headings and anchors

Introduce parseAtxHeading / stripPandocAnchors / headingTitlePlain so
call sites can drop polynomial heading and {#id} regexes (#200).

EOF
)"
```

---

### Task 3: Migrate anchors + headings (clear alerts #1–#3)

**Atomic commit:** `refactor: migrate anchors and headings onto markdown helpers`

**Files:**
- Modify: `packages/mdcp-core/src/compile/anchors.ts`
- Modify: `packages/mdcp-core/src/compile/headings.ts`
- Test: `packages/mdcp-core/test/anchors.test.ts`, `packages/mdcp-core/test/headings.test.ts`, `packages/mdcp-core/test/redos-budget.test.ts`

**Interfaces:**
- Consumes: `stripPandocAnchors`, `parseAtxHeading` from `../markdown/index.js`
- Produces: unchanged exports `stripExplicitAnchorMarkers`, `demoteHeadings`, …

- [ ] **Step 1: Rewrite `anchors.ts`**

```typescript
import { stripPandocAnchors } from '../markdown/index.js';

/** Remove Pandoc-style {#id} markers from compiled output. */
export function stripExplicitAnchorMarkers(markdown: string): string {
  return stripPandocAnchors(markdown, { trimPrecedingWhitespace: true });
}
```

- [ ] **Step 2: Rewrite heading matching in `headings.ts`**

Replace `HEADING_RE` usages with `parseAtxHeading`. Keep `FENCE_RE` and `ABOUT_H1_RE` as-is for Phase A (fence pattern is not in the open CodeQL set; `ABOUT_H1_RE` is a fixed literal).

```typescript
import { parseAtxHeading } from '../markdown/index.js';

function demoteLine(line: string, levels: number): string {
  const m = parseAtxHeading(line);
  if (!m) return line;
  const depth = Math.min(m.level + levels, 6);
  return '#'.repeat(depth) + m.whitespace + m.title;
}
```

In `demoteExceptFirstH1`, replace `line.match(HEADING_RE)` with `parseAtxHeading(line)` and use `m.level === 1`.

- [ ] **Step 3: Run targeted tests**

```bash
pnpm --filter @bwilliamson/mdcp-core exec vitest run \
  test/anchors.test.ts test/headings.test.ts test/redos-budget.test.ts
```

Expected:
- `anchors` / `headings` PASS
- ReDoS demos for `stripExplicitAnchorMarkers` and `demoteHeadings` PASS
- `headingTextToPlain` budget demo may still FAIL until Task 4

- [ ] **Step 4: Atomic commit**

```bash
git add packages/mdcp-core/src/compile/anchors.ts packages/mdcp-core/src/compile/headings.ts
git commit -m "$(cat <<'EOF'
refactor: migrate anchors and headings onto markdown helpers

Clear CodeQL polynomial-redos paths in compile/anchors and
compile/headings by using linear parsers (#200).

EOF
)"
```

---

### Task 4: Migrate `refs/slugs.ts` (clear alerts #4–#6)

**Atomic commit:** `refactor: migrate slug registry onto markdown helpers`

**Files:**
- Modify: `packages/mdcp-core/src/refs/slugs.ts`
- Test: `packages/mdcp-core/test/refs.test.ts`, `packages/mdcp-core/test/redos-budget.test.ts`

**Interfaces:**
- Consumes: `parseAtxHeading`, `stripPandocAnchors`, `headingTitlePlain`
- Produces: unchanged `headingTextToPlain`, `githubSlugify`, `buildSlugRegistry`

- [ ] **Step 1: Replace implementations**

```typescript
import {
  parseAtxHeading,
  stripPandocAnchors,
  headingTitlePlain,
} from '../markdown/index.js';

export function headingTextToPlain(text: string): string {
  return headingTitlePlain(text);
}

// In buildSlugRegistry loop:
const parsed = parseAtxHeading(line);
if (!parsed) continue;
const level = parsed.level;
const rawTitle = stripPandocAnchors(parsed.title).replace(/\*\*/g, '').trim();
```

Delete local `HEADING_RE` and `\{#.*?\}` replaces. Keep `CHAPTER_KEY_RE` (Phase B).

- [ ] **Step 2: Run refs + full redos budget**

```bash
pnpm --filter @bwilliamson/mdcp-core exec vitest run \
  test/refs.test.ts test/redos-budget.test.ts test/markdown-helpers.test.ts
```

Expected: **all PASS** (all three budget demos green).

- [ ] **Step 3: Atomic commit**

```bash
git add packages/mdcp-core/src/refs/slugs.ts
git commit -m "$(cat <<'EOF'
refactor: migrate slug registry onto markdown helpers

Replace heading and {#.*?\} regexes in refs/slugs with linear helpers
to clear remaining CodeQL polynomial-redos alerts (#200).

EOF
)"
```

---

### Task 5: Migrate sibling call sites (class-level cleanup)

**Atomic commit:** `refactor: use markdown helpers at remaining heading/anchor sites`

**Files:**
- Modify: `packages/mdcp-core/src/compile/compile-title.ts`
- Modify: `packages/mdcp-core/src/compile/shard-cache.ts`
- Modify: `packages/mdcp-core/src/links/validate-shards.ts`
- Modify: `packages/mdcp-core/src/xrefs/lint.ts` (heading skip only)

**Interfaces:**
- Consumes: `parseAtxHeading`, `isAtxHeading`, `stripPandocAnchors`
- Produces: unchanged public functions from `compile-title.ts`

- [ ] **Step 1: `compile-title.ts`**

Rewrite `extractFirstHeading` / `stripFirstHeadingLine` without the complex `^#{1,6}\s+(.+?)(?:\s+\{#…)?` regex:

1. Take first line after `trimStart`.
2. `parseAtxHeading(firstLine)`.
3. From `title`, detect trailing `{#id}` with a forward scan (same rules as `stripPandocAnchors`) to split `text` vs `anchor`.
4. `stripFirstHeadingLine`: if `isAtxHeading(lines[0])`, drop first line.

Preserve return shape `{ text, anchor }`.

- [ ] **Step 2: `shard-cache.ts` + `validate-shards.ts`**

Replace:

```typescript
const m = line.match(/^#{1,6}\s+(.+)$/);
const title = m[1].replace(/\{#.*?\}/g, '').replace(/\*\*/g, '').trim();
```

with:

```typescript
const m = parseAtxHeading(line);
if (!m) continue;
const title = stripPandocAnchors(m.title).replace(/\*\*/g, '').trim();
```

- [ ] **Step 3: `xrefs/lint.ts`**

Replace `if (/^#{1,6}\s+/.test(stripped)) continue;` with `if (isAtxHeading(stripped)) continue;`.

- [ ] **Step 4: Full core test suite**

```bash
pnpm build
pnpm --filter @bwilliamson/mdcp-core test
```

Expected: **231+** tests PASS (including new helper / redos files).

- [ ] **Step 5: Atomic commit**

```bash
git add \
  packages/mdcp-core/src/compile/compile-title.ts \
  packages/mdcp-core/src/compile/shard-cache.ts \
  packages/mdcp-core/src/links/validate-shards.ts \
  packages/mdcp-core/src/xrefs/lint.ts
git commit -m "$(cat <<'EOF'
refactor: use markdown helpers at remaining heading/anchor sites

Finish Phase A sprawl cleanup for compile-title, shard-cache,
validate-shards, and xref heading skips (#200).

EOF
)"
```

---

### Task 6: Optional public re-exports + changeset

**Atomic commit:** `chore: changeset for polynomial-ReDoS markdown helpers`

**Files:**
- Modify (optional): `packages/mdcp-core/src/index.ts` — re-export markdown helpers if useful to consumers; **not required** for clearing CodeQL. Prefer skip unless a test/docs need them.
- Create: `.changeset/polynomial-redos-markdown-helpers.md`

- [ ] **Step 1: Add changeset**

```markdown
---
'@bwilliamson/mdcp-core': patch
'@bwilliamson/mdcp-cli': patch
---

Replace polynomial-risk heading and Pandoc `{#id}` regexes with linear shared markdown helpers, clearing CodeQL `js/polynomial-redos` alerts (#200).
```

- [ ] **Step 2: Final verification**

```bash
pnpm build
pnpm --filter @bwilliamson/mdcp-core test
# optional full gate if time permits:
# pnpm run check
```

Expected: core tests green. After merge to `main`, confirm CodeQL alerts #1–#6 close on the next scan.

- [ ] **Step 3: Atomic commit**

```bash
git add .changeset/polynomial-redos-markdown-helpers.md
git commit -m "$(cat <<'EOF'
chore: changeset for polynomial-ReDoS markdown helpers

Patch bump for clearing CodeQL js/polynomial-redos via shared
markdown helpers before the next release (#200).

EOF
)"
```

---

## Atomic commit summary

| # | Commit subject | Deliverable |
| --- | --- | --- |
| 1 | `test: add failing ReDoS budget demos for heading/anchor paths` | Red demos |
| 2 | `feat: add linear markdown helpers for ATX headings and anchors` | Helpers + unit tests |
| 3 | `refactor: migrate anchors and headings onto markdown helpers` | Alerts #1–#3 |
| 4 | `refactor: migrate slug registry onto markdown helpers` | Alerts #4–#6; all budgets green |
| 5 | `refactor: use markdown helpers at remaining heading/anchor sites` | Sibling sprawl |
| 6 | `chore: changeset for polynomial-ReDoS markdown helpers` | Release note |

## Out of scope (Phase B / #201)

- `xrefs/lint.ts` chapter / “See …” patterns  
- `compile/hooks/code-evidence.ts`  
- `compile/section-manifest.ts` dynamic heading regex  
- Link rewrite regexes in `publish-links.ts`  
- ESLint rule banning heading regexes  

## Self-review checklist

- [x] Spec coverage: TDD red→green, helpers, all migrate sites, changeset, CodeQL clear  
- [x] No TBD placeholders in task steps  
- [x] Interface names consistent across tasks (`parseAtxHeading`, `stripPandocAnchors`, `headingTitlePlain`)  
- [x] Each task ends with an atomic commit  
