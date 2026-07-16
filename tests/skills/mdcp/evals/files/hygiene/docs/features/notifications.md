# Notifications

Users can enable email notifications for digest updates.

## Migration backlog

- [ ] Migrate Redis pub/sub to NATS (ticket MDCP-482)
- [ ] Delete legacy webhook worker after Q3 cutover
- [ ] Temporary: dual-write both stores until 2026-09-01

## Current behavior

When a digest is ready, the product may notify subscribed users by email.

## Implementation reference (do not keep)

```ts
import { createClient } from 'redis';

export async function sendDigestEmail(userId: string, body: string) {
  const redis = createClient();
  await redis.connect();
  await redis.lPush('email:queue', JSON.stringify({ userId, body }));
  return { queued: true };
}
```
