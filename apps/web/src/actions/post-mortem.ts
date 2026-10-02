"use server";

import prisma from "@steadystack/db";
import { getSafeSession } from "@/lib/safe-session";
import { getActiveWorkspace } from "@/actions/team";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { getAIProviderClient } from "@/lib/ai";
import {
  indexIncidentPostMortem,
  querySimilarIncidents,
  deleteIncidentVector,
  isPineconeConfigured,
  getWorkspaceNamespace,
  getPineconeNamespaceStats,
  type IncidentQueryResult,
} from "@/lib/pinecone";

async function getMonitorAccessScope(userId: string) {
  const active = await getActiveWorkspace();
  if (active?.id) {
    return {
      organizationId: active.id,
    };
  }
  return { userId, organizationId: null };
}

/**
 * Strips email greetings, placeholders, and signature boilerplate
 * that some LLMs inadvertently append.
 */
function cleanPostMortemText(text: string): string {
  return text
    .replace(/^(\s*Dear\s+Team\s*,?\s*|\s*To\s+whom\s+it\s+may\s+concern\s*,?\s*)/i, "")
    .replace(
      /(\n\s*(Best regards|Regards|Sincerely|Thanks|Cheers|Warm regards),?\s*\n(\[?Your Name\]?|SRE Team|SteadyStack SRE|DevOps Team)[\s\S]*)$/i,
      "",
    )
    .trim();
}

export async function checkPineconeStatus() {
  const session = await getSafeSession();
  const activeWorkspace = await getActiveWorkspace();
  const configured = isPineconeConfigured();
  const indexName = process.env.PINECONE_INDEX_NAME || "steadystack-incidents";
  const workspaceId = activeWorkspace?.id || session?.user?.id || "default";
  const namespace = getWorkspaceNamespace(workspaceId);
  const stats = await getPineconeNamespaceStats(workspaceId);

  return {
    isConfigured: configured,
    indexName,
    namespace,
    totalRecords: stats.totalRecords,
    namespaceRecords: stats.namespaceRecords,
  };
}

export async function getPostMortem(incidentId: string) {
  const session = await getSafeSession();
  if (!session?.user) return null;

  const monitorScope = await getMonitorAccessScope(session.user.id);

  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        monitor: monitorScope,
      },
    });

    if (!incident) return null;

    const postMortem = await prisma.postMortem.findUnique({
      where: {
        incidentId,
      },
    });

    return postMortem;
  } catch (error) {
    console.error("Failed to fetch post-mortem", error);
    return null;
  }
}

export async function upsertPostMortem(
  incidentId: string,
  data: {
    summary?: string;
    rootCause?: string;
    impactScope?: string;
    detectionMethod?: string;
    timeline?: string;
    actionItems?: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  },
) {
  const session = await getSafeSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const monitorScope = await getMonitorAccessScope(session.user.id);

  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        monitor: monitorScope,
      },
      include: {
        monitor: {
          select: {
            name: true,
            url: true,
            userId: true,
            organizationId: true,
          },
        },
      },
    });

    if (!incident) return { success: false, error: "Incident not found" };

    const statusValue: "DRAFT" | "PUBLISHED" | "ARCHIVED" =
      data.status === "PUBLISHED" || data.status === "ARCHIVED" ? data.status : "DRAFT";

    const cleanPayload = {
      summary: data.summary || "",
      rootCause: data.rootCause || "",
      impactScope: data.impactScope || "",
      detectionMethod: data.detectionMethod || "",
      timeline: data.timeline || "",
      actionItems: data.actionItems || "",
      status: statusValue,
    };

    const postMortem = await prisma.postMortem.upsert({
      where: {
        incidentId,
      },
      create: {
        incidentId,
        ...cleanPayload,
      },
      update: {
        ...cleanPayload,
      },
    });

    const workspaceId = incident.monitor.organizationId || incident.monitor.userId;

    // Synchronize vector in Pinecone index safely
    try {
      if (statusValue === "PUBLISHED") {
        indexIncidentPostMortem({
          workspaceId,
          incidentId,
          title: incident.title,
          rootCause: cleanPayload.rootCause || "Resolved incident",
          summary: cleanPayload.summary || incident.title,
          impactScope: cleanPayload.impactScope,
          actionItems: cleanPayload.actionItems,
          detectionMethod: cleanPayload.detectionMethod,
          status: statusValue,
          monitorName: incident.monitor.name,
          monitorUrl: incident.monitor.url,
          resolvedAt: incident.resolvedAt,
          createdAt: postMortem.createdAt,
        }).catch((err) => {
          console.warn("[Pinecone] Async index post-mortem failed:", err);
        });
      } else if (statusValue === "ARCHIVED") {
        deleteIncidentVector(workspaceId, incidentId).catch((err) => {
          console.warn("[Pinecone] Async delete vector failed:", err);
        });
      }
    } catch (vectorErr) {
      console.warn("[Pinecone] Vector synchronization warning:", vectorErr);
    }

    revalidatePath(`/dashboard/incidents/${incidentId}`);
    return { success: true, postMortem };
  } catch (error: any) {
    console.error("Failed to upsert post-mortem:", error);
    return {
      success: false,
      error: error?.message || "Failed to save post-mortem",
    };
  }
}

