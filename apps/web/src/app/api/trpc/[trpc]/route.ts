import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@steadystack/api/context";
import { appRouter } from "@steadystack/api/routers";
import type { NextRequest } from "next/server";

/**
 * tRPC HTTP endpoint — serves the dashboard's typed client (see
 * `src/utils/trpc.ts`, which posts to /api/trpc).
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });

export { handler as GET, handler as POST };
