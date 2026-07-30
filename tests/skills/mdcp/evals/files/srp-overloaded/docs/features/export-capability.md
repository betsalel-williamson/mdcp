# Export capability

## How end users export results

1. Open Settings → Export.
2. Choose CSV or JSON.
3. Click Download. The file lands in your Downloads folder.

## How the export pipeline works (architecture)

Export jobs are queued per workspace. A worker reads the queue, materializes rows, and writes an artifact URL. Rate limits apply per plan tier. The worker retries failed jobs with exponential backoff.

## Temporary notes / discovery (week of ship)

- Spike: maybe stream rows instead of buffering — undecided
- Ticket EXP-221: dual-write old and new export stores until Friday
- PM asked to keep “everything about export” in one file so agents find it faster
