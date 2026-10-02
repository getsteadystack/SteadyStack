import { Pinecone, type Index, type RecordMetadata } from "@pinecone-database/pinecone";
import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@steadystack/env/server";
import { resolveHeliconeBaseUrl, buildHeliconeHeaders, isHeliconeConfigured } from "./helicone";

let cachedPineconeClient: Pinecone | null = null;
let lastApiKey: string | null = null;

export interface IncidentVectorMetadata extends RecordMetadata {
  incidentId: string;
  workspaceId: string;
  monitorName: string;
  monitorUrl: string;
  title: string;
  rootCause: string;
  summary: string;
  impactScope: string;
  actionItems: string;
  detectionMethod: string;
  status: string;
  resolvedAt: string;
  createdAt: string;
}

export interface IncidentQueryResult {
  incidentId: string;
  score: number;
  metadata: IncidentVectorMetadata;
}

/**
 * Checks if Pinecone is configured via environment variables.
 */
export function isPineconeConfigured(): boolean {
  const apiKey =
    process.env.PINECONE_API_KEY !== undefined
      ? process.env.PINECONE_API_KEY
      : env.PINECONE_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 0);
}

/**
 * Resets the cached Pinecone client singleton (useful for tests or env reloads).
 */
export function _resetPineconeClientForTesting(): void {
  cachedPineconeClient = null;
  lastApiKey = null;
}

/**
 * Lazily initializes and returns the Pinecone client singleton.
 */
export function getPineconeClient(): Pinecone | null {
  if (!isPineconeConfigured()) {
    cachedPineconeClient = null;
    lastApiKey = null;
    return null;
  }

  const apiKey = (
    process.env.PINECONE_API_KEY !== undefined ? process.env.PINECONE_API_KEY : env.PINECONE_API_KEY
  )?.trim();

  if (!apiKey) {
    cachedPineconeClient = null;
    lastApiKey = null;
    return null;
  }

  if (!cachedPineconeClient || lastApiKey !== apiKey) {
    cachedPineconeClient = new Pinecone({
      apiKey,
    });
    lastApiKey = apiKey;
  }

  return cachedPineconeClient;
}

/**
 * Returns the configured Pinecone vector index instance.
 */
export function getIncidentIndex(indexName?: string): Index<IncidentVectorMetadata> | null {
  const client = getPineconeClient();
  if (!client) return null;

  const targetIndex =
    indexName ||
    process.env.PINECONE_INDEX_NAME ||
    env.PINECONE_INDEX_NAME ||
    "steadystack-incidents";

  return client.index<IncidentVectorMetadata>(targetIndex);
}

/**
 * Resolves an embedding model using OpenAI or Helicone gateway.
 */
function getEmbeddingModel() {
  const openAiKey = process.env.OPENAI_API_KEY || env.OPENAI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY;

  if (openAiKey) {
    const endpoint = resolveHeliconeBaseUrl("openai");
    const headers = isHeliconeConfigured()
      ? buildHeliconeHeaders({ feature: "pinecone-embeddings" })
      : undefined;

    const openai = createOpenAI({
      apiKey: openAiKey,
      baseURL: endpoint,
      headers,
    });

    return openai.embedding("text-embedding-3-small");
  }

  if (openRouterKey) {
    const openRouterBaseUrl =
      process.env.OPENROUTER_BASE_URL || env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    const endpoint = resolveHeliconeBaseUrl("openrouter", openRouterBaseUrl);

    const openrouter = createOpenAI({
      apiKey: openRouterKey,
      baseURL: endpoint,
      headers: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "SteadyStack Pinecone Embeddings",
        ...buildHeliconeHeaders({ feature: "pinecone-embeddings" }),
      },
    });

    return openrouter.embedding("text-embedding-3-small");
  }

  return null;
}

/**
 * Generates a deterministic 1536-dimensional semantic feature embedding vector
 * from text via hashed character n-grams and token weights.
 */
