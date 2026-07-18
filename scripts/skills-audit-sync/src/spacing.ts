export const DEFAULT_MIN_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function shouldSkipScheduledSync(
  lastSuccessfulSyncAt: Date | string | null | undefined,
  now: Date | number = Date.now(),
  minIntervalMs: number = DEFAULT_MIN_INTERVAL_MS,
): boolean {
  if (lastSuccessfulSyncAt == null) {
    return false;
  }

  const lastMs =
    lastSuccessfulSyncAt instanceof Date
      ? lastSuccessfulSyncAt.getTime()
      : typeof lastSuccessfulSyncAt === 'string'
        ? Date.parse(lastSuccessfulSyncAt)
        : lastSuccessfulSyncAt;

  if (Number.isNaN(lastMs)) {
    return false;
  }

  const nowMs = now instanceof Date ? now.getTime() : now;
  return nowMs - lastMs < minIntervalMs;
}