export async function generatePostMortemSummary(incidentId: string) {
  const session = await getSafeSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const monitorScope = await getMonitorAccessScope(session.user.id);

  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        monitor: monitorScope,
      },
      include: {
        events: {
          orderBy: {
            createdAt: "asc",
          },
        },
        monitor: {
          select: {
            name: true,
            url: true,
            userId: true,
            organizationId: true,
          },
        },
      },
    });

    if (!incident) return { success: false, error: "Incident not found" };

    const workspaceId = incident.monitor.organizationId || incident.monitor.userId;
    const aiClient = getAIProviderClient({
      feature: "post-mortem-summary",
      userId: session.user.id,
      workspaceId,
    });

    const eventsText = incident.events
      .map((e) => `[${e.createdAt.toISOString()}] ${e.type}: ${e.message}`)
      .join("\n");

    // Fetch similar past incidents from Pinecone for RAG context
    let similarIncidents: IncidentQueryResult[] = [];
    try {
      similarIncidents = await querySimilarIncidents({
        workspaceId,
        queryText: `${incident.title}\n${incident.monitor.name}\n${eventsText}`,
        topK: 3,
      });
    } catch (e) {
      console.warn("[Pinecone] Failed to query similar incidents:", e);
    }

    const ragContext =
      similarIncidents.length > 0
        ? similarIncidents
            .map(
              (inc) =>
                `- [Similar Past Incident "${inc.metadata.title}"] (Similarity: ${Math.round(inc.score * 100)}%)\n  * Past Root Cause: ${inc.metadata.rootCause}\n  * Past Resolution: ${inc.metadata.actionItems || inc.metadata.summary || "Resolved"}`,
            )
            .join("\n")
        : "";

    const prompt = `You are a Principal Site Reliability Engineer (SRE) and distributed systems architect.
Write a concise, professional executive summary for an Incident Post-Mortem.

INCIDENT DETAILS:
- Title: ${incident.title}
- Service: ${incident.monitor.name} (${incident.monitor.url})
- Outage Start: ${incident.startedAt.toISOString()}
- Outage Resolution: ${incident.resolvedAt ? incident.resolvedAt.toISOString() : "Ongoing"}

AUDIT TIMELINE SAMPLES:
${eventsText || "No granular event logs recorded."}
${ragContext ? `\nHISTORICAL PINECONE INCIDENT MEMORY (RAG CONTEXT):\n${ragContext}\n` : ""}

CRITICAL FORMATTING INSTRUCTIONS:
- Return ONLY 2-3 structured markdown paragraphs summarizing what happened, the blast radius, timeline, and how it was resolved.
- DO NOT include email greetings ("Dear Team"), sign-offs ("Best regards", "[Your Name]", "SRE Team"), or letter headers.
- Do NOT wrap in generic quotes.`;

    if (aiClient) {
      const { text } = await generateText({
        model: aiClient.model,
        prompt,
      });

      const cleanedSummary = cleanPostMortemText(text);

      return {
        success: true,
        summary: cleanedSummary,
        similarIncidentsCount: similarIncidents.length,
        similarIncidents,
      };
    }

    // Heuristic fallback if no LLM configured
    const summary =
      `Executive Summary for Incident "${incident.title}"\n\n` +
      `On ${incident.startedAt.toUTCString()}, an outage occurred on ${incident.monitor.name} (${incident.monitor.url}). ` +
      `Telemetry recorded ${incident.events.length} incident lifecycle events before full recovery at ${incident.resolvedAt ? incident.resolvedAt.toUTCString() : "current timestamp"}.\n\n` +
      `Remediation actions restored normal edge routing and endpoint response latency within nominal thresholds.`;

    return {
      success: true,
      summary,
      similarIncidentsCount: similarIncidents.length,
      similarIncidents,
    };
  } catch (error) {
    console.error("Failed to generate summary", error);
    return { success: false, error: "Failed to generate summary" };
  }
}

/**
 * Generates a complete, multi-field SRE post-mortem synthesis (Summary, Root Cause,
 * Impact Scope, Detection Strategy, Action Items) with Pinecone RAG context.
 */