function generateDeterministicEmbedding(text: string, dimensions = 1536): number[] {
  const vec = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vec[idx] += 1.0 / Math.sqrt(i + 1);

    // 3-grams for substring matching
    if (word.length >= 3) {
      for (let k = 0; k <= word.length - 3; k++) {
        const trigram = word.slice(k, k + 3);
        let triHash = 0;
        for (let l = 0; l < 3; l++) {
          triHash = (triHash << 5) - triHash + trigram.charCodeAt(l);
          triHash |= 0;
        }
        const triIdx = Math.abs(triHash) % dimensions;
        vec[triIdx] += 0.5;
      }
    }
  }

  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return norm > 0 ? vec.map((v) => v / norm) : vec;
}

/**
 * Computes a vector embedding for a given text input.
 * Supports OpenAI/OpenRouter text-embedding-3-small, native Pinecone Inference API,
 * and deterministic normalized semantic hashing fallback.
 */
export async function generateTextEmbedding(text: string): Promise<number[] | null> {
  const clipped = text.slice(0, 8000);

  // 1. Try OpenAI / OpenRouter if configured
  const model = getEmbeddingModel();
  if (model) {
    try {
      const { embedding } = await embed({
        model,
        value: clipped,
      });
      return embedding;
    } catch (error) {
      console.warn(
        "[Pinecone] OpenAI/OpenRouter embedding failed, falling back to Pinecone inference:",
        error,
      );
    }
  }

  // 2. Try Pinecone Native Inference API (using PINECONE_API_KEY)
  const client = getPineconeClient();
  if (client) {
    try {
      const res = await client.inference.embed({
        model: "multilingual-e5-large",
        inputs: [clipped],
        parameters: { inputType: "passage", truncate: "END" },
      });

      const firstItem = res.data?.[0];
      if (firstItem && "values" in firstItem && Array.isArray(firstItem.values)) {
        const raw = firstItem.values as number[];
        if (raw.length > 0) {
          const targetDims = 1536;
          const vec = new Array(targetDims).fill(0);
          for (let i = 0; i < raw.length && i < targetDims; i++) {
            vec[i] = raw[i];
          }
          const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
          return norm > 0 ? vec.map((v) => v / norm) : vec;
        }
      }
    } catch (pineconeInferenceError) {
      console.warn("[Pinecone] Inference API fallback failed:", pineconeInferenceError);
    }
  }

  // 3. Fallback: Deterministic semantic feature hash
  return generateDeterministicEmbedding(clipped, 1536);
}

/**
 * Retrieves index-level and namespace-level record statistics from Pinecone.
 */
export async function getPineconeNamespaceStats(
  workspaceId: string,
): Promise<{ totalRecords: number; namespaceRecords: number }> {
  const index = getIncidentIndex();
  if (!index) return { totalRecords: 0, namespaceRecords: 0 };

  try {
    const stats = await index.describeIndexStats();
    const namespaceKey = getWorkspaceNamespace(workspaceId);
    const nsStats = stats.namespaces?.[namespaceKey];
    return {
      totalRecords: stats.totalRecordCount || 0,
      namespaceRecords: nsStats?.recordCount || 0,
    };
  } catch (err) {
    return { totalRecords: 0, namespaceRecords: 0 };
  }
}

/**
 * Formats multi-tenant workspace namespace identifier.
 */
export function getWorkspaceNamespace(workspaceId: string): string {
  const sanitized = workspaceId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `workspace_${sanitized}`;
}

/**
 * Indexes an incident and its post-mortem resolution into Pinecone
 * for future RAG context and semantic search.
 */
