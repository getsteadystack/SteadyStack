import { FallbackQueue } from "../lib/fallback-queue";

/**
 * Service to drain the Redis fallback queue into the primary database.
 * This should be called by a background cron job once the DB is presumed healthy.
 */
export async function syncFallbackToDatabase(prisma: any, env: any) {
  const fallback = new FallbackQueue(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN);

  const totalCount = await fallback.getQueueLength();
  if (totalCount === 0) return;

  console.log(`[Sync] Detected ${totalCount} items in fallback queue. Starting drain...`);

  // Drain a sizeable batch. We limit this to ensure we don't exceed Worker execution time limits.
  const BATCH_SIZE = 50;
  const items = await fallback.popBatch(BATCH_SIZE);

  let successCount = 0;

  try {
    // Attempt to process the entire batch in a single transaction to reduce N+1 queries
    const eventsData = items.map((item) => ({
      monitorId: item.monitorId,
      status: item.status as any,
      latency: item.latency,
      errorReason: item.errorReason,
      timestamp: new Date(item.timestamp),
    }));

    const updatePromises = items.map((item) =>
      prisma.monitor.update({
        where: { id: item.monitorId },
        data: {
          status: item.status as any,
          lastCheck: new Date(item.timestamp),
          // Note: We deliberately DON'T update nextCheck here, as the active monitor worker
          // should be handling the schedule.
        },
      }),
    );

    await prisma.$transaction([
      prisma.monitorEvent.createMany({ data: eventsData }),
      ...updatePromises,
    ]);

    successCount = items.length;
  } catch (batchErr: any) {
    console.warn(
      `[Sync] Batch sync failed, falling back to sequential processing:`,
      batchErr.message,
    );

    for (const item of items) {
      try {
        // Use a transaction to ensure both the event is created and the monitor status is updated
        await prisma.$transaction([
          prisma.monitorEvent.create({
            data: {
              monitorId: item.monitorId,
              status: item.status as any,
              latency: item.latency,
              errorReason: item.errorReason,
              timestamp: new Date(item.timestamp),
            },
          }),
          prisma.monitor.update({
            where: { id: item.monitorId },
            data: {
              status: item.status as any,
              lastCheck: new Date(item.timestamp),
              // Note: We deliberately DON'T update nextCheck here, as the active monitor worker
              // should be handling the schedule.
            },
          }),
        ]);
        successCount++;
      } catch (err: any) {
        console.error(`[Sync] Failed to sync item for monitor ${item.monitorId}:`, err.message);

        // If it's a transient DB error, we could ideally put it back, but that risks a loop.
        // For now, we rely on the next cron run for other items.
      }
    }
  }

  console.log(
    `[Sync] Successfully restored ${successCount}/${items.length} items to primary database.`,
  );
}