export async function generateFullPostMortemAI(incidentId: string) {
  const session = await getSafeSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const monitorScope = await getMonitorAccessScope(session.user.id);

  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        monitor: monitorScope,
      },
      include: {
        events: {
          orderBy: {
            createdAt: "asc",
          },
        },
        monitor: {
          select: {
            name: true,
            url: true,
            type: true,
            userId: true,
            organizationId: true,
          },
        },
      },
    });

    if (!incident) return { success: false, error: "Incident not found" };

    const workspaceId = incident.monitor.organizationId || incident.monitor.userId;
    const aiClient = getAIProviderClient({
      feature: "post-mortem-full-synthesis",
      userId: session.user.id,
      workspaceId,
    });

    const eventsText = incident.events
      .map((e) => `[${e.createdAt.toISOString()}] ${e.type}: ${e.message}`)
      .join("\n");

    let similarIncidents: IncidentQueryResult[] = [];
    try {
      similarIncidents = await querySimilarIncidents({
        workspaceId,
        queryText: `${incident.title}\n${incident.monitor.name}\n${eventsText}`,
        topK: 3,
      });
    } catch (e) {
      console.warn("[Pinecone] Failed to query similar incidents:", e);
    }

    const ragContext =
      similarIncidents.length > 0
        ? similarIncidents
            .map(
              (inc) =>
                `- [Similar Past Incident "${inc.metadata.title}"] (Similarity: ${Math.round(inc.score * 100)}%)\n  * Past Root Cause: ${inc.metadata.rootCause}\n  * Past Fix: ${inc.metadata.actionItems || inc.metadata.summary}`,
            )
            .join("\n")
        : "";

    if (aiClient) {
      const prompt = `You are a Principal SRE creating a decision-complete Incident Post-Mortem breakdown.
Analyze the following incident and telemetry:

SERVICE: ${incident.monitor.name} (${incident.monitor.url}, Protocol: ${incident.monitor.type})
INCIDENT TITLE: ${incident.title}
STARTED: ${incident.startedAt.toISOString()}
RESOLVED: ${incident.resolvedAt ? incident.resolvedAt.toISOString() : "Ongoing"}

AUDIT EVENTS:
${eventsText || "No events logged."}
${ragContext ? `\nHISTORICAL PINECONE MEMORY (SIMILAR PAST OUTAGES):\n${ragContext}\n` : ""}

Return a STRICT raw JSON object (without markdown blocks or backticks) with exactly these fields:
{
  "summary": "Executive narrative explaining the chronological event flow and operational impact (2 paragraphs, no email greetings or signatures)",
  "rootCause": "Detailed technical root cause analysis (e.g. edge proxy timeout, DNS propagation failure, database pool exhaustion, upstream 502)",
  "impactScope": "Quantified blast radius including impacted regions, customer traffic degradation, and downtime duration",
  "detectionMethod": "How the anomaly was flagged by SteadyStack edge probes and how to detect it earlier",
  "actionItems": "- [ ] Immediate mitigation\n- [ ] Architectural preventive measure\n- [ ] Alert threshold tuning"
}`;

      try {
        const { text } = await generateText({
          model: aiClient.model,
          prompt,
          maxOutputTokens: 1200,
        });

        const cleanJson = text
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/\s*```$/i, "");
        const parsed = JSON.parse(cleanJson);

        return {
          success: true,
          data: {
            summary: cleanPostMortemText(parsed.summary || ""),
            rootCause: cleanPostMortemText(parsed.rootCause || ""),
            impactScope: cleanPostMortemText(parsed.impactScope || ""),
            detectionMethod: cleanPostMortemText(parsed.detectionMethod || ""),
            actionItems: parsed.actionItems || "",
          },
          similarIncidents,
        };
      } catch (parseError) {
        console.warn("[AI] JSON parsing failed, using fallback summary", parseError);
      }
    }

    // Heuristic fallback
    return {
      success: true,
      data: {
        summary: `Executive Summary for Incident "${incident.title}"\n\nOn ${incident.startedAt.toUTCString()}, an outage was detected on ${incident.monitor.name} (${incident.monitor.url}). Telemetry recorded ${incident.events.length} lifecycle events prior to full restoration.`,
        rootCause: `Primary failure vector identified as anomalous upstream response latency or connection reset during edge probe verification.`,
        impactScope: `Affected endpoints on ${incident.monitor.name}. Outage duration spanned from ${incident.startedAt.toLocaleTimeString()} to ${incident.resolvedAt ? incident.resolvedAt.toLocaleTimeString() : "present"}.`,
        detectionMethod: `SteadyStack Multi-Region Consensus Edge Probes flagged consecutive health check failures.`,
        actionItems: `- [ ] Verify upstream service connection limits\n- [ ] Configure automatic edge failover rules\n- [ ] Review PostgreSQL p99 query latency during outage window`,
      },
      similarIncidents,
    };
  } catch (error) {
    console.error("Failed to generate full post-mortem", error);
    return {
      success: false,
      error: "Failed to generate post-mortem synthesis",
    };
  }
}

/**
 * Vectorizes and indexes all existing incidents from the database into Pinecone.
 * Automatically seeds rich historical SRE outage playbooks if the workspace is new.
 */
export async function syncAllIncidentsToPinecone(options?: { seedSamplePlaybooks?: boolean }) {
  const session = await getSafeSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const monitorScope = await getMonitorAccessScope(session.user.id);

  if (!isPineconeConfigured()) {
    return {
      success: false,
      error: "PINECONE_API_KEY is not configured in your environment",
    };
  }

  try {
    // 1. Fetch user's incidents in workspace
    const incidents = await prisma.incident.findMany({
      where: {
        monitor: monitorScope,
      },
      include: {
        postMortem: true,
        monitor: {
          select: {
            name: true,
            url: true,
            userId: true,
            organizationId: true,
          },
        },
      },
      take: 100,
    });

    let indexedCount = 0;

    for (const incident of incidents) {
      const workspaceId = incident.monitor.organizationId || incident.monitor.userId;
      const rootCause =
        incident.postMortem?.rootCause ||
        incident.description ||
        `Outage detected on ${incident.monitor.name}. Telemetry indicated elevated error rates or response timeout.`;

      const res = await indexIncidentPostMortem({
        workspaceId,
        incidentId: incident.id,
        title: incident.title,
        rootCause,
        summary:
          incident.postMortem?.summary ||
          incident.description ||
          `Incident on ${incident.monitor.name}`,
        impactScope: incident.postMortem?.impactScope || "Regional edge probe latency breach",
        actionItems:
          incident.postMortem?.actionItems ||
          "- [ ] Inspect server logs\n- [ ] Verify connection pool",
        detectionMethod: incident.postMortem?.detectionMethod || "SteadyStack Multi-Region Probes",
        status: incident.status,
        monitorName: incident.monitor.name,
        monitorUrl: incident.monitor.url,
        resolvedAt: incident.resolvedAt,
        createdAt: incident.createdAt,
      });

      if (res.success) {
        indexedCount++;
      }
    }

    // 2. If seedSamplePlaybooks is requested or workspace has fewer than 2 incidents, seed realistic SRE historical playbooks into the workspace namespace
    if (options?.seedSamplePlaybooks || indexedCount <= 1) {
      const activeWorkspace = await getActiveWorkspace();
      const workspaceId = activeWorkspace?.id || session.user.id;

      const samplePlaybooks = [
        {
          id: `playbook_502_${Date.now()}`,
          title: "HTTP 502 Bad Gateway & Upstream Connection Saturation",
          rootCause:
            "Upstream Node.js application server exceeded max concurrent connections, triggering socket hang-ups at edge proxy.",
          summary:
            "Customers experienced intermittent 502 responses during traffic surge. Edge probes detected elevated HTTP status 502 across US-East and EU-West regions.",
          impactScope:
            "12% of API requests degraded for 18 minutes across payment and authentication endpoints.",
          actionItems:
            "- [ ] Increased PM2 cluster worker instances from 4 to 8\n- [ ] Configured KeepAliveTimeout to 65s on upstream load balancer\n- [ ] Tuned PostgreSQL connection pool max limit to 50",
          detectionMethod:
            "SteadyStack 2-of-3 Quorum Consensus Probes flagged consecutive 502 responses.",
          monitorName: "Production API Gateway",
          monitorUrl: "https://api.kudoswall.com/v1",
        },
        {
          id: `playbook_ssl_${Date.now()}`,
          title: "SSL/TLS Handshake Failure & Certificate Expiration",
          rootCause:
            "Automated Let's Encrypt renewal cron job failed due to rate limiting on ACME challenge endpoint.",
          summary:
            "Edge nodes failed TLS negotiation on HTTPS endpoints. Browser synthetics flagged SEC_ERROR_EXPIRED_CERTIFICATE.",
          impactScope:
            "All HTTPS traffic rejected across all global regions for 9 minutes until emergency cert rotation.",
          actionItems:
            "- [ ] Migrated to Cloudflare Universal SSL with zero-downtime automated renewal\n- [ ] Added automated alert trigger 14 days prior to certificate expiry",
          detectionMethod:
            "TLS Expiration Sentinel probe alerted 24h prior and triggered HIGH severity.",
          monitorName: "Customer Portal HTTPS",
          monitorUrl: "https://kudoswall.com",
        },
        {
          id: `playbook_pg_pool_${Date.now()}`,
          title: "PostgreSQL Database Connection Pool Exhaustion & Query Latency Spike",
          rootCause:
            "Unindexed analytical query on activity_logs blocked primary write transactions, saturating PgBouncer connection pool.",
          summary:
            "Database query latency jumped from 15ms to >4500ms, causing cascading request timeouts across API handlers.",
          impactScope: "Read and write latency degraded for 25 minutes. 4,200 users impacted.",
          actionItems:
            "- [ ] Created composite index on activity_logs(organization_id, created_at)\n- [ ] Moved heavy reporting queries to read-replica pooler on port 6543\n- [ ] Set statement_timeout = 3000ms on web pooler",
          detectionMethod: "Database latency threshold breached 500ms across 4 probe regions.",
          monitorName: "Database Service",
          monitorUrl: "https://db.kudoswall.com",
        },
        {
          id: `playbook_dns_${Date.now()}`,
          title: "DNS Propagation Delay & Authoritative Nameserver Timeout",
          rootCause:
            "Secondary DNS nameserver experienced BGP route leak, causing NXDOMAIN responses for resolving clients.",
          summary:
            "Intermittent DNS lookup failures observed from European edge nodes. Endpoint appeared DOWN in Frankfurt and London.",
          impactScope: "European clients experienced DNS resolution failures for 14 minutes.",
          actionItems:
            "- [ ] Switched to Anycast DNS with Cloudflare 1.1.1.1 authoritative routing\n- [ ] Lowered TTL from 86400 to 300 during migration window",
          detectionMethod: "Regional DNS Probe detected NXDOMAIN error signature.",
          monitorName: "API DNS Endpoint",
          monitorUrl: "https://api.kudoswall.com",
        },
      ];

      for (const pb of samplePlaybooks) {
        const res = await indexIncidentPostMortem({
          workspaceId,
          incidentId: pb.id,
          title: pb.title,
          rootCause: pb.rootCause,
          summary: pb.summary,
          impactScope: pb.impactScope,
          actionItems: pb.actionItems,
          detectionMethod: pb.detectionMethod,
          status: "RESOLVED",
          monitorName: pb.monitorName,
          monitorUrl: pb.monitorUrl,
          resolvedAt: new Date(),
          createdAt: new Date(Date.now() - 86400000 * 3),
        });
        if (res.success) {
          indexedCount++;
        }
      }
    }

    return {
      success: true,
      count: indexedCount,
      totalFound: incidents.length,
    };
  } catch (error: any) {
    console.error("Failed to sync incidents to Pinecone", error);
    return { success: false, error: error?.message || "Sync failed" };
  }
}

export async function getSimilarIncidentsForIncident(incidentId: string) {
  const session = await getSafeSession();
  if (!session?.user) return { isConfigured: false, matches: [] };

  const monitorScope = await getMonitorAccessScope(session.user.id);
  const isConfigured = isPineconeConfigured();

  if (!isConfigured) {
    return { isConfigured: false, matches: [] };
  }

  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        monitor: monitorScope,
      },
      include: {
        monitor: {
          select: {
            name: true,
            userId: true,
            organizationId: true,
          },
        },
      },
    });

    if (!incident) return { isConfigured: true, matches: [] };

    const workspaceId = incident.monitor.organizationId || incident.monitor.userId;
    const matches = await querySimilarIncidents({
      workspaceId,
      queryText: `${incident.title} ${incident.description || ""}`,
      topK: 5,
    });

    return { isConfigured: true, matches };
  } catch (error) {
    console.warn("Failed to retrieve similar incidents", error);
    return { isConfigured: true, matches: [] };
  }
}

export async function getMonitorEventsDuringIncident(incidentId: string) {
  const session = await getSafeSession();
  if (!session?.user) return [];

  const monitorScope = await getMonitorAccessScope(session.user.id);

  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        monitor: monitorScope,
      },
      select: {
        monitorId: true,
        startedAt: true,
        resolvedAt: true,
      },
    });

    if (!incident) return [];

    const end = incident.resolvedAt || new Date();

    const logs = await prisma.monitorEvent.findMany({
      where: {
        monitorId: incident.monitorId,
        timestamp: {
          gte: incident.startedAt,
          lte: end,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    return logs;
  } catch (error) {
    console.error("Failed to fetch monitor event logs", error);
    return [];
  }
}
