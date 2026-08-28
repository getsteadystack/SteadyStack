import { describe, it, expect, mock, afterEach } from "bun:test";
import { resolveDNS } from "./dns-resolver";

const originalFetch = globalThis.fetch;

describe("resolveDNS", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should return the IP address when a valid A record is found", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(
          JSON.stringify({
            Status: 0,
            Answer: [
              { type: 5, data: "cname.example.com" },
              { type: 1, data: "192.168.1.1" },
            ],
          }),
          { status: 200 },
        ),
    );

    const ip = await resolveDNS("example.com");
    expect(ip).toBe("192.168.1.1");
  });

  it("should return null if the HTTP response is not ok", async () => {
    globalThis.fetch = mock(async () => new Response("Internal Server Error", { status: 500 }));

    const ip = await resolveDNS("example.com");
    expect(ip).toBeNull();
  });

  it("should return null if DNS Status is not 0", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(
          JSON.stringify({
            Status: 3, // NXDOMAIN
            Answer: [],
          }),
          { status: 200 },
        ),
    );

    const ip = await resolveDNS("invalid.example.com");
    expect(ip).toBeNull();
  });

  it("should return null if there is no Answer array in the response", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(
          JSON.stringify({
            Status: 0,
          }),
          { status: 200 },
        ),
    );

    const ip = await resolveDNS("example.com");
    expect(ip).toBeNull();
  });

  it("should return null if no A record (type 1) is found in the Answer array", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(
          JSON.stringify({
            Status: 0,
            Answer: [
              { type: 5, data: "cname.example.com" },
              { type: 28, data: "2001:0db8:85a3:0000:0000:8a2e:0370:7334" }, // AAAA record
            ],
          }),
          { status: 200 },
        ),
    );

    const ip = await resolveDNS("example.com");
    expect(ip).toBeNull();
  });

  it("should return null and catch the error if fetch throws a network error", async () => {
    // Suppress console.error during this test to keep output clean
    const originalConsoleError = console.error;
    console.error = mock(() => {});

    globalThis.fetch = mock(async () => {
      throw new Error("Network connection failed");
    });

    const ip = await resolveDNS("example.com");
    expect(ip).toBeNull();

    console.error = originalConsoleError;
  });
});
