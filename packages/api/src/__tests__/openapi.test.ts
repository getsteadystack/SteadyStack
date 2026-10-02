import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { generateTrpcOpenApi } from "../openapi";
import { appRouter } from "../routers";

/**
 * These tests are the drift guard for the generated tRPC section of the
 * OpenAPI document: if a procedure is renamed, added, or its schema changes
 * shape, they fail — and the served /docs/api/openapi.json stays honest.
 */

function schemaFor(paths: Record<string, any>, path: string, what: "request" | "response") {
  const op = paths[path]?.post;
  if (!op) return undefined;
  if (what === "request") return op.requestBody?.content?.["application/json"]?.schema;
  return op.responses?.["200"]?.content?.["application/json"]?.schema;
}

describe("generateTrpcOpenApi", () => {
  test("walks the full router tree and finds every procedure", () => {
    const { paths } = generateTrpcOpenApi(appRouter as any);

    expect(Object.keys(paths).sort()).toEqual([
      "/trpc/healthCheck",
      "/trpc/privateData",
      "/trpc/team.cancelInvitation",
      "/trpc/team.listAuditLogs",
      "/trpc/team.listMembers",
      "/trpc/team.listOrganizations",
      "/trpc/team.removeMember",
      "/trpc/team.updateMemberRole",
    ]);
  });

  test("public vs protected security follows the procedure factory", () => {
    const { paths } = generateTrpcOpenApi(appRouter as any);

    // publicProcedure → no security requirement
    expect(paths["/trpc/healthCheck"].post.security).toEqual([]);

    // protectedProcedure / rateLimitedProcedure → session cookie
    expect(paths["/trpc/privateData"].post.security).toEqual([{ sessionCookie: [] }]);
    expect(paths["/trpc/team.updateMemberRole"].post.security).toEqual([{ sessionCookie: [] }]);
    // rateLimitedProcedure adds the 429 note in its summary
    expect(paths["/trpc/team.updateMemberRole"].post.summary).toContain("rate-limited");
  });

  test("input zod schemas become request bodies", () => {
    const { paths } = generateTrpcOpenApi(appRouter as any);

    const body = schemaFor(paths, "/trpc/team.listMembers", "request");
    expect(body).toBeDefined();
    // listMembers input: { organizationId: string }
    expect(body.properties.organizationId).toBeDefined();
    expect(body.required).toContain("organizationId");
  });

  test("query procedures without input have no requestBody", () => {
    const { paths } = generateTrpcOpenApi(appRouter as any);
    expect(paths["/trpc/healthCheck"].post.requestBody).toBeUndefined();
  });

  test("procedures without explicit .output() get a permissive response schema", () => {
    const { paths } = generateTrpcOpenApi(appRouter as any);

    const response = schemaFor(paths, "/trpc/healthCheck", "response");
    expect(response).toBeDefined();
    expect(response.type).toBe("object");
    expect(response.additionalProperties).toBe(true);
  });

  test("enum constraints survive conversion", () => {
    const { paths } = generateTrpcOpenApi(appRouter as any);

    const body = schemaFor(paths, "/trpc/team.updateMemberRole", "request");
    const role = body.properties.role;
    expect(role.enum ?? role.anyOf?.[0]?.enum ?? role.$ref).toBeDefined();
  });

  test("explicit .output() schemas become response schemas", () => {
    // Mini-router exercising the .output() path (none of the app routers set it yet).
    const { initTRPC } = require("@trpc/server");
    const { router, publicProcedure } = require("../index");
    const t = initTRPC.context<unknown>().create();
    void router;
    void publicProcedure;
    const testRouter = t.router({
      echo: t.procedure
        .input(z.object({ msg: z.string() }))
        .output(z.object({ said: z.string() }))
        .query(() => ({ said: "x" })),
    });

    const { paths } = generateTrpcOpenApi(testRouter as any);
    const response = schemaFor(paths, "/trpc/echo", "response");
    expect(response.properties.said).toBeDefined();
  });
});
