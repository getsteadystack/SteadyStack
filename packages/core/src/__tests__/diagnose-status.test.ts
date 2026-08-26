import { describe, test, expect } from "bun:test";
import { diagnoseStatus } from "../index";

describe("Core diagnoseStatus formatting", () => {
  const target = "https://example.com";

  test("formats 502 Bad Gateway correctly", () => {
    const result = diagnoseStatus(502, target);
    expect(result).toContain("HTTP_502: Bad Gateway.");
    expect(result).toContain(`• Target: ${target}`);
    expect(result).toContain("• Stage: Proxy Upstream");
    expect(result).toContain("• Diagnostics: The proxy server (e.g. Cloudflare, Nginx, ALB) received an invalid response from the backend application process.");
    expect(result).toContain("• Action: Check if the application server process (e.g. PM2, Docker container) crashed, failed to start, or returned malformed headers.");
  });

  test("formats 504 Gateway Timeout correctly", () => {
    const result = diagnoseStatus(504, target);
    expect(result).toContain("HTTP_504: Gateway Timeout.");
    expect(result).toContain(`• Target: ${target}`);
    expect(result).toContain("• Stage: Proxy Upstream");
    expect(result).toContain("• Diagnostics: The gateway server timed out waiting for the upstream application server to respond.");
    expect(result).toContain("• Action: Investigate slow application handlers, database latency spikes, or infinite process loops.");
  });

  test("formats 500 Internal Server Error correctly", () => {
    const result = diagnoseStatus(500, target);
    expect(result).toContain("HTTP_500: Internal Server Error.");
    expect(result).toContain(`• Target: ${target}`);
    expect(result).toContain("• Stage: Application Execution");
    expect(result).toContain("• Diagnostics: The server encountered an unhandled exception or critical runtime crash while rendering the request.");
    expect(result).toContain("• Action: Inspect your application server runtime logs for unhandled exceptions or stack traces.");
  });

  test("formats 503 Service Unavailable correctly", () => {
    const result = diagnoseStatus(503, target);
    expect(result).toContain("HTTP_503: Service Unavailable.");
    expect(result).toContain(`• Target: ${target}`);
    expect(result).toContain("• Stage: Server Availability");
    expect(result).toContain("• Diagnostics: The server is temporarily overloaded or down for planned maintenance.");
    expect(result).toContain("• Action: Monitor RAM/CPU utilization and verify if a server deploy is in progress.");
  });

  test("formats 404 Not Found correctly", () => {
    const result = diagnoseStatus(404, target);
    expect(result).toContain("HTTP_404: Not Found.");
    expect(result).toContain(`• Target: ${target}`);
    expect(result).toContain("• Stage: Resource Routing");
    expect(result).toContain("• Diagnostics: The server is online, but the requested URI path does not map to any active routes.");
    expect(result).toContain("• Action: Double check that the request path is configured correctly in the client and server route files.");
  });

  test("formats unrecognized statuses with generic fallback", () => {
    const result400 = diagnoseStatus(400, target);
    expect(result400).toContain("HTTP_400: Unhealthy Status Code.");
    expect(result400).toContain(`• Target: ${target}`);
    expect(result400).toContain("• Stage: HTTP Handshake");
    expect(result400).toContain("• Diagnostics: The request completed, but the status code was classified as unhealthy.");
    expect(result400).toContain("• Action: Verify server endpoint routing logic.");

    const result501 = diagnoseStatus(501, target);
    expect(result501).toContain("HTTP_501: Unhealthy Status Code.");
    expect(result501).toContain(`• Target: ${target}`);
  });
});
