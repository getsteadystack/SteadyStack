import type { ExecutionContext } from "@cloudflare/workers-types";
import {
  CircuitState,
  DEFAULT_LATENCY_THRESHOLD_MS,
  DEFAULT_SSL_EXPIRY_ALERT_DAYS,
  MonitorStatus as Status,
  NotificationType,
  ProxyError,
  SSL_ALERT_MILESTONES,
} from "./constants";
import { ProxyMesh, QuantumAnomalyDetector } from "./services/mesh";
import { InsightService, InsightType, InsightSeverity } from "./lib/insight-service";
import { performRegionalChecks, getAverageLatency } from "./services/regional-monitor";
import {
  broadcastLiveEvent,
  performCheck,
  recordAlertSent,
  recordLatencyBatchToAggregator,
  shouldSendAlert,
} from "./check-runner";
import { queueNotification } from "./lib/send-notification";
import { evaluateQuorum } from "./services/quorum-engine";
import type { ProbeCheckResult } from "@steadystack/types";
import type { Env } from "./env";

const mesh = new ProxyMesh();

/**
 * Process a batch of monitors: run their checks, persist results, manage
 * incidents, and dispatch notifications.
 *
 * Returns the list of processed monitor IDs and any monitors that could not be
 * processed within the execution window (retried via the queue by the caller).
 */