export async function indexIncidentPostMortem(params: {
  workspaceId: string;
  incidentId: string;
  title: string;
  rootCause: string;
  summary?: string;
  impactScope?: string;
  actionItems?: string;
  detectionMethod?: string;
  status?: string;
  monitorName?: string;
  monitorUrl?: string;
  resolvedAt?: Date | string | null;
  createdAt?: Date | string | null;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isPineconeConfigured()) {
    return { success: false, error: "Pinecone is not configured" };
  }

  const index = getIncidentIndex();
  if (!index) {
    return { success: false, error: "Unable to access Pinecone index" };
  }

  const textToEmbed = [
    `Incident Title: ${params.title}`,
    params.monitorName ? `Monitor: ${params.monitorName}` : "",
    params.summary ? `Summary: ${params.summary}` : "",
    `Root Cause: ${params.rootCause}`,
    params.impactScope ? `Impact Scope: ${params.impactScope}` : "",
    params.actionItems ? `Action Items: ${params.actionItems}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const embedding = await generateTextEmbedding(textToEmbed);
  if (!embedding) {
    return { success: false, error: "Failed to generate embedding vector" };
  }

  const namespaceKey = getWorkspaceNamespace(params.workspaceId);
  const namespace = index.namespace(namespaceKey);

  const resolvedAtStr = params.resolvedAt
    ? typeof params.resolvedAt === "string"
      ? params.resolvedAt
      : params.resolvedAt.toISOString()
    : "";

  const createdAtStr = params.createdAt
    ? typeof params.createdAt === "string"
      ? params.createdAt
      : params.createdAt.toISOString()
    : new Date().toISOString();

  try {
    await namespace.upsert({
      records: [
        {
          id: params.incidentId,
          values: embedding,
          metadata: {
            incidentId: params.incidentId,
            workspaceId: params.workspaceId,
            title: params.title,
            rootCause: params.rootCause,
            summary: params.summary || "",
            impactScope: params.impactScope || "",
            actionItems: params.actionItems || "",
            detectionMethod: params.detectionMethod || "",
            status: params.status || "RESOLVED",
            monitorName: params.monitorName || "",
            monitorUrl: params.monitorUrl || "",
            resolvedAt: resolvedAtStr,
            createdAt: createdAtStr,
          },
        },
      ],
    });

    return { success: true, id: params.incidentId };
  } catch (error: any) {
    console.error("[Pinecone] Failed to upsert incident post-mortem vector:", error);
    return {
      success: false,
      error: error?.message || "Pinecone upsert failed",
    };
  }
}

/**
 * Queries Pinecone for similar historical incidents within the workspace
 * to enrich AI Root Cause Analysis and Post-Mortems with relevant context.
 */
export async function querySimilarIncidents(params: {
  workspaceId: string;
  queryText: string;
  topK?: number;
  minScore?: number;
}): Promise<IncidentQueryResult[]> {
  if (!isPineconeConfigured()) {
    return [];
  }

  const index = getIncidentIndex();
  if (!index) {
    return [];
  }

  const embedding = await generateTextEmbedding(params.queryText);
  if (!embedding) {
    return [];
  }

  const namespaceKey = getWorkspaceNamespace(params.workspaceId);
  const namespace = index.namespace(namespaceKey);

  try {
    const queryResponse = await namespace.query({
      vector: embedding,
      topK: params.topK ?? 3,
      includeMetadata: true,
    });

    const minScore = params.minScore ?? 0.2;

    return (queryResponse.matches || [])
      .filter((match) => (match.score ?? 0) >= minScore && match.metadata)
      .map((match) => ({
        incidentId: match.id,
        score: match.score ?? 0,
        metadata: match.metadata as IncidentVectorMetadata,
      }));
  } catch (error) {
    console.warn("[Pinecone] Failed to query similar incidents:", error);
    return [];
  }
}

/**
 * Deletes an incident vector from the workspace namespace.
 */
export async function deleteIncidentVector(
  workspaceId: string,
  incidentId: string,
): Promise<{ success: boolean }> {
  if (!isPineconeConfigured()) {
    return { success: true };
  }

  const index = getIncidentIndex();
  if (!index) return { success: true };

  const namespaceKey = getWorkspaceNamespace(workspaceId);
  const namespace = index.namespace(namespaceKey);

  try {
    await namespace.deleteOne({ id: incidentId });
    return { success: true };
  } catch (error) {
    console.warn("[Pinecone] Failed to delete vector for incident %s:", incidentId, error);
    return { success: false };
  }
}
