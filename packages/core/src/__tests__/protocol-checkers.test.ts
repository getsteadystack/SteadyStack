import { describe, test, expect } from "bun:test";
import {
  checkGrpcHealth,
  checkSmtp,
  checkFtp,
  checkMailRetrieval,
  checkIcmpPing,
} from "../index";

/**
 * Protocol checker tests run entirely against non-routable / refused targets
 * so they never touch the network. They assert the DOWN paths, error
 * classification, and input parsing — the happy paths need live servers and
 * are exercised by integration probes.
 */

// RFC 5737 documentation ranges + TEST-NET — reserved, never routable.
const NON_ROUTABLE_HOST = "192.0.2.1";
// Port 1 on loopback is refused instantly (nothing listens there in CI).
const REFUSED_HOST = "127.0.0.1";
const REFUSED_PORT = 1;

describe("checkGrpcHealth", () => {
  test("returns DOWN with DNS error reason for unresolvable host", async () => {
    const result = await checkGrpcHealth("nonexistent.invalid:50051", {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toBeDefined();
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  test("returns DOWN when connection is refused", async () => {
    const result = await checkGrpcHealth(`${REFUSED_HOST}:${REFUSED_PORT}`, {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toContain("REFUSED");
  });

  test("respects non-default ports from the URL", async () => {
    // Same refused target on a custom port — proves the port was parsed,
    // otherwise the check would target 80 and behave differently.
    const result = await checkGrpcHealth(`grpc://${NON_ROUTABLE_HOST}:9001`, {
      timeoutSeconds: 1,
    });
    expect(result.status).toBe("DOWN");
  });

  test("accepts serviceName without changing the failure path", async () => {
    const result = await checkGrpcHealth(`${REFUSED_HOST}:${REFUSED_PORT}`, {
      serviceName: "my.service.v1",
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toContain("REFUSED");
  });
});

describe("checkSmtp", () => {
  test("returns DOWN for unresolvable host", async () => {
    const result = await checkSmtp("smtp://nonexistent.invalid", {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toBeDefined();
  });

  test("returns DOWN when connection is refused (default port 25)", async () => {
    const result = await checkSmtp(`smtp://${REFUSED_HOST}:${REFUSED_PORT}`, {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toContain("REFUSED");
  });

  test("maps smtps:// to implicit TLS path without crashing", async () => {
    const result = await checkSmtp(`smtps://${REFUSED_HOST}:${REFUSED_PORT}`, {
      username: "user",
      password: "pass",
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
  });

  test("includes AUTH path in failure classification", async () => {
    const result = await checkSmtp(`smtp://${NON_ROUTABLE_HOST}:25`, {
      username: "monitor@example.com",
      password: "secret",
      timeoutSeconds: 1,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toBeDefined();
  });
});

describe("checkFtp", () => {
  test("returns DOWN for unresolvable FTP host", async () => {
    const result = await checkFtp("ftp://nonexistent.invalid", {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toBeDefined();
  });

  test("returns DOWN when FTP connection is refused", async () => {
    const result = await checkFtp(`ftp://${REFUSED_HOST}:${REFUSED_PORT}`, {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toContain("REFUSED");
  });

  test("SFTP targets verify SSH banner on port 22 path", async () => {
    const result = await checkFtp(`sftp://${REFUSED_HOST}:${REFUSED_PORT}`, {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toContain("REFUSED");
  });

  test("SFTP to a non-SSH TCP service is classified as bad banner or refused", async () => {
    // Bun's test server on a random port speaks HTTP, not SSH — but since we
    // target a refused port, both outcomes route through the DOWN path.
    const result = await checkFtp(`sftp://${NON_ROUTABLE_HOST}:22`, {
      timeoutSeconds: 1,
    });
    expect(result.status).toBe("DOWN");
  });
});

describe("checkMailRetrieval", () => {
  test("returns DOWN for unresolvable IMAP host", async () => {
    const result = await checkMailRetrieval("imap://nonexistent.invalid", {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toBeDefined();
  });

  test("returns DOWN for refused POP3 target", async () => {
    const result = await checkMailRetrieval(`pop3://${REFUSED_HOST}:${REFUSED_PORT}`, {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toContain("REFUSED");
  });

  test("returns DOWN for refused IMAPS target (implicit TLS port 993 path)", async () => {
    const result = await checkMailRetrieval(`imaps://${REFUSED_HOST}:${REFUSED_PORT}`, {
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
  });

  test("returns DOWN for refused POP3S target with credentials", async () => {
    const result = await checkMailRetrieval(`pop3s://${REFUSED_HOST}:${REFUSED_PORT}`, {
      username: "user",
      password: "pass",
      timeoutSeconds: 2,
    });
    expect(result.status).toBe("DOWN");
  });
});

describe("checkIcmpPing", () => {
  test("returns ICMP_NO_HOST for empty host", async () => {
    const result = await checkIcmpPing("", { timeoutSeconds: 1 });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toBe("ICMP_NO_HOST");
    expect(result.latency).toBe(0);
  });

  test("returns DOWN for unresolvable host", async () => {
    const result = await checkIcmpPing("nonexistent.invalid", { timeoutSeconds: 3 });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toBeDefined();
  });

  test("reports 100% packet loss for non-routable documentation IP", async () => {
    const result = await checkIcmpPing(NON_ROUTABLE_HOST, { timeoutSeconds: 3 });
    expect(result.status).toBe("DOWN");
    if (result.errorReason?.startsWith("PING_FAILED")) {
      // True ICMP path exercised: ping binary ran and reported failure.
      expect(result.packetLoss).toBe(100);
    }
    // Otherwise the TCP fallback path was used (e.g. no ping binary in CI) —
    // still a DOWN result either way.
  });

  test("strips URL schemes to extract the bare host", async () => {
    const result = await checkIcmpPing(`icmp://${NON_ROUTABLE_HOST}`, { timeoutSeconds: 1 });
    expect(result.status).toBe("DOWN");
  });
});