export async function processBatch(
  monitors: any[],
  prisma: any,
  env: Env,
  ctx: ExecutionContext,
): Promise<{ processed: string[]; remaining: any[] }> {
  console.log(`Processing batch of ${monitors.length} monitors...`);

  const { FallbackQueue } = await import("./lib/fallback-queue");
  const { DatabaseCircuitBreaker } = await import("./lib/circuit-breaker");

  const fallbackQueue = new FallbackQueue(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN);
  const circuitBreaker = new DatabaseCircuitBreaker(
    env.UPSTASH_REDIS_REST_URL,
    env.UPSTASH_REDIS_REST_TOKEN,
  );

  const circuitState = await circuitBreaker.getState();

  // Dynamic import since we just created it
  const { IncidentService } = await import("./lib/incident-service");
  const incidentService = new IncidentService(prisma);
  const insightService = new InsightService(prisma);
  // REMOVED: Wall-time limit check.
  // Reason: performance.now() measures wall time (including IO), not CPU time.
  // Cloudflare Free Plan has 10ms CPU limit but allows longer wall time for IO.
  // Using wall time to limit execution caused premature stops and dropped checks because Queues are not available.

  const processedIds: string[] = [];
  const remainingMonitors: any[] = [];

  // --- BULK FETCH DATA START ---
  const monitorIds = monitors.map((m) => m.id);
  const activeIncidentsMap = new Map<string, any>();
  const eventCountsMap = new Map<string, number>();

  // 1. Fetch Active Incidents
  const activeIncidents = await incidentService.findActiveIncidentsForMonitors(monitorIds);
  for (const incident of activeIncidents) {
    // The service returns list ordered by createdAt desc.
    // We want to map monitorId -> latest incident.
    if (!activeIncidentsMap.has(incident.monitorId)) {
      activeIncidentsMap.set(incident.monitorId, incident);
    }
  }

  // 2. Fetch Event Counts (for flapping detection)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const eventCounts = await prisma.monitorEvent.groupBy({
    by: ["monitorId"],
    where: {
      monitorId: { in: monitorIds },
      timestamp: { gt: fiveMinutesAgo },
      status: { not: Status.MAINTENANCE },
    },
    _count: true,
  });

  for (const count of eventCounts) {
    eventCountsMap.set(count.monitorId, count._count);
  }
  // --- BULK FETCH DATA END ---

  for (let i = 0; i < monitors.length; i++) {
    const monitor = monitors[i];

    // --- DYNAMIC THRESHOLDING CALCULATION ---
    let effectiveTimeout = monitor.timeout || 10;
    let capturedLatencies: number[] | undefined;

    if (monitor.dynamicThresholding) {
      try {
        const lastEvents = await prisma.monitorEvent.findMany({
          where: { monitorId: monitor.id, status: Status.UP },
          orderBy: { timestamp: "desc" },
          take: 50, // Get recent events to compute p95
          select: { latency: true },
        });

        if (lastEvents.length >= 10) {
          const latencies = lastEvents.map((e: any) => e.latency);
          capturedLatencies = latencies;
          // Sort ascending to find p95
          const sorted = [...latencies].sort((a: number, b: number) => a - b);
          const p95Index = Math.floor(sorted.length * 0.95);
          const p95Latency = sorted[p95Index];

          // Calc dynamic (p95 + 30% buffer, convert ms to seconds)
          let calcTimeout = (p95Latency * 1.3) / 1000;

          // Enforce bounds min 2, max 30
          if (calcTimeout < 2) calcTimeout = 2;
          if (calcTimeout > 30) calcTimeout = 30;

          effectiveTimeout = calcTimeout;
          console.log(
            `[DynamicThreshold] ${monitor.name}: p95=${p95Latency}ms -> New Timeout=${effectiveTimeout.toFixed(2)}s`,
          );
        }
      } catch (calcErr) {
        console.error(`[DynamicThreshold] Failed to calculate for ${monitor.name}:`, calcErr);
      }
    }

    // Set the resolved timeout on the monitor object for the checks
    monitor.timeout = effectiveTimeout;

    // --- PROCESSING LOGIC START ---
    try {
      // 0. Check for Active Maintenance Window
      const activeWindow = monitor.maintenanceWindows?.[0];
      let maintenanceActive = false;

      if (activeWindow) {
        console.log(
          `[Maintenance] Skipping check for ${monitor.name} (Window: ${activeWindow.startAt} - ${activeWindow.endAt})`,
        );
        maintenanceActive = true;
      }

      // 1. Initial Check
      let result;
      let failedRegions: string[] = [];

      if (maintenanceActive) {
        result = {
          status: Status.MAINTENANCE,
          latency: 0,
          errorReason: undefined,
        };
      } else {
        // Check if regional monitoring is enabled
        if (monitor.checkRegions) {
          try {
            const regionalResults = await performRegionalChecks(monitor, env);
            console.log(
              `[Regional] Checked ${monitor.name} from ${regionalResults.length} regions`,
            );

            // Convert to ProbeCheckResult format for Quorum Consensus Engine
            const probeResults: ProbeCheckResult[] = regionalResults.map((r) => ({
              monitorId: monitor.id,
              probeId: `probe-${r.region}`,
              region: r.region,
              status: r.status === Status.UP ? "UP" : "DOWN",
              latency: r.latency,
              errorReason: r.errorReason,
              errorClass: r.errorClass,
              colo: r.colo,
              asn: r.asn,
              timestamp: r.timestamp.toISOString(),
            }));

            // Evaluate Quorum Consensus with Colocation Deduplication and Provider Partition Breaker
            const quorumEval = evaluateQuorum(monitor.id, probeResults);

            failedRegions = quorumEval.downRegions;
            const isMajorOutage = quorumEval.isGlobalOutage;
            const isDegraded =
              quorumEval.isRegionalDegradation || quorumEval.finalStatus === "DEGRADED";
            const overallStatus = isMajorOutage
              ? Status.DOWN
              : isDegraded
                ? Status.DEGRADED
                : Status.UP;
            const avgLatency = quorumEval.averageLatency || getAverageLatency(regionalResults);

            // AGGRESSIVE AGGREGATION: Smart Filtering to save DB space and CPU
            // We store ALL regional results in the Durable Object (LatencyAggregator) for high-res charts.
            // But in the main DB (MonitorEvent), we only store:
            // 1. The summary "global" result
            // 2. Individual regional results ONLY if they are DOWN (for incident tracking)
            const eventsToCreate = [];

            // Add the summary event
            eventsToCreate.push({
              monitorId: monitor.id,
              status: overallStatus as any,
              latency: avgLatency,
              errorReason: isMajorOutage
                ? `${failedRegions.length} regions failing`
                : isDegraded
                  ? quorumEval.reason ||
                    `${failedRegions.length} regions degraded (${failedRegions.join(", ")})`
                  : undefined,
              region: "global",
              timestamp: new Date(),
            });

            // Store each regional result in LatencyAggregator / DB
            const latencyRecords = regionalResults.map((r) => ({
              monitorId: monitor.id,
              region: r.region,
              latency: r.latency,
              success: r.status === Status.UP,
              timestamp: r.timestamp.getTime(),
            }));

            ctx.waitUntil(recordLatencyBatchToAggregator(env, prisma, latencyRecords, true));

            for (const regionalResult of regionalResults) {
              // Only add to DB if DOWN (to save massive IOPS)
              if (regionalResult.status === Status.DOWN) {
                eventsToCreate.push({
                  monitorId: monitor.id,
                  status: Status.DOWN as any,
                  latency: regionalResult.latency,
                  errorReason: regionalResult.errorReason,
                  region: regionalResult.region,
                  timestamp: regionalResult.timestamp,
                });

                // Manage Regional Incidents
                await incidentService.createRegionalIncident(monitor.id, regionalResult.region);
              } else {
                // Auto-resolve regional incident if previously down
                const activeRegional = await incidentService.findActiveRegionalIncident(
                  monitor.id,
                  regionalResult.region,
                );
                if (activeRegional) {
                  await incidentService.resolveRegionalIncident(activeRegional.id);
                }
              }
            }

            // BATCH CREATE (Highly efficient)
            if (eventsToCreate.length > 0) {
              await prisma.monitorEvent.createMany({
                data: eventsToCreate,
              });
            }

            result = {
              status: overallStatus,
              latency: avgLatency,
              errorReason: isMajorOutage
                ? `${failedRegions.length} regions failing`
                : isDegraded
                  ? quorumEval.reason ||
                    `${failedRegions.length} regions degraded (${failedRegions.join(", ")})`
                  : undefined,
            };
          } catch (regionalError) {
            console.error(
              `[Regional] Failed to perform regional checks for ${monitor.name}:`,
              regionalError,
            );
            // Fallback to single check
            result = await performCheck(monitor, env, prisma);
          }
        } else {
          // Standard single-region check
          result = await performCheck(monitor, env, prisma);

          // Store single-region latency measurement
          ctx.waitUntil(
            recordLatencyBatchToAggregator(
              env,
              prisma,
              [
                {
                  monitorId: monitor.id,
                  region: "global",
                  latency: result.latency,
                  success: result.status === Status.UP,
                  timestamp: Date.now(),
                },
              ],
              true,
            ),
          );
        }

        // 2. Multi-Vector Verification Protocol (Retry & Proxy on Failure)
        if (
          result.status === Status.DOWN &&
          monitor.status !== Status.DOWN &&
          !monitor.checkRegions
        ) {
          console.warn(
            `[MultiVector] First check failed for ${monitor.name} (${monitor.url}). Executing Multi-Vector Verification...`,
          );

          // Wait 1000ms before retry
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Base retry from current region
          let retryResult = await performCheck(monitor, env, prisma);

          // If still DOWN locally and it's an HTTP check, try from an external proxy (Region B)
          if (
            retryResult.status === Status.DOWN &&
            monitor.url.startsWith("http") &&
            monitor.type !== "BROWSER"
          ) {
            try {
              console.log(
                `[MultiVector] Local check confirmed DOWN. Attempting fallback via Component 18-1-0 (Proxy Mesh)...`,
              );
              const proxyResult = await mesh.component_18_1_0(monitor.url, 5000);

              if (proxyResult.status === Status.UP) {
                console.log(
                  `[MultiVector] Component 18-1-0 reported UP! False positive averted for ${monitor.name}. Mesh Load: OK.`,
                );
                retryResult.status = Status.UP;
                delete retryResult.errorReason;
              } else {
                // KEY FIX: If the PROXY itself failed (not the target), don't use this as
                // confirmation of DOWN. Proxy failures (CORS blocks, scraper bans, etc.) are
                // unreliable signals for sites like Google that block these proxy services.
                const isProxyFailure =
                  proxyResult.error === ProxyError.PROXY_UNAVAILABLE ||
                  proxyResult.error === ProxyError.PROXY_FETCH_FAILED ||
                  proxyResult.error === ProxyError.MESH_CONGESTION_FAILSAFE ||
                  proxyResult.error === ProxyError.MESH_TIMEOUT;

                if (isProxyFailure) {
                  console.warn(
                    `[MultiVector] Component 18-1-0 proxy itself failed (${proxyResult.error}), not a target failure. Skipping as inconclusive.`,
                  );
                  // Don't use a broken proxy as evidence of DOWN — skip to secondary
                } else {
                  console.log(
                    `[MultiVector] Component 18-1-0 target confirmed DOWN. Trying secondary vector Component 18-1-1...`,
                  );
                }

                const secondaryProxy = await mesh.component_18_1_1(monitor.url, 5000);
                if (secondaryProxy.status === Status.UP) {
                  console.log(
                    `[MultiVector] Component 18-1-1 reported UP! False positive averted for ${monitor.name}.`,
                  );
                  retryResult.status = Status.UP;
                  delete retryResult.errorReason;
                } else {
                  // Check if secondary proxy also just failed at the proxy level
                  const isSecondaryProxyFailure =
                    secondaryProxy.error === ProxyError.MESH_TIMEOUT ||
                    secondaryProxy.error === ProxyError.MESH_CONGESTION_FAILSAFE;

                  if (isProxyFailure && isSecondaryProxyFailure) {
                    // BOTH proxies failed at the infrastructure level — this is a proxy network
                    // problem, NOT a confirmed target outage. Treat as inconclusive → keep UP.
                    console.warn(
                      `[MultiVector] Both proxy vectors failed at infrastructure level for ${monitor.name}. ` +
                        `Cannot confirm DOWN without reliable external verification. Treating as UP (false-positive prevention).`,
                    );
                    retryResult.status = Status.UP;
                    delete retryResult.errorReason;
                  } else {
                    console.log(
                      `[MultiVector] Component 18-1-1 also DOWN. Trying final High-Fidelity Vector 19-3-1...`,
                    );
                    // Use captured latencies for quantum verification if available
                    const finalVector = await mesh.component_19_3_1(
                      monitor.url,
                      capturedLatencies || [],
                      2000,
                    );
                    if (finalVector.status === Status.UP) {
                      console.log(
                        `[MultiVector] Component 19-3-1 reported UP! False positive averted for ${monitor.name}. (Anomaly: ${finalVector.anomaly?.isAnomaly})`,
                      );
                      retryResult.status = Status.UP;
                      delete retryResult.errorReason;
                    } else {
                      console.warn(
                        `[MultiVector] ALL verification vectors (Local, Retry, 18-1-0, 18-1-1, 19-3-1) confirmed DOWN for ${monitor.name}.`,
                      );
                    }
                  }
                }
              }
            } catch (err) {
              console.warn(`[MultiVector] Mesh verification failed, preserving DOWN state:`, err);
            }
          }

          result = retryResult;
          console.log(
            `[MultiVector] Final verification result for ${monitor.name}: ${result.status}`,
          );
        }
      }

      const { status: currentStatus, latency, errorReason, daysRemaining, issuer } = result;

      // --- QUANTUM ANOMALY DETECTION (Invisible AI) ---
      if (capturedLatencies) {
        const anomaly = QuantumAnomalyDetector.detect(latency, capturedLatencies);
        if (anomaly.isAnomaly) {
          console.warn(
            `[Mesh] QUANTUM ANOMALY detected for ${monitor.name}! Z-Score: ${anomaly.score}`,
          );

          // Store insight
          await insightService.createInsight({
            monitorId: monitor.id,
            type: InsightType.ANOMALY,
            severity: anomaly.score > 5 ? InsightSeverity.CRITICAL : InsightSeverity.WARNING,
            message: `Latency Anomaly Detected: ${monitor.name} is performing significantly outside expected baseline (Z-Score: ${anomaly.score}).`,
            metadata: { score: anomaly.score, latency },
          });
        }

        // Periodically run heuristic advice (every ~10 checks)
        if (Math.random() < 0.1) {
          try {
            const recentEvents = await prisma.monitorEvent.findMany({
              where: { monitorId: monitor.id, status: Status.UP },
              orderBy: { timestamp: "desc" },
              take: 20,
            });
            await insightService.analyzeAndProvideAdvice(monitor.id, monitor.name, recentEvents);
          } catch (e) {
            console.error(`[InsightAdvice] Failed for ${monitor.name}:`, e);
          }
        }
      }

      // Circuit Breaker Calculation
      let nextCheckTime = new Date(Date.now() + (monitor.interval || 60) * 1000);

      if (currentStatus === Status.DOWN) {
        try {
          const activeIncident = await incidentService.findActiveIncident(monitor.id);
          if (activeIncident) {
            const downtimeDuration = Date.now() - activeIncident.createdAt.getTime();
            const ONE_HOUR = 60 * 60 * 1000;

            if (downtimeDuration > ONE_HOUR) {
              console.log(
                `[CircuitBreaker] Monitor ${monitor.id} down for >1h. Applying 10m backoff.`,
              );
              const BACKOFF_INTERVAL = 10 * 60 * 1000; // 600s
              nextCheckTime = new Date(Date.now() + BACKOFF_INTERVAL);
            }
          }
        } catch (cbError) {
          console.error(`[CircuitBreaker] Error checking incident duration:`, cbError);
        }
      }

      // --- PERSISTENCE: Save result and update monitor ---
      const persistUpdate = async () => {
        try {
          if (circuitState === CircuitState.OPEN) {
            throw new Error("CircuitBreaker: OPEN. Avoiding database writes.");
          }

          const isRegional = Boolean(monitor.checkRegions);

          const executePersistence = async (retry: boolean = true): Promise<void> => {
            try {
              if (!isRegional) {
                // For standard single-origin monitors, record the check event and update monitor
                await prisma.$transaction(
                  [
                    prisma.monitorEvent.create({
                      data: {
                        monitorId: monitor.id,
                        status: currentStatus as any,
                        latency: latency,
                        errorReason: errorReason,
                        region: "global",
                        timestamp: new Date(),
                      },
                    }),
                    prisma.monitor.update({
                      where: { id: monitor.id },
                      data: {
                        status: currentStatus as any,
                        lastCheck: new Date(),
                        nextCheck: nextCheckTime,
                      },
                    }),
                  ],
                  { maxWait: 5000, timeout: 10000 },
                );
              } else {
                // Regional checks already wrote summary & incident events in batch (line 252).
                // Update monitor metadata directly to avoid duplicate event records.
                await prisma.monitor.update({
                  where: { id: monitor.id },
                  data: {
                    status: currentStatus as any,
                    lastCheck: new Date(),
                    nextCheck: nextCheckTime,
                  },
                });
              }
            } catch (txErr: any) {
              if (
                retry &&
                (txErr.message?.includes("Unable to start a transaction") ||
                  txErr.message?.includes("timeout") ||
                  txErr.message?.includes("Connection terminated") ||
                  txErr.message?.includes("performIO"))
              ) {
                await new Promise((r) => setTimeout(r, 100));
                return await executePersistence(false);
              }
              throw txErr;
            }
          };

          await executePersistence();

          // Successfully saved - if we were in HALF_OPEN, we can now mark as healthy
          if (circuitState === CircuitState.HALF_OPEN) {
            await circuitBreaker.recordSuccess();
          }
        } catch (dbErr: any) {
          console.error(`[Persistence] Primary DB failure for ${monitor.name}:`, dbErr.message);

          // Record failure to circuit breaker (may trip)
          await circuitBreaker.recordFailure(dbErr);

          // Fallback to Redis for the Event (durability)
          await fallbackQueue.push({
            monitorId: monitor.id,
            status: currentStatus,
            latency: latency,
            errorReason: errorReason,
            timestamp: new Date().toISOString(),
          });
        }
      };

      // We usually want to await this to ensure sequential processing in the batch if needed
      // but in a serverless env, we can fire-and-forget IF we wrap it in waitUntil,
      // however here we are in a loop so it's safer to await to avoid overwhelming the worker's open sockets.
      await persistUpdate();

      // BROADCAST LIVE EVENT
      broadcastLiveEvent(
        env,
        monitor.id,
        {
          type: NotificationType.CHECK_RESULT,
          monitorId: monitor.id,
          status: currentStatus,
          latency: latency,
          region: "global", // Default for now, update if regional
          timestamp: new Date().getTime(),
        },
        ctx,
      );

      // --- SSL EXPIRY ALERTS ---
      if (daysRemaining !== undefined && env) {
        const matchingMilestone = SSL_ALERT_MILESTONES.find((m) => daysRemaining <= m);

        if (matchingMilestone !== undefined) {
          const redisKey = `ssl_alert:${monitor.id}:${matchingMilestone}`;
          let alreadySent = false;

          if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
            try {
              const redisUrl = `${env.UPSTASH_REDIS_REST_URL}/get/${redisKey}`;
              const redisRes = await fetch(redisUrl, {
                headers: {
                  Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
                },
              });
              if (redisRes.ok) {
                const redisData = (await redisRes.json()) as any;
                if (redisData.result) {
                  alreadySent = true;
                }
              }
            } catch (err) {
              console.error("[SSL Expiry] Failed to query Redis cache:", err);
            }
          }

          if (!alreadySent) {
            const sslRules = (monitor.alertRules || []).filter(
              (rule: any) => rule.trigger === "SSL_EXPIRY" && rule.enabled,
            );

            // Trigger if custom rules exist or by default if days remaining <= 7
            const shouldAlert =
              sslRules.length > 0 || daysRemaining <= DEFAULT_SSL_EXPIRY_ALERT_DAYS;

            if (shouldAlert) {
              console.log(
                `[SSL Expiry Alert] Monitor ${monitor.name} certificate expires in ${daysRemaining} days (Milestone: ${matchingMilestone}d)`,
              );

              await queueNotification(
                env,
                {
                  type: NotificationType.SSL_EXPIRY,
                  monitorId: monitor.id,
                  monitorName: monitor.name,
                  url: monitor.url,
                  status: currentStatus as "UP" | "DOWN",
                  reason: `SSL certificate expires in ${daysRemaining} days (Issuer: ${issuer || "Unknown"})`,
                  timestamp: new Date().toISOString(),
                  daysRemaining,
                },
                ctx,
              );

              await recordAlertSent(monitor.id, env);

              if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
                try {
                  const setUrl = `${env.UPSTASH_REDIS_REST_URL}/set/${redisKey}/sent/EX/604800`;
                  await fetch(setUrl, {
                    headers: {
                      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
                    },
                  });
                } catch (err) {
                  console.error("[SSL Expiry] Failed to save to Redis cache:", err);
                }
              }
            }
          }
        }
      }

      // --- INCIDENT MANAGEMENT ---
      if (currentStatus === Status.DOWN && !maintenanceActive) {
        const activeIncident = activeIncidentsMap.get(monitor.id);
        const alertable = await shouldSendAlert(monitor.id, eventCountsMap, env, prisma);

        if (!activeIncident && alertable) {
          // CREATE NEW INCIDENT
          const incident = await incidentService.createIncident(
            monitor.id,
            `Monitor is DOWN: ${monitor.name}`,
            errorReason ? `Reason: ${errorReason}` : "No error details provided.",
          );

          // Notify (CREATED)
          await queueNotification(
            env,
            {
              type: NotificationType.INCIDENT_CREATED,
              monitorId: monitor.id,
              monitorName: monitor.name,
              url: monitor.url,
              status: Status.DOWN,
              incidentId: incident.id,
              reason: errorReason,
              runbookUrl: monitor.runbookUrl,
              timestamp: new Date().toISOString(),
              failedRegions: failedRegions.length > 0 ? failedRegions : undefined,
            },
            ctx,
          );

          await recordAlertSent(monitor.id, env);
        } else if (activeIncident) {
          // Still DOWN
          await incidentService.logStillDown(activeIncident.id);
        }
      } else if (currentStatus === Status.DEGRADED && !maintenanceActive) {
        const activeIncident = activeIncidentsMap.get(monitor.id);
        const alertable = await shouldSendAlert(monitor.id, eventCountsMap, env, prisma);

        if (!activeIncident && alertable) {
          // CREATE DEGRADATION INCIDENT
          const incident = await incidentService.createIncident(
            monitor.id,
            `[DEGRADED] ${monitor.name}: ${failedRegions.length} Region(s) Failing`,
            errorReason || `Regional degradation detected in: ${failedRegions.join(", ")}`,
          );

          // Notify (REGIONAL_DEGRADATION)
          await queueNotification(
            env,
            {
              type: NotificationType.REGIONAL_DEGRADATION,
              monitorId: monitor.id,
              monitorName: monitor.name,
              url: monitor.url,
              status: Status.DEGRADED,
              incidentId: incident.id,
              reason:
                errorReason || `Regional degradation detected in: ${failedRegions.join(", ")}`,
              runbookUrl: monitor.runbookUrl,
              timestamp: new Date().toISOString(),
              failedRegions: failedRegions.length > 0 ? failedRegions : undefined,
            },
            ctx,
          );

          await recordAlertSent(monitor.id, env);
        } else if (activeIncident) {
          await incidentService.logStillDown(activeIncident.id);
        }
      } else if (currentStatus === Status.UP && !maintenanceActive) {
        const activeIncident = activeIncidentsMap.get(monitor.id);

        if (activeIncident) {
          // RESOLVE INCIDENT
          await incidentService.resolveIncident(activeIncident.id);

          // Notify (RESOLVED)
          await queueNotification(
            env,
            {
              type: NotificationType.INCIDENT_RESOLVED,
              monitorId: monitor.id,
              monitorName: monitor.name,
              url: monitor.url,
              status: Status.UP,
              incidentId: activeIncident.id,
              timestamp: new Date().toISOString(),
            },
            ctx,
          );

          await recordAlertSent(monitor.id, env);
        } else {
          // CHECK FOR CUSTOM ALERT RULES (Latency Thresholds)
          const latencyRule = monitor.alertRules?.find(
            (r: any) => r.trigger === "LATENCY" && r.enabled,
          );

          const threshold = latencyRule?.threshold || DEFAULT_LATENCY_THRESHOLD_MS; // Default to 1000ms if no rule
          const comparison = latencyRule?.comparison || "GT";

          const isHighLatency = comparison === "GT" ? latency > threshold : latency < threshold;

          if (isHighLatency) {
            // HIGH LATENCY ALERT
            await queueNotification(
              env,
              {
                type: NotificationType.HIGH_LATENCY,
                monitorId: monitor.id,
                monitorName: monitor.name,
                url: monitor.url,
                status: Status.UP,
                latency: latency,
                timestamp: new Date().toISOString(),
                reason: `High Latency: ${latency}ms (Threshold: ${threshold}ms)`,
              },
              ctx,
            );

            await recordAlertSent(monitor.id, env);
          }
        }
      }
      // --- DNS CACHE CAPTURE: Store last known good IP ---
      if (currentStatus === Status.UP && env.DNS_CACHE) {
        try {
          const urlObj = new URL(monitor.url);
          const hostname = urlObj.hostname;

          // We only resolve if it's not a raw IP already
          if (!/^[0-9.]+$/.test(hostname)) {
            // We don't await this to keep the check loop fast
            const { resolveDNS } = await import("./lib/dns-resolver");
            resolveDNS(hostname)
              .then((ip) => {
                if (ip && env.DNS_CACHE) {
                  env.DNS_CACHE.put(
                    `dns:${hostname}`,
                    JSON.stringify({ ip, timestamp: Date.now() }),
                    {
                      expirationTtl: 60 * 60 * 24, // 24 hours
                    },
                  );
                }
              })
              .catch(() => {});
          }
        } catch (dnsErr) {
          // Silently ignore DNS capture failures
        }
      }

      processedIds.push(monitor.id);
      console.log(`Checked ${monitor.url}: ${currentStatus} (${latency}ms)`);
    } catch (err) {
      console.error(`Failed to process monitor ${monitor.id}:`, err);
      // We count it as processed (failed) to avoid infinite retry loops for bad data
      // Unless it's a timeout error, which might be retryable
      processedIds.push(monitor.id);
    }
  }

  return { processed: processedIds, remaining: remainingMonitors };
}
