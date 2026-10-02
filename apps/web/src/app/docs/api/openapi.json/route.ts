import { NextResponse } from "next/server";
import { appRouter } from "@steadystack/api/routers";
import { generateTrpcOpenApi } from "@steadystack/api/openapi";
import { buildOpenApiSpec } from "@/lib/api/openapi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Full OpenAPI document: hand-maintained REST surface (REST + CLI + v1) plus
 * the tRPC section generated from the router definitions at request time, so
 * the two can never drift apart.
 */
export async function GET() {
  let spec;
  try {
    const trpcFragment = generateTrpcOpenApi(appRouter as never);
    spec = buildOpenApiSpec(trpcFragment);
  } catch {
    // Router introspection is best-effort — fall back to the static surface.
    spec = buildOpenApiSpec();
  }

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
