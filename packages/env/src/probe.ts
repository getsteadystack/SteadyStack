import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    STEADYSTACK_API_URL: z.string().url().default("https://steadystack-worker.example.com"),
    STEADYSTACK_PROBE_TOKEN: z.string().min(1),
    PROBE_POLL_INTERVAL: z.coerce.number().int().positive().default(15),
    PROBE_HEARTBEAT_INTERVAL: z.coerce.number().int().positive().default(30),
    PROBE_REGION: z.string().default("private"),
    PROBE_CONCURRENCY: z.coerce.number().int().positive().default(5),
    /** Platform encryption secret — required to decrypt encrypted monitor config (headers, mTLS certs). */
    ENCRYPTION_SECRET: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  onValidationError: (issues) => {
    const formatted = (issues || [])
      .map((issue) => `  - ${issue.path ? issue.path.join(".") : "variable"}: ${issue.message}`)
      .join("\n");
    console.error("❌ Invalid probe environment variables:\n" + formatted);
    throw new Error("Invalid probe environment variables:\n" + formatted);
  },
});
