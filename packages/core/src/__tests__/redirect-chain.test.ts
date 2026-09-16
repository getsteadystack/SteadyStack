import { describe, test, expect } from "bun:test";
import { checkHttpUniversal, inspectRedirectChain } from "../index";

/**
 * Redirect chain behavior tests. The SSRF guard forbids loopback/private
 * targets, so redirect mechanics run against httpbin.org (same convention as
 * ssrf-protection.test.ts). SSRF enforcement itself is tested against
 * non-routable metadata addresses.
 */

const HTTPBIN = "https://httpbin.org";

describe("checkHttpUniversal redirect chain", () => {
  test("follows redirects and reports each hop", async () => {
    // /redirect/3 issues 3 chained 302s before landing on /get
    const result = await checkHttpUniversal(`${HTTPBIN}/redirect/3`, { timeoutSeconds: 15 });
    expect(result.status).toBe("UP");
    expect(result.statusCode).toBe(200);
    expect(result.redirectChain).toHaveLength(3);
    expect(result.redirectChain![0]!.url).toBe(`${HTTPBIN}/redirect/3`);
    expect(result.redirectChain![0]!.status).toBe(302);
    expect(result.redirectChain![2]!.location).toBe(`${HTTPBIN}/get`);
  });

  test("reports no redirectChain when the target responds directly", async () => {
    const result = await checkHttpUniversal(`${HTTPBIN}/get`, { timeoutSeconds: 15 });
    expect(result.status).toBe("UP");
    expect(result.redirectChain).toBeUndefined();
  });

  test("detects redirect chains beyond the hop cap", async () => {
    // /redirect/25 issues 25 chained 302s — past the 5-hop platform cap
    const result = await checkHttpUniversal(`${HTTPBIN}/redirect/25`, { timeoutSeconds: 15 });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toContain("TOO_MANY_REDIRECTS");
    expect(result.redirectChain).toHaveLength(5);
  });

  test("includes the hops traveled when a later hop errors", async () => {
    // /redirect-to?url=<relative 404>: hop recorded, final is 404/DOWN
    const result = await checkHttpUniversal(
      `${HTTPBIN}/redirect-to?url=${encodeURIComponent("/status/404")}`,
      { timeoutSeconds: 15 },
    );
    expect(result.status).toBe("DOWN");
    expect(result.statusCode).toBe(404);
    expect(result.redirectChain).toHaveLength(1);
  });

  test("reports bodySizeBytes as the exact received byte count", async () => {
    const result = await checkHttpUniversal(`${HTTPBIN}/bytes/2048`, { timeoutSeconds: 15 });
    expect(result.status).toBe("UP");
    expect(result.bodySizeBytes).toBe(2048);
  });
});

describe("inspectRedirectChain", () => {
  test("traces each hop and the final destination", async () => {
    const result = await inspectRedirectChain(`${HTTPBIN}/redirect/2`, { timeoutSeconds: 15 });
    expect(result.hops).toHaveLength(2);
    expect(result.hops[0]!.status).toBe(302);
    expect(result.hops[1]!.location).toBe(`${HTTPBIN}/get`);
    expect(result.finalUrl).toBe(`${HTTPBIN}/get`);
    expect(result.finalStatus).toBe(200);
    expect(result.errorReason).toBeUndefined();
  });

  test("returns zero hops for a direct response", async () => {
    const result = await inspectRedirectChain(`${HTTPBIN}/get`, { timeoutSeconds: 15 });
    expect(result.hops).toHaveLength(0);
    expect(result.finalStatus).toBe(200);
  });

  test("reports the hop cap with the accumulated hops", async () => {
    const result = await inspectRedirectChain(`${HTTPBIN}/redirect/25`, {
      timeoutSeconds: 15,
      maxHops: 3,
    });
    expect(result.hops).toHaveLength(3);
    expect(result.finalStatus).toBeNull();
    expect(result.errorReason).toContain("TOO_MANY_REDIRECTS");
  });

  test("blocks SSRF targets mid-chain", async () => {
    const result = await inspectRedirectChain("http://169.254.169.254/latest/meta-data/");
    expect(result.finalStatus).toBeNull();
    expect(result.errorReason).toContain("SSRF_PROTECTION");
  });

  test("reports connection errors without throwing", async () => {
    // Documentation-range IP that never routes — expect a connection failure,
    // not an exception.
    const result = await inspectRedirectChain("http://192.0.2.1/", { timeoutSeconds: 3 });
    expect(result.finalStatus).toBeNull();
    expect(result.errorReason).toBeDefined();
  });
});
