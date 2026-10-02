/**
 * OpenAPI 3.1 generation from tRPC router definitions.
 *
 * Zero-dependency: walks the appRouter's `_def.procedures` record and extracts
 * zod schemas (`inputs[]` / `output`) into OpenAPI request/response bodies via
 * zod v4's `z.toJSONSchema()`. The output documents the *same* surfaces the
 * dashboard's tRPC client calls at /api/trpc, so the generated spec can never
 * drift from the router without breaking this file's tests.
 *
 * Metadata: procedures carry `meta` via our factories in index.ts
 * (`publicProcedure` → no auth, `protectedProcedure`/`rateLimitedProcedure`
 * → `auth: "session"`). Router authors can enrich docs per-procedure by
 * chaining `.meta({ description: "..." })` in the router definition.
 *
 * tRPC v11 internals used (verified against @trpc/server 11.x):
 * - `router._def.procedures` is a Record<string, Procedure> with dotted keys
 *   for nested routers (e.g. "team.listMembers").
 * - `procedure._def.inputs` is the array of zod input parsers (merged).
 * - `procedure._def.output` is the zod output parser, present only when
 *   `.output()` was chained explicitly.
 */

import { z } from "zod";

interface ProcedureMeta {
  auth?: "public" | "session";
  rateLimited?: boolean;
  description?: string;
}

interface ProcedureDef {
  inputs?: unknown[];
  output?: unknown;
  meta?: ProcedureMeta;
  type?: string;
}

/** Loose structural type of a tRPC v11 router's internals. */
interface RouterLike {
  _def: {
    procedures: Record<string, unknown>;
  };
  [key: string]: unknown;
}

interface JsonSchemaObject {
  type?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  $ref?: string;
  items?: unknown;
  enum?: unknown[];
  [key: string]: unknown;
}

function unwrapZod(schema: unknown): z.ZodType | undefined {
  if (schema instanceof z.ZodType) return schema;
  if (
    schema &&
    typeof schema === "object" &&
    "safeParse" in schema &&
    typeof (schema as { safeParse?: unknown }).safeParse === "function"
  ) {
    return schema as z.ZodType;
  }
  return undefined;
}

/** Convert a zod schema to a JSON-safe OpenAPI schema object. */
function zodToOpenApi(schema: z.ZodType): JsonSchemaObject {
  try {
    // zod v4 native JSON Schema conversion (io: "input" documents what callers send).
    return z.toJSONSchema(schema, { io: "input" }) as JsonSchemaObject;
  } catch {
    // Schemas zod can't express (transforms etc.) degrade to a permissive object.
    return { type: "object", additionalProperties: true };
  }
}

export interface TrpcOpenApiOptions {
  title?: string;
  version?: string;
  description?: string;
}

/**
 * Generate an OpenAPI 3.1 paths fragment for a tRPC router.
 *
 * Each procedure becomes `POST /trpc/{qualifiedName}`: tRPC v11 clients call
 * procedures via HTTP POST (query or mutation alike), so POST documents the
 * actual wire behavior.
 */
export function generateTrpcOpenApi(
  appRouter: RouterLike,
  _options: TrpcOpenApiOptions = {},
): {
  paths: Record<string, unknown>;
} {
  const paths: Record<string, unknown> = {};

  const procedures = appRouter._def.procedures ?? {};
  for (const [qualified, proc] of Object.entries(procedures)) {
    const def = ((proc as { _def?: ProcedureDef })?._def ?? {}) as ProcedureDef;

    const inputZod = (def.inputs ?? []).map(unwrapZod).find(Boolean);
    const outputZod = unwrapZod(def.output);

    const requestBody =
      inputZod && !(inputZod instanceof z.ZodUndefined)
        ? {
            required: !(inputZod instanceof z.ZodOptional),
            content: {
              "application/json": {
                schema: zodToOpenApi(inputZod),
              },
            },
          }
        : undefined;

    const responseSchema = outputZod
      ? zodToOpenApi(outputZod)
      : { type: "object", additionalProperties: true };

    const isProtected = def.meta?.auth === "session";
    const summary = def.meta?.rateLimited ? `${qualified} (rate-limited)` : qualified;

    paths[`/trpc/${qualified}`] = {
      post: {
        tags: ["tRPC"],
        summary,
        ...(def.meta?.description ? { description: def.meta.description } : {}),
        operationId: `trpc_${qualified.replaceAll(".", "_")}`,
        security: isProtected ? [{ sessionCookie: [] }] : [],
        ...(requestBody ? { requestBody } : {}),
        responses: {
          "200": {
            description: isProtected
              ? "Procedure result (session-authenticated)"
              : "Procedure result",
            content: {
              "application/json": {
                schema: responseSchema,
              },
            },
          },
          "401": { description: "Session required (protected procedure)" },
          "429": {
            description: "Rate limit exceeded (100 calls/min per user per procedure)",
          },
        },
      },
    };
  }

  return { paths };
}
