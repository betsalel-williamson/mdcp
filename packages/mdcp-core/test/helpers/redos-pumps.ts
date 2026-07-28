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
